<script setup lang="ts">
import type { GitHubRepositoryData } from '../repositories/interfaces/iGitHubRepository'

interface Props {
  repository: GitHubRepositoryData
}

defineProps<Props>()

const getLanguageColor = (language: string): string => {
  // Simple color mapping
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
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="row align-items-start">
        <div class="col-md-8">
          <div class="d-flex align-items-start mb-2">
            <img
              :src="repository.owner?.avatar_url"
              :alt="repository.owner?.login"
              class="rounded-circle me-3"
              width="32"
              height="32"
            />
            <div class="flex-grow-1">
              <h5 class="mb-1">
                <a :href="repository.html_url" target="_blank" class="text-decoration-none">
                  {{ repository.name }}
                </a>
              </h5>
              <small class="text-muted">{{ repository.owner?.login }}</small>
              <p class="text-muted mt-2 mb-0">
                {{ repository.description || 'No description available' }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="d-flex flex-column align-items-md-end">
            <div class="d-flex align-items-center gap-3 text-muted small mb-2">
              <span v-if="repository.language" class="d-flex align-items-center">
                <span
                  class="language-color me-1"
                  :style="{ backgroundColor: getLanguageColor(repository.language) }"
                ></span>
                {{ repository.language }}
              </span>
              <span class="d-flex align-items-center">
                <i class="bi bi-star me-1"></i>
                {{ repository.stargazers_count?.toLocaleString() || 0 }}
              </span>
              <span class="d-flex align-items-center">
                <i class="bi bi-diagram-3 me-1"></i>
                {{ repository.forks_count?.toLocaleString() || 0 }}
              </span>
            </div>
            <small class="text-muted">
              Updated {{ new Date(repository.updated_at || '').toLocaleDateString() }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.1s;
}

.card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.language-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
</style>
