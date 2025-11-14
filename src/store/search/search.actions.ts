import type { SearchState, SearchFilters } from './search.state'
import type { SearchResult } from '../../services/interfaces/iRepositoryService'
import { ServiceFactory } from '../../services/factory/serviceFactory'
import { EventBus } from '../../utils/observer/eventBus'
import { Sanitizer } from '../../utils/sanitizer'

const repositoryService = ServiceFactory.getInstance().createRepositoryService()

// Event buses for live updates
const searchEventBus = EventBus.getInstance<{
  query: string
  results: SearchState['results']
  totalCount: number
  page: number
}>('search-results')

const loadingEventBus = EventBus.getInstance<boolean>('search-loading')
const errorEventBus = EventBus.getInstance<string | null>('search-error')

// Helper function to perform search logic
const performSearch = async (
  state: SearchState, 
  query: string, 
  page: number = 1
): Promise<void> => {
  if (!query.trim()) {
    state.error = 'Please enter a search query'
    return
  }

  const sanitizedQuery = Sanitizer.sanitizeSearchQuery(query)

  state.isLoading = true
  state.error = null
  state.query = sanitizedQuery
  state.currentPage = page
  state.hasSearched = true

  loadingEventBus.notify(true)

  try {
    const result: SearchResult = await repositoryService.searchRepositories(
      sanitizedQuery,
      page,
      state.filters
    )

    state.results = result.items
    state.totalCount = result.total_count

    searchEventBus.notify({
      query: state.query,
      results: state.results,
      totalCount: state.totalCount,
      page: state.currentPage
    })
  } catch (error: any) {
    state.error = error.message || 'Failed to search repositories'
    state.results = []
    state.totalCount = 0

    errorEventBus.notify(state.error)
  } finally {
    state.isLoading = false
    loadingEventBus.notify(false)
  }
}

export const actions = {
  async searchRepositories(this: SearchState, query: string, page: number = 1) {
    await performSearch(this, query, page)
  },

  async setFilters(this: SearchState, filters: SearchFilters) {
    this.filters = { ...filters }

    if (this.query.trim()) {
      await performSearch(this, this.query, 1)
    }
  },

  setViewMode(this: SearchState, mode: 'grid' | 'list') {
    this.viewMode = mode
    localStorage.setItem('github_explorer_view_mode', mode)
  },

  async nextPage(this: SearchState) {
    const totalPages = Math.ceil(this.totalCount / 30)
    if (this.currentPage < totalPages) {
      await performSearch(this, this.query, this.currentPage + 1)
    }
  },

  async previousPage(this: SearchState) {
    if (this.currentPage > 1) {
      await performSearch(this, this.query, this.currentPage - 1)
    }
  },

  async goToPage(this: SearchState, page: number) {
    const totalPages = Math.ceil(this.totalCount / 30)
    if (page >= 1 && page <= totalPages) {
      await performSearch(this, this.query, page)
    }
  },
  
  setQuery(this: SearchState, newQuery: string) {
    this.query = newQuery
  },

  clearSearch(this: SearchState) {
    this.query = ''
    this.results = []
    this.totalCount = 0
    this.currentPage = 1
    this.error = null
    this.hasSearched = false

    searchEventBus.notify({
      query: '',
      results: [],
      totalCount: 0,
      page: 1
    })
  },

  async clearFilters(this: SearchState) {
    this.filters = {}

    if (this.query.trim()) {
      await performSearch(this, this.query, this.currentPage)
    }
  },

  initializeViewMode(this: SearchState) {
    const savedMode = localStorage.getItem('github_explorer_view_mode') as 'grid' | 'list'
    if (savedMode) {
      this.viewMode = savedMode
    }
  }
}