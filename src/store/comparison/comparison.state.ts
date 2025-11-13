import type { GitHubRepositoryData } from '../../repositories/interfaces/iGitHubRepository'

export interface ComparisonState {
  selectedRepositories: GitHubRepositoryData[]
  maxRepositories: number
  isComparing: boolean
  comparisonId: string | null
}

export const state: ComparisonState = {
  selectedRepositories: [],
  maxRepositories: 4,
  isComparing: false,
  comparisonId: null
}