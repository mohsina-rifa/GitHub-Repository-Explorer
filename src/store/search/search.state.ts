import type { Repository } from '../../types/auth'

export interface FilterOptions {
  languages: string[]
  minStars?: number
  maxStars?: number
  minForks?: number
  maxForks?: number
  dateFrom?: string
  dateTo?: string
  licenses: string[]
  hasIssues?: boolean
  hasTopics?: boolean
}

export interface SearchState {
  // Search query
  query: string

  // Search results
  repositories: Repository[]
  totalCount: number

  // Pagination
  currentPage: number
  perPage: number
  totalPages: number

  // Filters
  filters: FilterOptions

  // Sorting
  sortBy: 'best-match' | 'stars' | 'forks' | 'updated'
  sortDirection: 'asc' | 'desc'

  // View mode
  viewMode: 'list' | 'grid'

  // Loading and error states
  isLoading: boolean
  error: string | null

  // Available filter options (populated from results)
  availableLanguages: string[]
  availableLicenses: string[]

  // Rate limit info
  rateLimit: {
    remaining: number
    limit: number
    reset: number
  } | null
}

export const state: SearchState = {
  query: '',
  repositories: [],
  totalCount: 0,
  currentPage: 1,
  perPage: 30,
  totalPages: 0,
  filters: {
    languages: [],
    licenses: []
  },
  sortBy: 'best-match',
  sortDirection: 'desc',
  viewMode: 'list',
  isLoading: false,
  error: null,
  availableLanguages: [],
  availableLicenses: [],
  rateLimit: null
}
