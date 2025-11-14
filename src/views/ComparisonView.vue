<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useComparisonStore } from '../store/comparison/comparison.store'

const router = useRouter()
const route = useRoute()
const comparisonStore = useComparisonStore()

// State
const repositories = computed(() => comparisonStore.selectedRepositories)
const selectedCount = computed(() => comparisonStore.selectedCount)
const canCompare = computed(() => comparisonStore.canCompare)
const metrics = computed(() => comparisonStore.comparisonMetrics)
const insights = computed(() => comparisonStore.insights)
const isLoading = computed(() => comparisonStore.isLoading)
const error = computed(() => comparisonStore.error)

// Load from URL if repos query parameter exists
onMounted(async () => {
  const reposParam = route.query.repos
  if (reposParam && typeof reposParam === 'string') {
    const ids = reposParam
      .split(',')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id))
    if (ids.length > 0) {
      await comparisonStore.loadFromIds(ids)
    }
  }
})

// Format number
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

// Get percentage for visual bars
const getPercentage = (value: number, max: number) => {
  if (max === 0) return 0
  return Math.round((value / max) * 100)
}

// Check if value is the best (highest)
const isBest = (value: number, field: 'stargazers_count' | 'forks_count' | 'watchers_count') => {
  if (repositories.value.length === 0) return false
  const values = repositories.value.map(r => (r as any)[field] || 0)
  const max = Math.max(...values)
  return value === max && max > 0
}

// Check if value is the best (lowest for issues)
const isBestLow = (value: number, field: 'open_issues_count') => {
  if (repositories.value.length === 0) return false
  const values = repositories.value.map(r => (r as any)[field] || 0)
  const min = Math.min(...values)
  return value === min
}

// Check if most recent
const isMostRecent = (dateString: string) => {
  if (repositories.value.length === 0) return false
  const dates = repositories.value.map(r => new Date(r.updated_at).getTime())
  const max = Math.max(...dates)
  return new Date(dateString).getTime() === max
}

// Remove repository
const removeRepository = (id: number) => {
  comparisonStore.removeRepository(id)

  // If less than 2 repos remain, go back to search
  if (comparisonStore.selectedCount < 2) {
    router.push({ name: 'Search' })
  }
}

// Clear all
const clearAll = () => {
  comparisonStore.clearAll()
  router.push({ name: 'Search' })
}

// Export functions
const exportJSON = () => {
  comparisonStore.downloadAsJson()
}

const exportCSV = () => {
  comparisonStore.downloadAsCsv()
}

// Copy share URL
const copyShareUrl = async () => {
  const success = await comparisonStore.copyComparisonUrl()
  if (success) {
    // TODO: Show toast notification
    alert('Comparison URL copied to clipboard!')
  } else {
    alert('Failed to copy URL')
  }
}

// Go to repo detail
const goToDetail = (owner: string, repo: string) => {
  router.push({
    name: 'RepositoryDetail',
    params: { owner, repo }
  })
}

// Go back to search
const goToSearch = () => {
  router.push({ name: 'Search' })
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 class="page-title"><i class="bi bi-arrow-left-right"></i> Repository Comparison</h1>
            <p class="page-subtitle mb-0">
              Compare {{ selectedCount }}
              {{ selectedCount === 1 ? 'repository' : 'repositories' }} side-by-side
            </p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline-primary" @click="goToSearch">
              <i class="bi bi-plus-circle"></i> Add Repository
            </button>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-outline-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-download"></i> Export
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="exportJSON">
                    <i class="bi bi-file-earmark-code"></i> Export as JSON
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="exportCSV">
                    <i class="bi bi-filetype-csv"></i> Export as CSV
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="copyShareUrl">
                    <i class="bi bi-share"></i> Copy Share URL
                  </a>
                </li>
              </ul>
            </div>
            <button class="btn btn-outline-danger" @click="clearAll">
              <i class="bi bi-x-circle"></i> Clear All
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mt-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading repositories...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="!canCompare" class="text-center py-5">
        <i class="bi bi-inbox" style="font-size: 4rem; color: #6c757d"></i>
        <h4 class="mt-3">No Repositories to Compare</h4>
        <p class="text-muted">
          Select at least 2 repositories from search results to compare them.
        </p>
        <button class="btn btn-primary mt-3" @click="goToSearch">
          <i class="bi bi-search"></i> Go to Search
        </button>
      </div>

      <!-- Comparison Content -->
      <div v-else>
        <!-- Comparison Summary -->
        <div v-if="metrics" class="comparison-summary card mb-4">
          <div class="card-body">
            <h5 class="card-title mb-3">
              <i class="bi bi-bar-chart-line"></i> Quick Comparison Summary
            </h5>
            <div class="row g-3">
              <div class="col-md-3">
                <div class="summary-card">
                  <div class="summary-icon bg-primary">
                    <i class="bi bi-star-fill"></i>
                  </div>
                  <div class="summary-content">
                    <h6>Most Stars</h6>
                    <p class="mb-0">
                      <strong>{{ metrics.mostStarred?.full_name || 'N/A' }}</strong>
                    </p>
                    <small class="text-muted">
                      {{ formatNumber(metrics.mostStarred?.stargazers_count || 0) }} stars
                    </small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="summary-card">
                  <div class="summary-icon bg-success">
                    <i class="bi bi-diagram-3-fill"></i>
                  </div>
                  <div class="summary-content">
                    <h6>Most Forks</h6>
                    <p class="mb-0">
                      <strong>{{ metrics.mostForked?.full_name || 'N/A' }}</strong>
                    </p>
                    <small class="text-muted">
                      {{ formatNumber(metrics.mostForked?.forks_count || 0) }} forks
                    </small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="summary-card">
                  <div class="summary-icon bg-warning">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="summary-content">
                    <h6>Most Recent</h6>
                    <p class="mb-0">
                      <strong>{{ metrics.mostRecent?.full_name || 'N/A' }}</strong>
                    </p>
                    <small class="text-muted">
                      {{ formatTimeAgo(metrics.mostRecent?.updated_at || '') }}
                    </small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="summary-card">
                  <div class="summary-icon bg-info">
                    <i class="bi bi-bar-chart"></i>
                  </div>
                  <div class="summary-content">
                    <h6>Avg Stars</h6>
                    <p class="mb-0">
                      <strong>{{ formatNumber(metrics.averageStars) }}</strong>
                    </p>
                    <small class="text-muted">across all repos</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Table -->
        <div class="comparison-table-wrapper">
          <div class="comparison-table">
            <!-- Repository Headers -->
            <div
              class="repo-headers"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label"></div>

              <div v-for="repo in repositories" :key="repo.id" class="repo-header">
                <button class="btn-remove" title="Remove" @click="removeRepository(repo.id)">
                  <i class="bi bi-x-circle"></i>
                </button>
                <img :src="repo.owner.avatar_url" :alt="repo.owner.login" class="repo-avatar" />
                <h5 class="repo-title">
                  <a :href="repo.html_url" target="_blank">{{ repo.full_name }}</a>
                </h5>
                <p class="repo-desc">{{ repo.description || 'No description' }}</p>
                <button
                  class="btn btn-sm btn-primary"
                  @click="goToDetail(repo.owner.login, repo.name)"
                >
                  <i class="bi bi-box-arrow-up-right"></i> View Details
                </button>
              </div>
            </div>

            <!-- Basic Information Section -->
            <div
              class="comparison-section"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="section-header">
                <h6><i class="bi bi-info-circle"></i> Basic Information</h6>
              </div>
            </div>

            <!-- Owner -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label"><strong>Owner</strong></div>
              <div v-for="repo in repositories" :key="repo.id" class="metric-value">
                {{ repo.owner.login }}
              </div>
            </div>

            <!-- Last Updated -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label"><strong>Last Updated</strong></div>
              <div
                v-for="repo in repositories"
                :key="repo.id"
                class="metric-value"
                :class="{ best: isMostRecent(repo.updated_at) }"
              >
                <span v-if="isMostRecent(repo.updated_at)">
                  <i class="bi bi-trophy-fill"></i>
                </span>
                {{ formatTimeAgo(repo.updated_at) }}
              </div>
            </div>

            <!-- Primary Language -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label"><strong>Primary Language</strong></div>
              <div v-for="repo in repositories" :key="repo.id" class="metric-value">
                <span v-if="repo.language" class="badge bg-primary">{{ repo.language }}</span>
                <span v-else class="text-muted">N/A</span>
              </div>
            </div>

            <!-- License -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label"><strong>License</strong></div>
              <div v-for="repo in repositories" :key="repo.id" class="metric-value">
                {{ repo.license?.name || 'N/A' }}
              </div>
            </div>

            <!-- Popularity Metrics Section -->
            <div
              class="comparison-section"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="section-header">
                <h6><i class="bi bi-star"></i> Popularity Metrics</h6>
              </div>
            </div>

            <!-- Stars -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label">
                <strong><i class="bi bi-star-fill text-warning"></i> Stars</strong>
              </div>
              <div
                v-for="repo in repositories"
                :key="repo.id"
                class="metric-value"
                :class="{ best: isBest(repo.stargazers_count, 'stargazers_count') }"
              >
                <span v-if="isBest(repo.stargazers_count, 'stargazers_count')">
                  <i class="bi bi-trophy-fill"></i>
                </span>
                {{ formatNumber(repo.stargazers_count) }}
                <div
                  class="metric-bar"
                  :style="{
                    width:
                      getPercentage(
                        repo.stargazers_count,
                        metrics?.mostStarred?.stargazers_count || 0
                      ) + '%'
                  }"
                ></div>
              </div>
            </div>

            <!-- Forks -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label">
                <strong><i class="bi bi-diagram-3-fill"></i> Forks</strong>
              </div>
              <div
                v-for="repo in repositories"
                :key="repo.id"
                class="metric-value"
                :class="{ best: isBest(repo.forks_count, 'forks_count') }"
              >
                <span v-if="isBest(repo.forks_count, 'forks_count')">
                  <i class="bi bi-trophy-fill"></i>
                </span>
                {{ formatNumber(repo.forks_count) }}
                <div
                  class="metric-bar"
                  :style="{
                    width:
                      getPercentage(repo.forks_count, metrics?.mostForked?.forks_count || 0) + '%'
                  }"
                ></div>
              </div>
            </div>

            <!-- Activity Metrics Section -->
            <div
              class="comparison-section"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="section-header">
                <h6><i class="bi bi-activity"></i> Activity Metrics</h6>
              </div>
            </div>

            <!-- Open Issues -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label">
                <strong><i class="bi bi-exclamation-circle"></i> Open Issues</strong>
              </div>
              <div
                v-for="repo in repositories"
                :key="repo.id"
                class="metric-value"
                :class="{ best: isBestLow(repo.open_issues_count, 'open_issues_count') }"
              >
                <span v-if="isBestLow(repo.open_issues_count, 'open_issues_count')">
                  <i class="bi bi-trophy-fill"></i>
                </span>
                {{ formatNumber(repo.open_issues_count) }}
              </div>
            </div>

            <!-- Topics -->
            <div
              class="comparison-row"
              :style="{ gridTemplateColumns: `250px repeat(${repositories.length}, 1fr)` }"
            >
              <div class="metric-label">
                <strong><i class="bi bi-tag"></i> Topics</strong>
              </div>
              <div v-for="repo in repositories" :key="repo.id" class="metric-value">
                <div v-if="repo.topics && repo.topics.length > 0" class="d-flex flex-wrap gap-1">
                  <span
                    v-for="topic in repo.topics.slice(0, 3)"
                    :key="topic"
                    class="badge bg-secondary"
                    style="font-size: 0.7rem"
                  >
                    {{ topic }}
                  </span>
                  <span
                    v-if="repo.topics.length > 3"
                    class="badge bg-light text-dark"
                    style="font-size: 0.7rem"
                  >
                    +{{ repo.topics.length - 3 }}
                  </span>
                </div>
                <span v-else class="text-muted">None</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Insights Section -->
        <div v-if="insights.length > 0" class="insights-section card mt-4 mb-4">
          <div class="card-body">
            <h5 class="card-title mb-3"><i class="bi bi-lightbulb"></i> Comparison Insights</h5>
            <div class="row">
              <div v-for="(insight, index) in insights" :key="index" class="col-md-4 mb-3">
                <div class="insight-card">
                  <i class="bi bi-info-circle-fill text-info"></i>
                  <p class="mb-0">{{ insight }}</p>
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
/* Import the CSS from your static design */
/* You can either put it here or in a separate CSS file */

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

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-title i {
  margin-right: 0.75rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.header-actions .btn {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}

.header-actions .btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: translateY(-2px);
}

/* Comparison Summary */
.comparison-summary {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
}

.comparison-summary .card-title {
  font-weight: 600;
  color: var(--dark-color);
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--light-color);
  border-radius: 12px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.summary-content h6 {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--secondary-color);
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.summary-content p {
  font-size: 0.95rem;
  color: var(--dark-color);
  font-weight: 600;
}

.summary-content small {
  font-size: 0.8rem;
}

/* Comparison Table */
.comparison-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.comparison-table {
  min-width: 900px;
}

.repo-headers {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid var(--border-color);
}

.repo-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.repo-header:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--danger-color);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.25rem;
  opacity: 0.6;
}

.btn-remove:hover {
  opacity: 1;
  transform: scale(1.1);
}

.repo-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--border-color);
  margin-bottom: 1rem;
}

.repo-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.repo-title a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.repo-title a:hover {
  text-decoration: underline;
}

.repo-desc {
  font-size: 0.85rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  line-height: 1.4;
  min-height: 40px;
}

.comparison-section {
  display: grid;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color));
  color: white;
}

.section-header {
  grid-column: 1 / -1;
}

.section-header h6 {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparison-row {
  display: grid;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.comparison-row:hover {
  background-color: #f8f9fa;
}

.comparison-row:last-child {
  border-bottom: none;
}

.metric-label {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: var(--dark-color);
  padding-right: 1rem;
}

.metric-label i {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.metric-value {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: var(--light-color);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--dark-color);
  position: relative;
  transition: all 0.3s;
}

.metric-value:hover {
  background-color: #e7f3ff;
  transform: scale(1.02);
}

.metric-value.best {
  background: linear-gradient(135deg, #fff9e6 0%, #fffaed 100%);
  border: 2px solid var(--warning-color);
  font-weight: 600;
}

.metric-value.best i.bi-trophy-fill {
  color: var(--warning-color);
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.metric-bar {
  height: 6px;
  background: linear-gradient(90deg, var(--primary-color), var(--info-color));
  border-radius: 3px;
  margin-top: 0.5rem;
  transition: width 0.5s ease;
}

/* Insights */
.insights-section {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 12px;
}

.insights-section .card-title {
  font-weight: 600;
  color: var(--dark-color);
}

.insight-card {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--light-color);
  border-radius: 12px;
  transition: all 0.3s;
  height: 100%;
}

.insight-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.insight-card i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.insight-card p {
  font-size: 0.9rem;
  color: var(--secondary-color);
  margin-bottom: 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 991px) {
  .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    margin-top: 1rem;
  }

  .header-actions .btn {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .repo-avatar {
    width: 60px;
    height: 60px;
  }

  .repo-desc {
    font-size: 0.8rem;
  }
}
</style>
