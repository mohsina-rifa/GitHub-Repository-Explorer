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
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Vue: '#4FC08D',
    React: '#61DAFB',
    Swift: '#FA7343',
    Kotlin: '#7F52FF'
  }
  return colors[language] || '#6c757d'
}

const isSelected = computed(() => 
  comparisonStore.isRepositorySelected(props.repository.id)
)

const canSelect = computed(() => 
  isSelected.value || comparisonStore.canAddMore
)

const handleSelectionToggle = (event: Event): void => {
  event.stopPropagation()
  emit('toggle-selection', props.repository)
}

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
</script>

<template>
  <div class="card repository-item" @click="viewRepository">
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
                <span class="text-primary text-decoration-none">
                  {{ repository.name }}
                </span>
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
            <!-- Selection Checkbox -->
            <div class="form-check mb-2">
              <input 
                class="form-check-input"
                type="checkbox"
                :checked="isSelected"
                :disabled="!canSelect"
                @click="handleSelectionToggle"
                :id="`repo-list-select-${repository.id}`"
              />
              <label 
                class="form-check-label small text-muted" 
                :for="`repo-list-select-${repository.id}`"
              >
                Compare
              </label>
            </div>
            
            <!-- Repository Stats -->
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
            
            <!-- Last Updated -->
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
.repository-item {
  cursor: pointer;
  transition: transform 0.1s;
}

.repository-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.form-check-input:disabled {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .form-check {
    margin-bottom: 0.5rem;
  }
  
  .d-flex.gap-3 {
    gap: 1rem !important;
  }
}
</style>