import type { Repository } from '../../types/auth'

export interface ComparisonState {
  // Selected repositories for comparison
  selectedRepositories: Repository[]

  // Maximum number of repositories that can be compared
  maxRepositories: number

  // Loading and error states
  isLoading: boolean
  error: string | null
}

export const state: ComparisonState = {
  selectedRepositories: [],
  maxRepositories: 4,
  isLoading: false,
  error: null
}