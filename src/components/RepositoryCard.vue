<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComparisonStore } from '../store/comparison/comparison.store'
import { storeToRefs } from 'pinia'
import type { GitHubRepositoryData } from '../repositories/interfaces/iGitHubRepository'

interface Props {
  repository: GitHubRepositoryData
}

interface Emits {
  (e: 'toggle-selection', repository: GitHubRepositoryData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const comparisonStore = useComparisonStore()
storeToRefs(comparisonStore)

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

const isSelected = computed(() => 
  comparisonStore.isRepositorySelected(props.repository.id)
)

const canSelect = computed(() => 
  isSelected.value || comparisonStore.canAddMore
)

const viewRepository = (): void => {
  if (props.repository.owner?.login) {
    router.push({
      name: 'RepositoryDetail',
      params: {
        owner: props.repository.owner.login,
        repo: props.repository.name
      }
    })
  }
}

const handleSelectionToggle = (event: Event): void => {
  event.stopPropagation()
  emit('toggle-selection', props.repository)
}
</script>

<template>
  <div class="card h-100 repository-card position-relative" @click="viewRepository">
    <!-- Selection Checkbox -->
    <div class="position-absolute top-0 end-0 p-2">
      <div class="form-check">
        <input 
          class="form-check-input"
          type="checkbox"
          :checked="isSelected"
          :disabled="!canSelect"
          @click="handleSelectionToggle"
          :id="`repo-select-${repository.id}`"
        />
        <label 
          class="form-check-label visually-hidden" 
          :for="`repo-select-${repository.id}`"
        >
          Select for comparison
        </label>
      </div>
    </div>

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
  transition: transform 0.2s, box-shadow 0.2s;
}

.repository-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.language-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.form-check-input {
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--bs-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.form-check-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.position-relative {
  position: relative !important;
}

.position-absolute {
  position: absolute !important;
}

/* Ensure checkbox is clickable over card */
.form-check {
  z-index: 10;
}

@media (max-width: 768px) {
  .form-check-input {
    width: 1.125em;
    height: 1.125em;
  }
}
</style>