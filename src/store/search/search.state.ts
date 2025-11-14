import type { GitHubRepositoryData } from '../../repositories/interfaces/iGitHubRepository'

export interface SearchFilters {
  language?: string
  stars?: string
  sort?: 'stars' | 'forks' | 'updated'
  order?: 'desc' | 'asc'
}

export interface SearchState {
  query: string
  results: GitHubRepositoryData[]
  totalCount: number
  currentPage: number
  isLoading: boolean
  error: string | null
  filters: SearchFilters
  viewMode: 'grid' | 'list'
  hasSearched: boolean
}

export const state: SearchState = {
  query: '',
  results: [],
  totalCount: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  filters: {},
  viewMode: 'grid',
  hasSearched: false
}