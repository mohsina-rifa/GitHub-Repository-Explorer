<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from '../store/search/search.store'
import { storeToRefs } from 'pinia'
import SearchInput from '../components/SearchInput.vue'
import FilterDropdown from '../components/FilterDropdown.vue'
import RepositoryCard from '../components/RepositoryCard.vue'
import RepositoryListItem from '../components/RepositoryListItem.vue'
import Pagination from '../components/Pagination.vue'
const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()

const {
  query,
  results,
  totalCount,
  currentPage,
  isLoading,
  error,
  filters,
  viewMode,
  hasResults,
  totalPages,
  hasActiveFilters,
  searchSummary
} = storeToRefs(searchStore)

const searchQuery = ref('')
const hasSearched = computed(() => searchStore.hasSearched)

// Filter options
const languageOptions = [
  { value: 'javascript', label: 'JavaScript', icon: 'bi bi-braces' },
  { value: 'typescript', label: 'TypeScript', icon: 'bi bi-braces' },
  { value: 'python', label: 'Python', icon: 'bi bi-code' },
  { value: 'java', label: 'Java', icon: 'bi bi-cup-hot' },
  { value: 'go', label: 'Go', icon: 'bi bi-lightning' },
  { value: 'rust', label: 'Rust', icon: 'bi bi-gear' }
]

const starsOptions = [
  { value: '>1000', label: '1,000+ stars' },
  { value: '>5000', label: '5,000+ stars' },
  { value: '>10000', label: '10,000+ stars' },
  { value: '>50000', label: '50,000+ stars' }
]

const sortOptions = [
  { value: 'stars', label: 'Most stars' },
  { value: 'forks', label: 'Most forks' },
  { value: 'updated', label: 'Recently updated' }
]

// Methods
const handleSearch = async (searchQuery: string): Promise<void> => {
  await searchStore.searchRepositories(searchQuery, 1)
  updateUrlState()
}

const handleClearSearch = (): void => {
  searchStore.clearSearch()
  searchQuery.value = ''
  router.push({ name: 'search' })
}

const setViewMode = (mode: 'grid' | 'list'): void => {
  searchStore.setViewMode(mode)
}

const handleFilterChange = (): void => {
  if (query.value.trim()) {
    searchStore.searchRepositories(query.value, 1)
    updateUrlState()
  }
}

const clearAllFilters = (): void => {
  searchStore.clearFilters()
  updateUrlState()
}

const handlePageChange = (page: number): void => {
  if (query.value.trim()) {
    searchStore.searchRepositories(query.value, page)
    updateUrlState()
  }
}

const retrySearch = (): void => {
  if (query.value.trim()) {
    searchStore.searchRepositories(query.value, currentPage.value)
  }
}

const updateUrlState = (): void => {
  const queryParams: any = {}

  if (query.value) queryParams.q = query.value
  if (currentPage.value > 1) queryParams.page = currentPage.value
  if (filters.value.language) queryParams.language = filters.value.language
  if (filters.value.stars) queryParams.stars = filters.value.stars
  if (filters.value.sort) queryParams.sort = filters.value.sort

  router.push({ name: 'search', query: queryParams })
}

const initializeFromUrl = (): void => {
  const urlQuery = route.query.q as string
  const urlPage = parseInt(route.query.page as string) || 1
  const urlLanguage = route.query.language as string
  const urlStars = route.query.stars as string
  const urlSort = route.query.sort as string

  if (urlQuery) {
    searchQuery.value = urlQuery
    searchStore.setQuery(urlQuery)
  }

  const validSortValues = ['stars', 'forks', 'updated']
  const validSort = validSortValues.includes(urlSort) ? urlSort as 'stars' | 'forks' | 'updated' : undefined

  if (urlLanguage || urlStars || validSort) {
    searchStore.setFilters({
      language: urlLanguage,
      stars: urlStars,
      sort: validSort
    })
  }

  if (urlQuery) {
    searchStore.searchRepositories(urlQuery, urlPage)
  }
}

// Watchers
watch(
  () => route.query,
  () => {
    if (route.name === 'search') {
      initializeFromUrl()
    }
  }
)

onMounted(() => {
  searchStore.initializeViewMode()
  initializeFromUrl()
})
</script>

<template>
  <div class="search-view">
    <!-- Search Header -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="search-header py-4">
            <div class="row align-items-center">
              <div class="col-md-8 col-lg-6">
                <SearchInput
                  v-model="searchQuery"
                  placeholder="Search GitHub repositories..."
                  :disabled="isLoading"
                  auto-focus
                  @search="handleSearch"
                  @clear="handleClearSearch"
                />
              </div>
              <div class="col-md-4 col-lg-6">
                <div class="d-flex justify-content-end align-items-center gap-2">
                  <!-- View Toggle -->
                  <div class="btn-group" role="group">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      :class="{ active: viewMode === 'grid' }"
                      @click="setViewMode('grid')"
                    >
                      <i class="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      :class="{ active: viewMode === 'list' }"
                      @click="setViewMode('list')"
                    >
                      <i class="bi bi-list"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="filters-section bg-light py-3 mb-4">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <div class="d-flex flex-wrap gap-2">
                  <FilterDropdown
                    v-model="filters.language"
                    label="Language"
                    :options="languageOptions"
                    @change="handleFilterChange"
                  />
                  <FilterDropdown
                    v-model="filters.stars"
                    label="Stars"
                    :options="starsOptions"
                    @change="handleFilterChange"
                  />
                  <FilterDropdown
                    v-model="filters.sort"
                    label="Sort"
                    :options="sortOptions"
                    @change="handleFilterChange"
                  />
                </div>
              </div>
              <div class="col-lg-4">
                <div class="d-flex justify-content-lg-end">
                  <button
                    v-if="hasActiveFilters"
                    class="btn btn-outline-danger btn-sm"
                    @click="clearAllFilters"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Searching...</span>
            </div>
            <p class="mt-3 text-muted">Searching repositories...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Search Error</h4>
            <p>{{ error }}</p>
            <hr />
            <button class="btn btn-outline-danger" @click="retrySearch">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Try Again
            </button>
          </div>

          <!-- Results Summary -->
          <div v-else-if="hasSearched && !isLoading" class="results-summary mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h2 class="h5 mb-0">{{ searchSummary }}</h2>
              <small class="text-muted">
                {{ totalCount.toLocaleString() }} repositories found
              </small>
            </div>
          </div>

          <!-- No Results -->
          <div v-if="hasSearched && !hasResults && !isLoading && !error" class="text-center py-5">
            <i class="bi bi-search display-4 text-muted mb-3"></i>
            <h3>No repositories found</h3>
            <p class="text-muted">Try adjusting your search terms or filters</p>
          </div>

          <!-- Results Grid/List -->
          <div v-if="hasResults && !isLoading" class="results-container">
            <div v-if="viewMode === 'grid'" class="row">
              <div
                v-for="repository in results"
                :key="repository.id"
                class="col-xl-4 col-lg-6 col-md-6 col-12 mb-4"
              >
                <RepositoryCard :repository="repository" />
              </div>
            </div>

            <div v-else class="repository-list">
              <RepositoryListItem
                v-for="repository in results"
                :key="repository.id"
                :repository="repository"
                class="mb-3"
              />
            </div>
          </div>

          <!-- Pagination -->
          <Pagination
            v-if="hasResults && totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            :is-loading="isLoading"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  min-height: 100vh;
  background-color: var(--bs-body-bg);
}

.search-header {
  background-color: var(--bs-white);
  border-bottom: 1px solid var(--bs-border-color);
}

.filters-section {
  border-radius: 0.375rem;
  border: 1px solid var(--bs-border-color);
}

.results-container {
  min-height: 400px;
}

.results-summary {
  padding: 1rem 0;
  border-bottom: 1px solid var(--bs-border-color);
}

@media (max-width: 768px) {
  .search-header {
    padding: 1rem 0 !important;
  }

  .filters-section .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}
</style>
