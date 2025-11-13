<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComparisonStore } from '../store/comparison/comparison.store'
import { useAppStore } from '../store/app/app.store'
import { storeToRefs } from 'pinia'
import ComparisonTable from '../components/ComparisonTable.vue'
import StatCard from '../components/StatCard.vue'

const router = useRouter()
const comparisonStore = useComparisonStore()
const appStore = useAppStore()

const { selectedRepositories, repositoryCount, canCompare, hasRepositories, comparisonMetrics } =
  storeToRefs(comparisonStore)

const isExporting = ref(false)
const showShareModal = ref(false)
const shareUrl = ref('')

const backToSearch = (): void => {
  router.push({ name: 'search' })
}

const clearComparison = (): void => {
  if (confirm('Are you sure you want to clear all repositories from comparison?')) {
    comparisonStore.clearAll()
  }
}

const removeRepository = (repositoryId: number): void => {
  try {
    comparisonStore.removeRepository(repositoryId)
    appStore.addNotification({
      type: 'success',
      message: 'Repository removed from comparison'
    })
  } catch (error: any) {
    appStore.addNotification({
      type: 'error',
      message: error.message
    })
  }
}

const exportComparison = async (format: 'json' | 'csv'): Promise<void> => {
  try {
    isExporting.value = true
    comparisonStore.exportComparison(format)
    appStore.addNotification({
      type: 'success',
      message: `Comparison exported as ${format.toUpperCase()}`
    })
  } catch (error: any) {
    appStore.addNotification({
      type: 'error',
      message: `Export failed: ${error.message}`
    })
  } finally {
    isExporting.value = false
  }
}

const generateShareUrl = (): void => {
  const comparisonId = comparisonStore.generateComparisonId()
  const repoIds = selectedRepositories.value.map(repo => repo.id).join(',')
  shareUrl.value = `${window.location.origin}/comparison?repos=${repoIds}&id=${comparisonId}`
  showShareModal.value = true
}

const copyShareUrl = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    appStore.addNotification({
      type: 'success',
      message: 'Share URL copied to clipboard'
    })
  } catch (error) {
    appStore.addNotification({
      type: 'error',
      message: 'Failed to copy URL'
    })
  }
}

const metricsCards = computed(() => {
  const metrics = comparisonMetrics.value
  if (!metrics) return []

  return [
    {
      icon: 'bi-star-fill',
      value: metrics.totalStars.toLocaleString(),
      label: 'Total Stars',
      color: 'warning' as const
    },
    {
      icon: 'bi-diagram-3-fill',
      value: metrics.totalForks.toLocaleString(),
      label: 'Total Forks',
      color: 'info' as const
    },
    {
      icon: 'bi-code-slash',
      value: metrics.languages.size,
      label: 'Languages',
      color: 'success' as const
    },
    {
      icon: 'bi-collection',
      value: repositoryCount.value,
      label: 'Repositories',
      color: 'primary' as const
    }
  ]
})

onMounted(() => {
  comparisonStore.loadFromStorage()
})
</script>

<template>
  <div class="comparison-view">
    <!-- Header -->
    <div class="container-fluid bg-white border-bottom">
      <div class="container py-3">
        <div class="row align-items-center">
          <div class="col-md-8">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-2">
                <li class="breadcrumb-item">
                  <button class="btn btn-link p-0 text-decoration-none" @click="backToSearch">
                    <i class="bi bi-arrow-left me-1"></i>
                    Back to Search
                  </button>
                </li>
                <li class="breadcrumb-item active" aria-current="page">Repository Comparison</li>
              </ol>
            </nav>
            <h1 class="h2 mb-0">
              <i class="bi bi-bar-chart me-2"></i>
              Compare Repositories
            </h1>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="btn-group">
              <button
                class="btn btn-outline-primary"
                :disabled="!canCompare"
                @click="generateShareUrl"
              >
                <i class="bi bi-share me-1"></i>
                Share
              </button>
              <button
                class="btn btn-outline-danger"
                :disabled="!hasRepositories"
                @click="clearComparison"
              >
                <i class="bi bi-trash me-1"></i>
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Repositories State -->
    <div v-if="!hasRepositories" class="container py-5">
      <div class="text-center">
        <i class="bi bi-bar-chart display-1 text-muted mb-4"></i>
        <h2>No Repositories to Compare</h2>
        <p class="text-muted mb-4">
          Add repositories from search results to start comparing them side by side.
        </p>
        <button class="btn btn-primary btn-lg" @click="backToSearch">
          <i class="bi bi-search me-2"></i>
          Go to Search
        </button>
      </div>
    </div>

    <!-- Comparison Content -->
    <div v-else class="container py-4">
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div v-for="card in metricsCards" :key="card.label" class="col-lg-3 col-md-6 col-12 mb-3">
          <StatCard :icon="card.icon" :value="card.value" :label="card.label" :color="card.color" />
        </div>
      </div>

      <!-- Selected Repositories -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-collection me-2"></i>
                Selected Repositories ({{ repositoryCount }}/4)
              </h5>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-secondary"
                  :disabled="isExporting"
                  @click="exportComparison('json')"
                >
                  <i class="bi bi-filetype-json me-1"></i>
                  Export JSON
                </button>
                <button
                  class="btn btn-outline-secondary"
                  :disabled="isExporting"
                  @click="exportComparison('csv')"
                >
                  <i class="bi bi-filetype-csv me-1"></i>
                  Export CSV
                </button>
              </div>
            </div>
            <div class="card-body p-3">
              <div class="row">
                <div
                  v-for="repository in selectedRepositories"
                  :key="repository.id"
                  class="col-lg-3 col-md-6 col-12 mb-3"
                >
                  <div class="card border-primary h-100">
                    <div class="card-body text-center p-3">
                      <button
                        class="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2"
                        @click="removeRepository(repository.id)"
                        title="Remove from comparison"
                      >
                        <i class="bi bi-x"></i>
                      </button>

                      <img
                        :src="repository.owner?.avatar_url"
                        :alt="repository.owner?.login"
                        class="rounded-circle mb-2"
                        width="40"
                        height="40"
                      />

                      <h6 class="card-title mb-1">{{ repository.name }}</h6>
                      <small class="text-muted d-block mb-2">{{ repository.owner?.login }}</small>

                      <div class="d-flex justify-content-around text-center small">
                        <div>
                          <div class="fw-bold text-warning">
                            {{ repository.stargazers_count?.toLocaleString() || 0 }}
                          </div>
                          <div class="text-muted">Stars</div>
                        </div>
                        <div>
                          <div class="fw-bold text-info">
                            {{ repository.forks_count?.toLocaleString() || 0 }}
                          </div>
                          <div class="text-muted">Forks</div>
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

      <!-- Comparison Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-table me-2"></i>
                Detailed Comparison
              </h5>
            </div>
            <div class="card-body p-0">
              <ComparisonTable :repositories="selectedRepositories" />
            </div>
          </div>
        </div>
      </div>

      <!-- Insights Section -->
      <div v-if="comparisonMetrics" class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-lightbulb me-2"></i>
                Comparison Insights
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6 class="text-primary">Most Popular</h6>
                  <div class="d-flex align-items-center">
                    <img
                      :src="comparisonMetrics.mostStarred?.owner?.avatar_url"
                      :alt="comparisonMetrics.mostStarred?.owner?.login"
                      class="rounded-circle me-2"
                      width="24"
                      height="24"
                    />
                    <div>
                      <strong>{{ comparisonMetrics.mostStarred?.name }}</strong>
                      <small class="text-muted d-block">
                        {{
                          comparisonMetrics.mostStarred?.stargazers_count?.toLocaleString()
                        }}
                        stars
                      </small>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="text-info">Most Forked</h6>
                  <div class="d-flex align-items-center">
                    <img
                      :src="comparisonMetrics.mostForked?.owner?.avatar_url"
                      :alt="comparisonMetrics.mostForked?.owner?.login"
                      class="rounded-circle me-2"
                      width="24"
                      height="24"
                    />
                    <div>
                      <strong>{{ comparisonMetrics.mostForked?.name }}</strong>
                      <small class="text-muted d-block">
                        {{ comparisonMetrics.mostForked?.forks_count?.toLocaleString() }} forks
                      </small>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="text-success">Newest</h6>
                  <div class="d-flex align-items-center">
                    <img
                      :src="comparisonMetrics.newest?.owner?.avatar_url"
                      :alt="comparisonMetrics.newest?.owner?.login"
                      class="rounded-circle me-2"
                      width="24"
                      height="24"
                    />
                    <div>
                      <strong>{{ comparisonMetrics.newest?.name }}</strong>
                      <small class="text-muted d-block">
                        Created
                        {{
                          new Date(comparisonMetrics.newest?.created_at || '').toLocaleDateString()
                        }}
                      </small>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="text-secondary">Languages Used</h6>
                  <div class="d-flex flex-wrap gap-1">
                    <span
                      v-for="language in Array.from(comparisonMetrics.languages)"
                      :key="language"
                      class="badge bg-light text-dark"
                    >
                      {{ language }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div
      v-if="showShareModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Share Comparison</h5>
            <button type="button" class="btn-close" @click="showShareModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Share this comparison with others using the URL below:</p>
            <div class="input-group">
              <input type="text" class="form-control" :value="shareUrl" readonly />
              <button class="btn btn-outline-secondary" type="button" @click="copyShareUrl">
                <i class="bi bi-clipboard"></i>
                Copy
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showShareModal = false">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-view {
  min-height: 100vh;
  background-color: var(--bs-body-bg);
}

.position-absolute {
  position: absolute !important;
}

.position-relative {
  position: relative !important;
}

@media (max-width: 768px) {
  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }

  .card-body .row > div {
    margin-bottom: 1rem;
  }
}
</style>
