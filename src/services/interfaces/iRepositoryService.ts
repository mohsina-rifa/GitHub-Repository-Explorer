import type { GitHubRepositoryData } from '../../repositories/interfaces/iGitHubRepository'

// Repository service interface
export interface SearchFilters {
  language?: string
  stars?: string
  sort?: 'stars' | 'forks' | 'updated'
  order?: 'desc' | 'asc'
}

export interface SearchResult {
  items: GitHubRepositoryData[]
  total_count: number
  incomplete_results: boolean
}

export interface PaginationInfo {
  page: number
  per_page: number
  total_pages: number
  total_count: number
}

export interface IRepositoryService {
  searchRepositories(query: string, page?: number, filters?: SearchFilters): Promise<SearchResult>
  getRepositoryDetails(owner: string, repo: string): Promise<GitHubRepositoryData | null>
  getRepositoryReadme(owner: string, repo: string): Promise<string | null>
  getRepositoryContributors(owner: string, repo: string): Promise<unknown[]>
  getTrendingRepositories(language?: string): Promise<GitHubRepositoryData[]>
  getRateLimit(): Promise<{ remaining: number; limit: number; resetTime: Date }>
}
