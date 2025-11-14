<script setup lang="ts">
import { computed } from 'vue'
import type { GitHubRepositoryData } from '../repositories/interfaces/iGitHubRepository'
import Badge from './Badge.vue'

interface Props {
  repositories: GitHubRepositoryData[]
}

const props = defineProps<Props>()

const formatNumber = (num: number | null | undefined): string => {
  if (!num) return '0'
  return num.toLocaleString()
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString()
}

const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584'
  }
  return colors[language] || '#6c757d'
}

const repositoryMetrics = computed(() => {
  return props.repositories.map(repo => ({
    ...repo,
    size: repo.size ? `${(repo.size / 1024).toFixed(1)} MB` : 'N/A',
    lastUpdate: repo.updated_at ? new Date(repo.updated_at) : null,
    daysSinceUpdate: repo.updated_at ? 
      Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24)) : null
  }))
})
</script>

<template>
  <div class="comparison-table-container">
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-dark">
          <tr>
            <th scope="col" class="metric-col">Metric</th>
            <th 
              v-for="repo in repositories" 
              :key="repo.id" 
              scope="col" 
              class="repo-col text-center"
            >
              <div class="d-flex flex-column align-items-center">
                <img 
                  :src="repo.owner?.avatar_url" 
                  :alt="repo.owner?.login"
                  class="rounded-circle mb-2"
                  width="32"
                  height="32"
                />
                <div class="fw-bold">{{ repo.name }}</div>
                <small class="text-muted">{{ repo.owner?.login }}</small>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Description -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-file-text me-2"></i>
              Description
            </th>
            <td v-for="repo in repositories" :key="`desc-${repo.id}`" class="text-center">
              <small>{{ repo.description || 'No description' }}</small>
            </td>
          </tr>

          <!-- Language -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-code me-2"></i>
              Language
            </th>
            <td v-for="repo in repositories" :key="`lang-${repo.id}`" class="text-center">
              <Badge 
                v-if="repo.language"
                :text="repo.language"
                :color="getLanguageColor(repo.language)"
                variant="language"
              />
              <span v-else class="text-muted">None</span>
            </td>
          </tr>

          <!-- Stars -->
          <tr class="table-warning">
            <th scope="row" class="metric-name">
              <i class="bi bi-star-fill me-2"></i>
              Stars
            </th>
            <td v-for="repo in repositories" :key="`stars-${repo.id}`" class="text-center fw-bold">
              {{ formatNumber(repo.stargazers_count) }}
            </td>
          </tr>

          <!-- Forks -->
          <tr class="table-info">
            <th scope="row" class="metric-name">
              <i class="bi bi-diagram-3-fill me-2"></i>
              Forks
            </th>
            <td v-for="repo in repositories" :key="`forks-${repo.id}`" class="text-center fw-bold">
              {{ formatNumber(repo.forks_count) }}
            </td>
          </tr>

          <!-- Watchers -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-eye-fill me-2"></i>
              Watchers
            </th>
            <td v-for="repo in repositories" :key="`watchers-${repo.id}`" class="text-center">
              {{ formatNumber(repo.watchers_count) }}
            </td>
          </tr>

          <!-- Issues -->
          <tr class="table-danger">
            <th scope="row" class="metric-name">
              <i class="bi bi-exclamation-circle-fill me-2"></i>
              Open Issues
            </th>
            <td v-for="repo in repositories" :key="`issues-${repo.id}`" class="text-center">
              {{ formatNumber(repo.open_issues_count) }}
            </td>
          </tr>

          <!-- Size -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-hdd me-2"></i>
              Size
            </th>
            <td v-for="repo in repositoryMetrics" :key="`size-${repo.id}`" class="text-center">
              {{ repo.size }}
            </td>
          </tr>

          <!-- Created Date -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-calendar-plus me-2"></i>
              Created
            </th>
            <td v-for="repo in repositories" :key="`created-${repo.id}`" class="text-center">
              {{ formatDate(repo.created_at) }}
            </td>
          </tr>

          <!-- Last Updated -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-calendar-check me-2"></i>
              Last Updated
            </th>
            <td v-for="(repo) in repositoryMetrics" :key="`updated-${repo.id}`" class="text-center">
              <div>{{ formatDate(repo.updated_at) }}</div>
              <small v-if="repo.daysSinceUpdate !== null" class="text-muted">
                {{ repo.daysSinceUpdate }} days ago
              </small>
            </td>
          </tr>

          <!-- License -->
          <tr>
            <th scope="row" class="metric-name">
              <i class="bi bi-shield-check me-2"></i>
              License
            </th>
            <td v-for="repo in repositories" :key="`license-${repo.id}`" class="text-center">
              <Badge 
                v-if="(repo as any).license?.name"
                :text="(repo as any).license.name"
                variant="license"
              />
              <span v-else class="text-muted">None</span>
            </td>
          </tr>

          <!-- Actions -->
          <tr class="table-light">
            <th scope="row" class="metric-name">
              <i class="bi bi-link-45deg me-2"></i>
              Actions
            </th>
            <td v-for="repo in repositories" :key="`actions-${repo.id}`" class="text-center">
              <div class="btn-group-vertical btn-group-sm">
                <a 
                  :href="repo.html_url" 
                  target="_blank" 
                  class="btn btn-outline-primary btn-sm"
                >
                  <i class="bi bi-github"></i>
                  GitHub
                </a>
                <router-link 
                  :to="{ name: 'RepositoryDetail', params: { owner: repo.owner?.login, repo: repo.name } }"
                  class="btn btn-outline-info btn-sm"
                >
                  <i class="bi bi-info-circle"></i>
                  Details
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.comparison-table-container {
  overflow-x: auto;
}

.metric-col {
  min-width: 160px;
  background-color: var(--bs-dark) !important;
  color: var(--bs-white) !important;
  position: sticky;
  left: 0;
  z-index: 10;
}

.repo-col {
  min-width: 200px;
  background-color: var(--bs-dark) !important;
  color: var(--bs-white) !important;
}

.metric-name {
  background-color: var(--bs-light);
  position: sticky;
  left: 0;
  z-index: 5;
  font-weight: 600;
}

.table td, .table th {
  vertical-align: middle;
  padding: 1rem 0.75rem;
}

.btn-group-vertical .btn {
  margin-bottom: 0.25rem;
}

.btn-group-vertical .btn:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .repo-col {
    min-width: 150px;
  }
  
  .table td, .table th {
    padding: 0.5rem 0.25rem;
    font-size: 0.875rem;
  }
  
  .btn-group-vertical .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>