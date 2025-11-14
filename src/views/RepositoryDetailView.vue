<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { githubApi } from '../api/github.api'

interface Props {
  owner: string
  repo: string
}

const props = defineProps<Props>()
const router = useRouter()

// State
const repository = ref<any>(null)
const readme = ref<string>('')
const contributors = ref<any[]>([])
const languages = ref<Record<string, number>>({})
const issues = ref<any[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Computed
const languageStats = computed(() => {
  if (!languages.value) return []

  const total = Object.values(languages.value).reduce((sum, bytes) => sum + bytes, 0)

  return Object.entries(languages.value)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: ((bytes / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.bytes - a.bytes)
})

const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Go: '#00ADD8',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Rust: '#dea584'
}

// Format numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

// Simple markdown to HTML converter (basic implementation)
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return ''

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, _lang, code) => {
      return `<div class="code-block"><pre><code>${escapeHtml(code.trim())}</code></pre><button class="copy-btn" onclick="navigator.clipboard.writeText('${escapeHtml(code.trim()).replace(/'/g, "\\'")}')"><i class="bi bi-clipboard"></i></button></div>`
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  return `<div>${html}</div>`
}

// Escape HTML
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m] ?? m)
}

// Extract table of contents from README
const tableOfContents = computed(() => {
  if (!readme.value) return []

  const headings = readme.value.match(/^##\s+(.+)$/gm) || []
  return headings.map(heading => {
    const title = heading.replace(/^##\s+/, '')
    return {
      title,
      id: title.toLowerCase().replace(/\s+/g, '-')
    }
  })
})

// Load repository data
const loadRepositoryDetails = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Fetch repository details
    const repoData = await githubApi.getRepository(props.owner, props.repo)
    repository.value = repoData

    // Fetch README
    try {
      const readmeData = await githubApi.getRepositoryReadme(props.owner, props.repo)
      readme.value = readmeData.content
    } catch (e) {
      console.warn('README not found')
      readme.value = '# No README available\n\nThis repository does not have a README file.'
    }

    // Fetch contributors (top 5)
    try {
      const contributorsData = await githubApi.getRepositoryContributors(props.owner, props.repo, 5)
      contributors.value = contributorsData
    } catch (e) {
      console.warn('Contributors not available')
    }

    // Fetch languages
    try {
      const languagesData = await githubApi.getRepositoryLanguages(props.owner, props.repo)
      languages.value = languagesData
    } catch (e) {
      console.warn('Languages not available')
    }

    // Fetch recent issues
    try {
      const issuesData = await githubApi.getRepositoryIssues(props.owner, props.repo, {
        state: 'all',
        perPage: 5,
        page: 1
      })
      issues.value = issuesData
    } catch (e) {
      console.warn('Issues not available')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load repository details'
    console.error('Repository detail error:', err)
  } finally {
    isLoading.value = false
  }
}

// Navigate back to search
const goBack = () => {
  router.back()
}

// Copy to clipboard

onMounted(() => {
  loadRepositoryDetails()
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="breadcrumb-section">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/">Home</router-link>
            </li>
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="goBack">Search Results</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">{{ owner }}/{{ repo }}</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container mt-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading repository details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <h4 class="alert-heading">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>Error Loading Repository
        </h4>
        <p>{{ error }}</p>
        <hr />
        <button class="btn btn-primary" @click="loadRepositoryDetails">Try Again</button>
        <button class="btn btn-secondary ms-2" @click="goBack">Go Back</button>
      </div>

      <!-- Repository Content -->
      <div v-else-if="repository">
        <!-- Repository Header -->
        <div class="repo-header">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div class="repo-title-section">
              <div class="d-flex align-items-center gap-3 mb-2">
                <img
                  :src="repository.owner.avatar_url"
                  :alt="repository.owner.login"
                  class="owner-avatar"
                />
                <div>
                  <h1 class="repo-name mb-1">
                    <a
                      :href="`https://github.com/${repository.owner.login}`"
                      target="_blank"
                      class="text-muted owner-link"
                    >
                      {{ repository.owner.login }}
                    </a>
                    / <strong>{{ repository.name }}</strong>
                  </h1>
                  <p class="repo-visibility mb-0">
                    <span class="badge bg-success">
                      <i class="bi bi-unlock"></i> {{ repository.private ? 'Private' : 'Public' }}
                    </span>
                  </p>
                </div>
              </div>
              <p class="repo-description">
                {{ repository.description || 'No description available' }}
              </p>
            </div>

            <div class="repo-actions">
              <button class="btn btn-outline-primary">
                <i class="bi bi-star"></i> Star
                <span class="badge bg-primary ms-2">{{
                  formatNumber(repository.stargazers_count)
                }}</span>
              </button>
              <button class="btn btn-outline-secondary">
                <i class="bi bi-eye"></i> Watch
                <span class="badge bg-secondary ms-2">{{
                  formatNumber(repository.watchers_count)
                }}</span>
              </button>
              <button class="btn btn-outline-secondary">
                <i class="bi bi-diagram-3"></i> Fork
                <span class="badge bg-secondary ms-2">{{
                  formatNumber(repository.forks_count)
                }}</span>
              </button>
              <button class="btn btn-warning"><i class="bi bi-bookmark"></i> Favorite</button>
            </div>
          </div>

          <!-- Repository Stats -->
          <div class="repo-stats mt-4">
            <div v-if="repository.language" class="stat-item">
              <i class="bi bi-code-slash"></i>
              <div>
                <strong>{{ repository.language }}</strong>
                <small class="text-muted d-block">Primary Language</small>
              </div>
            </div>
            <div class="stat-item">
              <i class="bi bi-exclamation-circle"></i>
              <div>
                <strong>{{ formatNumber(repository.open_issues_count) }}</strong>
                <small class="text-muted d-block">Open Issues</small>
              </div>
            </div>
            <div class="stat-item">
              <i class="bi bi-calendar-event"></i>
              <div>
                <strong>{{ formatTimeAgo(repository.updated_at) }}</strong>
                <small class="text-muted d-block">Last Updated</small>
              </div>
            </div>
            <div v-if="repository.license" class="stat-item">
              <i class="bi bi-file-text"></i>
              <div>
                <strong>{{ repository.license.name }}</strong>
                <small class="text-muted d-block">License</small>
              </div>
            </div>
            <div class="stat-item">
              <i class="bi bi-link-45deg"></i>
              <div>
                <a
                  :href="repository.html_url"
                  target="_blank"
                  class="btn btn-sm btn-outline-primary"
                >
                  Visit Repository
                </a>
              </div>
            </div>
          </div>

          <!-- Topics -->
          <div v-if="repository.topics && repository.topics.length > 0" class="repo-topics mt-3">
            <span v-for="topic in repository.topics" :key="topic" class="topic-badge">
              {{ topic }}
            </span>
          </div>
        </div>

        <div class="row mt-4">
          <!-- Main Content -->
          <div class="col-lg-8">
            <!-- README Section -->
            <div class="readme-section card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h3 class="mb-0 p-2"><i class="bi bi-file-text"></i> README.md</h3>
              </div>
              <div class="card-body readme-content">
                <!-- Table of Contents -->
                <div v-if="tableOfContents.length > 0" class="readme-toc">
                  <h6>Table of Contents</h6>
                  <ul>
                    <li v-for="item in tableOfContents" :key="item.id">
                      <a :href="`#${item.id}`">{{ item.title }}</a>
                    </li>
                  </ul>
                </div>

                <!-- README Content -->
                <div v-html="parseMarkdown(readme)"></div>
              </div>
            </div>

            <!-- Recent Issues Section -->
            <div v-if="issues.length > 0" class="issues-section card my-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-exclamation-circle"></i> Recent Issues</h5>
                <a
                  :href="`https://github.com/${owner}/${repo}/issues`"
                  target="_blank"
                  class="btn btn-sm btn-outline-primary"
                >
                  View All
                </a>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div v-for="issue in issues" :key="issue.id" class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="issue-content">
                        <div class="d-flex align-items-center gap-2 mb-1">
                          <span
                            class="badge"
                            :class="issue.state === 'open' ? 'bg-success' : 'bg-danger'"
                          >
                            <i
                              class="bi"
                              :class="issue.state === 'open' ? 'bi-check-circle' : 'bi-x-circle'"
                            ></i>
                            {{ issue.state }}
                          </span>
                          <h6 class="issue-title mb-0">
                            <a :href="issue.html_url" target="_blank">{{ issue.title }}</a>
                          </h6>
                        </div>
                        <p class="issue-meta mb-0">
                          <small class="text-muted">
                            #{{ issue.number }} opened {{ formatTimeAgo(issue.created_at) }} by
                            <strong>{{ issue.user.login }}</strong>
                          </small>
                        </p>
                        <div
                          v-if="issue.labels && issue.labels.length > 0"
                          class="issue-labels mt-2"
                        >
                          <span
                            v-for="label in issue.labels.slice(0, 3)"
                            :key="label.id"
                            class="label-badge"
                            :style="{
                              backgroundColor: `#${label.color}20`,
                              color: `#${label.color}`
                            }"
                          >
                            {{ label.name }}
                          </span>
                        </div>
                      </div>
                      <span v-if="issue.comments > 0" class="badge bg-light text-dark">
                        <i class="bi bi-chat-dots"></i> {{ issue.comments }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- Contributors Section -->
            <div v-if="contributors.length > 0" class="contributors-section card mb-4">
              <div class="card-header">
                <h5 class="mb-0"><i class="bi bi-people"></i> Top Contributors</h5>
              </div>
              <div class="card-body">
                <div class="contributors-list">
                  <div
                    v-for="contributor in contributors"
                    :key="contributor.id"
                    class="contributor-item"
                  >
                    <img
                      :src="contributor.avatar_url"
                      :alt="contributor.login"
                      class="contributor-avatar"
                    />
                    <div class="contributor-info">
                      <strong>{{ contributor.login }}</strong>
                      <small class="text-muted d-block"
                        >{{ contributor.contributions }} commits</small
                      >
                    </div>
                  </div>
                </div>
                <a
                  :href="`https://github.com/${owner}/${repo}/graphs/contributors`"
                  target="_blank"
                  class="btn btn-sm btn-outline-primary w-100 mt-3"
                >
                  View All Contributors
                </a>
              </div>
            </div>

            <!-- Language Statistics -->
            <div v-if="languageStats.length > 0" class="language-section card mb-4">
              <div class="card-header">
                <h5 class="mb-0"><i class="bi bi-bar-chart"></i> Languages</h5>
              </div>
              <div class="card-body">
                <!-- Language Bar -->
                <div class="language-bar mb-3">
                  <div
                    v-for="lang in languageStats"
                    :key="lang.name"
                    class="lang-segment"
                    :style="{
                      width: `${lang.percentage}%`,
                      backgroundColor: languageColors[lang.name] || '#ccc'
                    }"
                    :title="`${lang.name} ${lang.percentage}%`"
                  ></div>
                </div>

                <!-- Language List -->
                <div class="language-list">
                  <div
                    v-for="lang in languageStats.slice(0, 5)"
                    :key="lang.name"
                    class="language-item"
                  >
                    <span
                      class="lang-dot"
                      :style="{ backgroundColor: languageColors[lang.name] || '#ccc' }"
                    ></span>
                    <span class="lang-name">{{ lang.name }}</span>
                    <span class="lang-percent ms-auto">{{ lang.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Repository Info -->
            <div class="info-section card">
              <div class="card-header">
                <h5 class="mb-0"><i class="bi bi-info-circle"></i> About</h5>
              </div>
              <div class="card-body">
                <div v-if="repository.homepage" class="info-item">
                  <i class="bi bi-link-45deg"></i>
                  <a :href="repository.homepage" target="_blank">{{ repository.homepage }}</a>
                </div>
                <div class="info-item">
                  <i class="bi bi-people"></i>
                  <span>{{ formatNumber(repository.stargazers_count) }} stars</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-diagram-3"></i>
                  <span>{{ formatNumber(repository.forks_count) }} forks</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-eye"></i>
                  <span>{{ formatNumber(repository.watchers_count) }} watchers</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-calendar"></i>
                  <span>Created {{ new Date(repository.created_at).toLocaleDateString() }}</span>
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
/* Import all the CSS from your static design */
/* Global Styles */
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #198754;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
  --dark-color: #212529;
  --light-color: #f8f9fa;
  --border-color: #dee2e6;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* Breadcrumb Section */
.breadcrumb-section {
  background-color: white;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '/';
  color: var(--secondary-color);
}

.breadcrumb-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: var(--dark-color);
  font-weight: 500;
}

/* Repository Header */
.repo-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.owner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
}

.repo-name {
  font-size: 2rem;
  margin: 0;
  color: var(--dark-color);
}

.owner-link {
  text-decoration: none;
  transition: color 0.2s;
}

.owner-link:hover {
  color: var(--primary-color) !important;
}

.repo-visibility .badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.repo-description {
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin-top: 1rem;
  line-height: 1.6;
}

/* Repository Actions */
.repo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.repo-actions .btn {
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.repo-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.repo-actions .badge {
  font-size: 0.85rem;
}

/* Repository Stats */
.repo-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1.5rem;
  background-color: var(--light-color);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-item i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.stat-item strong {
  display: block;
  font-size: 1rem;
  color: var(--dark-color);
}

.stat-item small {
  font-size: 0.85rem;
}

/* Repository Topics */
.repo-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-badge {
  background-color: #e7f3ff;
  color: #0969da;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-badge:hover {
  background-color: #0969da;
  color: white;
}

/* README Section */
.readme-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  background-color: #f0f0f0;
}

.readme-section .card-header {
  background-color: var(--light-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}

.readme-section .card-header h5 {
  color: var(--dark-color);
  font-weight: 600;
}

.readme-content {
  padding: 2rem;
  line-height: 1.8;
}

/* Table of Contents */
.readme-toc {
  background-color: var(--light-color);
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.readme-toc h6 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--dark-color);
}

.readme-toc ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}

.readme-toc li {
  margin-bottom: 0.5rem;
}

.readme-toc a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.readme-toc a:hover {
  text-decoration: underline;
  padding-left: 0.5rem;
}

/* README Section */
.readme-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #f9f8f9;
  display: flex;
  flex-direction: column;
  height: 50rem; /* fixed height on larger screens */
  max-height: 80vh; /* cap to viewport */
  min-height: 320px;
}

.readme-section .card-header {
  flex: 0 0 auto;
  border-bottom: 1px solid #f0f0f0;
}

.readme-content {
  position: relative;
  padding: 1.5rem;
  line-height: 1.8;
  overflow: auto;
  flex: 1 1 auto;
  margin: 0.25rem 0rem 0.95rem 0.15rem;
}

.code-block {
  position: relative;
  background-color: #f6f8fa;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--dark-color);
}

.code-block code {
  background: transparent;
  padding: 0;
}

.copy-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background-color: var(--light-color);
  border-color: var(--primary-color);
}

/* Issues Section */
.issues-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
}

.issues-section .card-header {
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}

.issue-content {
  flex: 1;
}

.issue-title a {
  color: var(--dark-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.issue-title a:hover {
  color: var(--primary-color);
}

.issue-meta {
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.issue-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.label-bug {
  background-color: #ffdce0;
  color: #cf222e;
}

.label-feature {
  background-color: #d4f4dd;
  color: #116329;
}

.label-priority {
  background-color: #fff8c5;
  color: #9a6700;
}

.label-discussion {
  background-color: #ddf4ff;
  color: #0969da;
}

.label-docs {
  background-color: #e7e7ff;
  color: #6639ba;
}

/* Contributors Section */
.contributors-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  background-color: #f9f8f9;
}

.contributors-section .card-header {
  background-color: var(--light-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}

.contributors-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: var(--light-color);
  border-radius: 8px;
  transition: all 0.2s;
}

.contributor-item:hover {
  background-color: #e7f3ff;
  transform: translateX(5px);
}

.contributor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid white;
}

.contributor-info strong {
  color: var(--dark-color);
  font-size: 0.95rem;
}

.contributor-info small {
  color: var(--secondary-color);
  font-size: 0.85rem;
}

/* Language Section */
.language-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  background-color: #f9f8f9;
}

.language-section .card-header {
  background-color: var(--light-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}

.language-bar {
  height: 8px;
  background-color: var(--border-color);
  border-radius: 10px;
  display: flex;
  overflow: hidden;
}

.lang-segment {
  height: 100%;
  transition: all 0.3s;
}

.lang-segment:hover {
  opacity: 0.8;
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.language-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.lang-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.lang-name {
  color: var(--dark-color);
  font-weight: 500;
}

.lang-percent {
  color: var(--secondary-color);
}

/* Activity Section */
.activity-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
}

.activity-section .card-header {
  background-color: var(--light-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}

.activity-chart {
  padding: 1rem 0;
}

.activity-week {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 120px;
}

.activity-bar {
  flex: 1;
  background: linear-gradient(to top, var(--primary-color), var(--info-color));
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  cursor: pointer;
  min-height: 8px;
}

.activity-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

/* Info Section */
.info-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
  background-color: #f9f8f9;
}

.info-section .card-header {
  background-color: var(--light-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item i {
  color: var(--secondary-color);
  font-size: 1.1rem;
}

.info-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

/* Card Styling */
.card {
  border: none;
}

.card-header h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.card-header i {
  margin-right: 0.5rem;
}

/* Responsive Design */
@media (max-width: 991px) {
  .repo-header {
    padding: 1.5rem;
  }

  .repo-name {
    font-size: 1.5rem;
  }

  .owner-avatar {
    width: 60px;
    height: 60px;
  }

  .repo-actions {
    width: 100%;
    margin-top: 1rem;
  }

  .repo-actions .btn {
    flex: 1;
    min-width: 120px;
  }

  .repo-stats {
    gap: 1rem;
  }

  .stat-item {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 150px;
  }

  .readme-section {
    height: 420px;
    max-height: 70vh;
  }
}

@media (max-width: 768px) {
  .breadcrumb-section {
    padding: 0.75rem 0;
  }

  .repo-header {
    padding: 1rem;
  }

  .repo-name {
    font-size: 1.25rem;
  }

  .repo-description {
    font-size: 1rem;
  }

  .repo-stats {
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-item {
    width: 100%;
  }

  .readme-section {
    height: auto;
    max-height: 60vh;
  }

  .readme-content {
    max-height: 55vh;
  }

  .readme-content {
    padding: 1.5rem;
  }

  .readme-content h2 {
    font-size: 1.5rem;
  }

  .readme-content h3 {
    font-size: 1.25rem;
  }

  .activity-week {
    height: 100px;
  }

  .contributor-item {
    padding: 0.5rem;
  }

  .contributor-avatar {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 576px) {
  .owner-avatar {
    width: 50px;
    height: 50px;
  }

  .repo-name {
    font-size: 1.1rem;
  }

  .repo-actions .btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.75rem;
  }

  .repo-topics {
    gap: 0.35rem;
  }

  .topic-badge {
    font-size: 0.8rem;
    padding: 0.25rem 0.65rem;
  }

  .code-block {
    padding: 1rem;
    font-size: 0.85rem;
  }

  .readme-toc {
    padding: 1rem;
  }
}

/* Utilities */
.btn {
  transition: all 0.2s ease;
}

.card {
  transition: all 0.2s ease;
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}
</style>
