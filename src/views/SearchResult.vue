<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSearchStore } from '../store/search/search.store'
import Repository from '../components/Repository.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const searchStore = useSearchStore()

// Get query from route params and convert kebab-case back to normal
const searchQuery = computed(() => {
  const query = route.params.query as string
  return query.replace(/-/g, ' ')
})

// Store state as computed properties
const repositories = computed(() => searchStore.repositories)
const isLoading = computed(() => searchStore.isLoading)
const error = computed(() => searchStore.error)
const totalCount = computed(() => searchStore.totalCount)
const currentPage = computed(() => searchStore.currentPage)
const totalPages = computed(() => searchStore.totalPages)
const perPage = computed(() => searchStore.perPage)
const sortBy = computed(() => searchStore.sortBy)
const paginationInfo = computed(() => searchStore.paginationInfo)

// Selected repositories for comparison (keep local for now, will be moved to comparison store later)
const selectedRepos = computed(() => new Set<number>())

// Perform search when component mounts
onMounted(() => {
  // Load view mode from localStorage
  searchStore.loadViewMode()

  // Perform initial search
  if (searchQuery.value) {
    searchStore.performSearch(searchQuery.value)
  }
})

// Watch for route changes
watch(
  () => route.params.query,
  newQuery => {
    if (newQuery) {
      const query = (newQuery as string).replace(/-/g, ' ')
      searchStore.performSearch(query)
    }
  }
)

// Toggle repository selection (will be moved to comparison store later)
const toggleSelection = (id: number) => {
  console.log('Toggle selection:', id)
  // TODO: Implement with comparison store
}

// Toggle favorite
const toggleFavorite = (id: number) => {
  console.log('Toggle favorite:', id)
  // TODO: Implement with favorites functionality
}

// Handle page change
const handlePageChange = (page: number) => {
  searchStore.goToPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle sort change
const handleSortChange = (option: string) => {
  if (option === 'best-match' || option === 'stars' || option === 'forks' || option === 'updated') {
    searchStore.setSortBy(option as 'best-match' | 'stars' | 'forks' | 'updated')
  }
}

// Handle view mode change

// Format sort label for display
const sortLabel = computed(() => {
  const labels: Record<string, string> = {
    'best-match': 'Best match',
    stars: 'Most stars',
    forks: 'Most forks',
    updated: 'Recently updated'
  }
  return labels[sortBy.value] || 'Best match'
})
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Main Content -->
      <main class="col-12 main-content">
        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error:</strong> {{ error }}
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="searchStore.setError(null)"
          ></button>
        </div>

        <!-- Loading State (Initial) -->
        <div v-if="isLoading && repositories.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Searching repositories...</p>
        </div>

        <!-- Results Header -->
        <div v-if="!isLoading || repositories.length > 0" class="results-header">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="results-info">
              <h4 class="mb-1">
                <strong>{{ totalCount.toLocaleString() }}</strong> repositories found for
                <span class="text-primary">"{{ searchQuery }}"</span>
              </h4>
              <p class="text-muted mb-0">
                Showing {{ paginationInfo.start }}-{{ paginationInfo.end }} of
                {{ totalCount.toLocaleString() }} results
              </p>
            </div>

            <div class="results-controls d-flex gap-2 align-items-center">
              <!-- Sort Dropdown -->
              <div class="dropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  :disabled="isLoading"
                >
                  <i class="bi bi-sort-down"></i> Sort: {{ sortLabel }}
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortBy === 'best-match' }"
                      href="#"
                      @click.prevent="handleSortChange('best-match')"
                    >
                      Best match
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortBy === 'stars' }"
                      href="#"
                      @click.prevent="handleSortChange('stars')"
                    >
                      Most stars
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortBy === 'forks' }"
                      href="#"
                      @click.prevent="handleSortChange('forks')"
                    >
                      Most forks
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortBy === 'updated' }"
                      href="#"
                      @click.prevent="handleSortChange('updated')"
                    >
                      Recently updated
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Compare Button -->
              <button class="btn btn-primary" :disabled="selectedRepos.size === 0">
                <i class="bi bi-arrow-left-right"></i> Compare ({{ selectedRepos.size }})
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && repositories.length === 0 && !error" class="text-center py-5">
          <i class="bi bi-inbox" style="font-size: 4rem; color: #6c757d"></i>
          <h4 class="mt-3">No repositories found</h4>
          <p class="text-muted">
            Try adjusting your search query or filters to find what you're looking for.
          </p>
        </div>

        <!-- Repository List -->
        <div v-if="repositories.length > 0" class="repository-list">
          <Repository
            v-for="repo in repositories"
            :key="repo.id"
            :repository="repo"
            :is-selected="selectedRepos.has(repo.id)"
            @toggle-select="toggleSelection"
            @toggle-favorite="toggleFavorite"
          />

          <!-- Loading Overlay for Pagination -->
          <div v-if="isLoading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span class="ms-2 text-muted">Loading more results...</span>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="repositories.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalCount"
          :items-per-page="perPage"
          @page-change="handlePageChange"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 56px);
}

.results-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-info h4 {
  font-size: 1.25rem;
  color: #212529;
}

.results-info strong {
  color: var(--bs-primary);
}

.results-controls {
  flex-wrap: wrap;
}

.results-controls .btn {
  font-size: 0.9rem;
}

.results-controls .dropdown-menu {
  font-size: 0.9rem;
}

.repository-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Loading spinner */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Alert styling */
.alert {
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

@media (max-width: 991px) {
  .main-content {
    padding: 1rem;
  }

  .results-header {
    padding: 1rem;
  }

  .results-controls {
    width: 100%;
    margin-top: 1rem;
  }

  .results-controls > * {
    flex: 1;
  }
}

@media (max-width: 576px) {
  .results-controls {
    flex-direction: column;
    align-items: stretch !important;
  }

  .results-controls .dropdown,
  .results-controls .btn-group,
  .results-controls .btn {
    width: 100%;
  }

  .results-controls .btn-group .btn {
    width: 50%;
  }
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}
</style>
