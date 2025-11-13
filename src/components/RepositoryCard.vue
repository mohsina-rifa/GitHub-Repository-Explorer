<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { GitHubRepositoryData } from '../repositories/interfaces/iGitHubRepository'

interface Props {
  repository: GitHubRepositoryData
}

const props = defineProps<Props>()
const router = useRouter()

const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#fa7343',
    Kotlin: '#A97BFF',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Vue: '#4FC08D',
    React: '#61DAFB'
  }
  return colors[language] || '#6c757d'
}

const viewRepository = (): void => {
  if (props.repository.owner?.login) {
    router.push({
      name: 'repository-detail',
      params: {
        owner: props.repository.owner.login,
        repo: props.repository.name
      }
    })
  }
}
</script>

<template>
  <div class="card h-100 repository-card" @click="viewRepository">
    <div class="card-body">
      <div class="d-flex align-items-start mb-2">
        <img
          :src="repository.owner?.avatar_url"
          :alt="repository.owner?.login"
          class="rounded-circle me-2"
          width="24"
          height="24"
        />
        <div class="flex-grow-1">
          <h5 class="card-title mb-1">
            <span class="text-primary text-decoration-none">
              {{ repository.name }}
            </span>
          </h5>
          <small class="text-muted">{{ repository.owner?.login }}</small>
        </div>
      </div>

      <p class="card-text text-muted small mb-2">
        {{ repository.description || 'No description available' }}
      </p>

      <div class="d-flex align-items-center gap-3 text-muted small">
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
    </div>
  </div>
</template>

<style scoped>
.repository-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.repository-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.language-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.language-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
</style>
