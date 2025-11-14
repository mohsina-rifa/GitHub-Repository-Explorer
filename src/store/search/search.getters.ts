import type { SearchState } from './search.state'
import type { Repository } from '../../types/auth'

export const getters = {
  /**
   * Get filtered repositories (client-side filtering)
   */
  filteredRepositories: (state: SearchState): Repository[] => {
    let filtered = [...state.repositories]

    // Apply language filter
    if (state.filters.languages.length > 0) {
      filtered = filtered.filter(
        repo => repo.language && state.filters.languages.includes(repo.language)
      )
    }

    // Apply star count filter
    if (state.filters.minStars !== undefined) {
      filtered = filtered.filter(repo => repo.stargazers_count >= state.filters.minStars!)
    }
    if (state.filters.maxStars !== undefined) {
      filtered = filtered.filter(repo => repo.stargazers_count <= state.filters.maxStars!)
    }

    // Apply fork count filter
    if (state.filters.minForks !== undefined) {
      filtered = filtered.filter(repo => repo.forks_count >= state.filters.minForks!)
    }
    if (state.filters.maxForks !== undefined) {
      filtered = filtered.filter(repo => repo.forks_count <= state.filters.maxForks!)
    }

    // Apply date filter
    if (state.filters.dateFrom) {
      const fromDate = new Date(state.filters.dateFrom)
      filtered = filtered.filter(repo => new Date(repo.updated_at) >= fromDate)
    }
    if (state.filters.dateTo) {
      const toDate = new Date(state.filters.dateTo)
      filtered = filtered.filter(repo => new Date(repo.updated_at) <= toDate)
    }

    // Apply license filter
    if (state.filters.licenses.length > 0) {
      filtered = filtered.filter(
        repo => repo.license && state.filters.licenses.includes(repo.license.name)
      )
    }

    // Apply has issues filter
    if (state.filters.hasIssues !== undefined) {
      if (state.filters.hasIssues) {
        filtered = filtered.filter(repo => repo.open_issues_count > 0)
      }
    }

    // Apply has topics filter
    if (state.filters.hasTopics !== undefined) {
      if (state.filters.hasTopics) {
        filtered = filtered.filter(repo => repo.topics && repo.topics.length > 0)
      }
    }

    return filtered
  },

  /**
   * Get paginated repositories
   */
  paginatedRepositories: (state: SearchState) => {
    // Note: GitHub API handles pagination, so we just return repositories as-is
    return state.repositories
  },

  /**
   * Check if any filters are active
   */
  hasActiveFilters: (state: SearchState): boolean => {
    return (
      state.filters.languages.length > 0 ||
      state.filters.licenses.length > 0 ||
      state.filters.minStars !== undefined ||
      state.filters.maxStars !== undefined ||
      state.filters.minForks !== undefined ||
      state.filters.maxForks !== undefined ||
      state.filters.dateFrom !== undefined ||
      state.filters.dateTo !== undefined ||
      state.filters.hasIssues !== undefined ||
      state.filters.hasTopics !== undefined
    )
  },

  /**
   * Get active filters count
   */
  activeFiltersCount: (state: SearchState): number => {
    let count = 0
    if (state.filters.languages.length > 0) count++
    if (state.filters.licenses.length > 0) count++
    if (state.filters.minStars !== undefined || state.filters.maxStars !== undefined) count++
    if (state.filters.minForks !== undefined || state.filters.maxForks !== undefined) count++
    if (state.filters.dateFrom || state.filters.dateTo) count++
    if (state.filters.hasIssues !== undefined) count++
    if (state.filters.hasTopics !== undefined) count++
    return count
  },

  /**
   * Check if there are results
   */
  hasResults: (state: SearchState): boolean => {
    return state.repositories.length > 0
  },

  /**
   * Check if search is empty
   */
  isEmpty: (state: SearchState): boolean => {
    return !state.isLoading && state.repositories.length === 0 && state.query !== ''
  },

  /**
   * Get pagination info
   */
  paginationInfo: (state: SearchState) => {
    const start = (state.currentPage - 1) * state.perPage + 1
    const end = Math.min(state.currentPage * state.perPage, state.totalCount)
    return {
      start,
      end,
      total: state.totalCount,
      currentPage: state.currentPage,
      totalPages: state.totalPages
    }
  },

  /**
   * Check if rate limit is low
   */
  isRateLimitLow: (state: SearchState): boolean => {
    if (!state.rateLimit) return false
    return state.rateLimit.remaining < 10
  },

  /**
   * Get rate limit reset time
   */
  rateLimitResetTime: (state: SearchState): Date | null => {
    if (!state.rateLimit) return null
    return new Date(state.rateLimit.reset * 1000)
  }
}