<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from '../store/search/search.store'
import { useAppStore } from '../store/app/app.store'
import { ServiceFactory } from '../services/factory/serviceFactory'
import type { GitHubRepositoryData } from '../repositories/interfaces/iGitHubRepository'
import type { Contributor } from '../types/auth'
import StatCard from '../components/StatCard.vue'
import ContributorList from '../components/ContributorList.vue'
import ReadmeViewer from '../components/ReadmeViewer.vue'
import Badge from '../components/Badge.vue'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const appStore = useAppStore()

const repositoryService = ServiceFactory.getInstance().createRepositoryService()
const repository = ref<GitHubRepositoryData | null>(null)
const readme = ref<string | null>(null)
const contributors = ref<Contributor[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'readme' | 'contributors' | 'details'>('readme')

const owner = computed(() => route.params.owner as string)
const repo = computed(() => route.params.repo as string)

const repositoryUrl = computed(() =>
  repository.value ? `https://github.com/${owner.value}/${repo.value}` : ''
)

const createdDate = computed(() =>
  repository.value?.created_at ? new Date(repository.value.created_at).toLocaleDateString() : ''
)

const updatedDate = computed(() =>
  repository.value?.updated_at ? new Date(repository.value.updated_at).toLocaleDateString() : ''
)

const repositorySize = computed(() => {
  const size = (repository.value as any)?.size
  if (!size) return '0 KB'
  if (size < 1024) return `${size} KB`
  return `${(size / 1024).toFixed(1)} MB`
})

const cloneUrl = computed(() => 
  repository.value ? `https://github.com/${repository.value.full_name}.git` : ''
)

const loadRepositoryDetails = async (): Promise<void> => {
  try {
    isLoading.value = true
    error.value = null

    // Load repository details
    const repoData = await repositoryService.getRepositoryDetails(owner.value, repo.value)
    if (!repoData) {
      throw new Error('Repository not found')
    }
    repository.value = repoData

    // Load README and contributors in parallel
    const [readmeData, contributorsData] = await Promise.allSettled([
      repositoryService.getRepositoryReadme(owner.value, repo.value),
      repositoryService.getRepositoryContributors(owner.value, repo.value)
    ])

    if (readmeData.status === 'fulfilled') {
      readme.value = readmeData.value
    }

    if (contributorsData.status === 'fulfilled') {
      contributors.value = contributorsData.value as Contributor[]
    }

    // Update rate limit info
    const rateLimitInfo = await repositoryService.getRateLimit()
    appStore.updateRateLimit(rateLimitInfo.remaining, rateLimitInfo.limit, rateLimitInfo.resetTime)
  } catch (err: any) {
    error.value = err.message || 'Failed to load repository details'
    console.error('Repository detail error:', err)
  } finally {
    isLoading.value = false
  }
}

const handleBackToSearch = (): void => {
  if (searchStore.hasResults) {
    router.push({ name: 'search', query: route.query })
  } else {
    router.push({ name: 'search' })
  }
}

const openInGitHub = (): void => {
  if (repositoryUrl.value) {
    window.open(repositoryUrl.value, '_blank')
  }
}

const setActiveTab = (tab: 'readme' | 'contributors' | 'details'): void => {
  activeTab.value = tab
}

const getLanguageColor = (language: string): string => {
  const languageColors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Shell: '#89e051',
    Vue: '#4FC08D',
    React: '#61DAFB'
  }
  return languageColors[language] || '#586069'
}

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

// Watch for route changes
watch(
  [owner, repo],
  () => {
    loadRepositoryDetails()
  },
  { immediate: false }
)

onMounted(() => {
  loadRepositoryDetails()
})
</script>

<template>
  <div class="repository-detail-view">
    <!-- Header -->
    <div class="container-fluid bg-white border-bottom">
      <div class="container py-3">
        <div class="row align-items-center">
          <div class="col-md-8">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-2">
                <li class="breadcrumb-item">
                  <button class="btn btn-link p-0 text-decoration-none" @click="handleBackToSearch">
                    <i class="bi bi-arrow-left me-1"></i>
                    Back to Search
                  </button>
                </li>
                <li class="breadcrumb-item active" aria-current="page">{{ owner }} / {{ repo }}</li>
              </ol>
            </nav>
          </div>
          <div class="col-md-4 text-md-end">
            <button v-if="repositoryUrl" class="btn btn-outline-primary" @click="openInGitHub">
              <i class="bi bi-github me-1"></i>
              View on GitHub
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="container py-5">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading repository...</span>
        </div>
        <p class="text-muted">Loading repository details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error Loading Repository</h4>
        <p>{{ error }}</p>
        <hr />
        <div class="d-flex gap-2">
          <button class="btn btn-outline-danger" @click="loadRepositoryDetails">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Try Again
          </button>
          <button class="btn btn-secondary" @click="handleBackToSearch">
            <i class="bi bi-arrow-left me-1"></i>
            Back to Search
          </button>
        </div>
      </div>
    </div>

    <!-- Repository Content -->
    <div v-else-if="repository" class="container py-4">
      <!-- Repository Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex align-items-start gap-3 mb-3">
            <img
              :src="repository.owner?.avatar_url"
              :alt="repository.owner?.login"
              class="rounded-circle"
              width="64"
              height="64"
            />
            <div class="flex-grow-1">
              <h1 class="h2 mb-2">
                <span class="text-muted">{{ repository.owner?.login }} /</span>
                <strong>{{ repository.name }}</strong>
              </h1>
              <p v-if="repository.description" class="text-muted mb-2">
                {{ repository.description }}
              </p>
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <Badge
                  v-if="repository.language"
                  :text="repository.language"
                  :color="getLanguageColor(repository.language)"
                  variant="language"
                />
                <Badge
                  v-if="(repository as any).license?.name"
                  :text="(repository as any).license.name"
                  variant="license"
                />
                <span v-if="(repository as any).topics && (repository as any).topics.length > 0" class="d-flex gap-1">
                  <Badge
                    v-for="topic in (repository as any).topics.slice(0, 5)"
                    :key="topic"
                    :text="topic"
                    variant="topic"
                  />
                  <span v-if="(repository as any).topics.length > 5" class="text-muted small">
                    +{{ (repository as any).topics.length - 5 }} more
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-6 mb-3">
          <StatCard
            icon="bi-star"
            :value="repository.stargazers_count?.toLocaleString() || '0'"
            label="Stars"
            color="warning"
          />
        </div>
        <div class="col-md-3 col-6 mb-3">
          <StatCard
            icon="bi-diagram-3"
            :value="repository.forks_count?.toLocaleString() || '0'"
            label="Forks"
            color="info"
          />
        </div>
        <div class="col-md-3 col-6 mb-3">
          <StatCard
            icon="bi-eye"
            :value="repository.stargazers_count?.toLocaleString() || '0'"
            label="Watchers"
            color="success"
          />
        </div>
        <div class="col-md-3 col-6 mb-3">
          <StatCard
            icon="bi-exclamation-circle"
            :value="(repository as any).open_issues_count?.toLocaleString() || '0'"
            label="Issues"
            color="danger"
          />
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="row mb-4">
        <div class="col-12">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'readme' }"
                @click="setActiveTab('readme')"
                type="button"
                role="tab"
              >
                <i class="bi bi-file-text me-1"></i>
                README
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'contributors' }"
                @click="setActiveTab('contributors')"
                type="button"
                role="tab"
              >
                <i class="bi bi-people me-1"></i>
                Contributors ({{ contributors.length }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: activeTab === 'details' }"
                @click="setActiveTab('details')"
                type="button"
                role="tab"
              >
                <i class="bi bi-info-circle me-1"></i>
                Details
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="row">
        <div class="col-12">
          <div class="tab-content">
            <!-- README Tab -->
            <div v-show="activeTab === 'readme'" class="tab-pane fade show active" role="tabpanel">
              <ReadmeViewer :content="readme" :repository-url="repositoryUrl" />
            </div>

            <!-- Contributors Tab -->
            <div v-show="activeTab === 'contributors'" class="tab-pane fade" role="tabpanel">
              <ContributorList :contributors="contributors" />
            </div>

            <!-- Details Tab -->
            <div v-show="activeTab === 'details'" class="tab-pane fade" role="tabpanel">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title mb-3">Repository Information</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <table class="table table-borderless">
                        <tbody>
                          <tr>
                            <td class="text-muted">Created</td>
                            <td>{{ createdDate }}</td>
                          </tr>
                          <tr>
                            <td class="text-muted">Last Updated</td>
                            <td>{{ updatedDate }}</td>
                          </tr>
                          <tr>
                            <td class="text-muted">Size</td>
                            <td>{{ repositorySize }}</td>
                          </tr>
                          <tr>
                            <td class="text-muted">Default Branch</td>
                            <td>
                              <code>{{ (repository as any).default_branch || 'main' }}</code>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="col-md-6">
                      <table class="table table-borderless">
                        <tbody>
                          <tr>
                            <td class="text-muted">Clone URL</td>
                            <td>
                              <div class="input-group">
                                <input
                                  type="text"
                                  class="form-control font-monospace"
                                  :value="cloneUrl"
                                  readonly
                                />
                                <button
                                  class="btn btn-outline-secondary"
                                  @click="copyToClipboard(cloneUrl)"
                                  type="button"
                                >
                                  <i class="bi bi-clipboard"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td class="text-muted">Homepage</td>
                            <td>
                              <a
                                v-if="(repository as any).homepage"
                                :href="(repository as any).homepage"
                                target="_blank"
                                class="text-decoration-none"
                              >
                                {{ (repository as any).homepage }}
                                <i class="bi bi-box-arrow-up-right ms-1"></i>
                              </a>
                              <span v-else class="text-muted">None</span>
                            </td>
                          </tr>
                          <tr>
                            <td class="text-muted">Archived</td>
                            <td>
                              <span v-if="(repository as any).archived" class="badge bg-warning">
                                <i class="bi bi-archive me-1"></i>
                                Archived
                              </span>
                              <span v-else class="text-success">
                                <i class="bi bi-check-circle me-1"></i>
                                Active
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td class="text-muted">Visibility</td>
                            <td>
                              <span
                                class="badge"
                                :class="(repository as any).private ? 'bg-danger' : 'bg-success'"
                              >
                                <i
                                  :class="(repository as any).private ? 'bi-lock' : 'bi-unlock'"
                                  class="me-1"
                                ></i>
                                {{ (repository as any).private ? 'Private' : 'Public' }}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repository-detail-view {
  min-height: 100vh;
  background-color: var(--bs-body-bg);
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--bs-secondary);
}

.nav-tabs .nav-link:hover {
  border-bottom-color: var(--bs-primary);
  color: var(--bs-primary);
}

.nav-tabs .nav-link.active {
  border-bottom-color: var(--bs-primary);
  color: var(--bs-primary);
  background: none;
}

.table-borderless td {
  padding: 0.5rem 0;
  border: none;
}

.font-monospace {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .breadcrumb {
    font-size: 0.875rem;
  }

  .nav-tabs {
    border-bottom: 1px solid var(--bs-border-color);
  }

  .nav-tabs .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
