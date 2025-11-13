import type {
  IRepositoryService,
  SearchResult,
  SearchFilters
} from './interfaces/iRepositoryService'
import type { GitHubRepositoryData } from '../repositories/interfaces/iGitHubRepository'
import type { ICacheService } from './interfaces/iCacheService'
import type { GitHubApiClient } from './api/gitHubApiClient'
import { CacheKeys } from './cache/cacheKeys'
import { Validator } from '../utils/validator'

// Main repository service implementation
export class RepositoryService implements IRepositoryService {
  private cache: ICacheService | null
  private apiClient: GitHubApiClient

  constructor(cache: ICacheService | null, apiClient: GitHubApiClient) {
    this.cache = cache
    this.apiClient = apiClient
  }

  public async searchRepositories(
    query: string,
    page: number = 1,
    filters?: SearchFilters
  ): Promise<SearchResult> {
    // Validate input
    if (!Validator.isValidSearchQuery(query)) {
      throw new Error('Invalid search query')
    }

    const cacheKey = CacheKeys.SEARCH_REPOSITORIES(query, page)

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get<SearchResult>(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Build search parameters
    const params: Record<string, string> = {
      q: query,
      page: page.toString(),
      per_page: '30'
    }

    if (filters?.language) {
      params.q += ` language:${filters.language}`
    }
    if (filters?.stars) {
      params.q += ` stars:${filters.stars}`
    }
    if (filters?.sort) {
      params.sort = filters.sort
    }
    if (filters?.order) {
      params.order = filters.order
    }

    // Make API call
    const result = await this.apiClient.get<SearchResult>('/search/repositories', params)

    // Cache result
    if (this.cache) {
      this.cache.set(cacheKey, result, CacheKeys.TTL.SEARCH_RESULTS)
    }

    return result
  }

  public async getRepositoryDetails(
    owner: string,
    repo: string
  ): Promise<GitHubRepositoryData | null> {
    if (!Validator.isValidRepositoryPath(`${owner}/${repo}`)) {
      throw new Error('Invalid repository path')
    }

    const cacheKey = CacheKeys.REPOSITORY_DETAILS(owner, repo)

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get<GitHubRepositoryData>(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Make API call
    const result = await this.apiClient.get<GitHubRepositoryData>(`/repos/${owner}/${repo}`)

    // Cache result
    if (this.cache) {
      this.cache.set(cacheKey, result, CacheKeys.TTL.REPOSITORY_DETAILS)
    }

    return result
  }

  public async getRepositoryReadme(owner: string, repo: string): Promise<string | null> {
    if (!Validator.isValidRepositoryPath(`${owner}/${repo}`)) {
      throw new Error('Invalid repository path')
    }

    const cacheKey = CacheKeys.REPOSITORY_README(owner, repo)

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get<string>(cacheKey)
      if (cached) {
        return cached
      }
    }

    try {
      const result = await this.apiClient.get<{ content: string; encoding: string }>(
        `/repos/${owner}/${repo}/readme`
      )

      // Decode base64 content
      const content =
        result.encoding === 'base64' ? atob(result.content.replace(/\s/g, '')) : result.content

      // Cache result
      if (this.cache) {
        this.cache.set(cacheKey, content, CacheKeys.TTL.README_CONTENT)
      }

      return content
    } catch (error) {
      console.warn(`README not found for ${owner}/${repo}:`, error)
      return null
    }
  }

  public async getRepositoryContributors(owner: string, repo: string): Promise<unknown[]> {
    if (!Validator.isValidRepositoryPath(`${owner}/${repo}`)) {
      throw new Error('Invalid repository path')
    }

    const cacheKey = CacheKeys.REPOSITORY_CONTRIBUTORS(owner, repo)

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get<unknown[]>(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Make API call
    const result = await this.apiClient.get<unknown[]>(`/repos/${owner}/${repo}/contributors`)

    // Cache result
    if (this.cache) {
      this.cache.set(cacheKey, result, CacheKeys.TTL.CONTRIBUTORS)
    }

    return result
  }

  public async getTrendingRepositories(language?: string): Promise<GitHubRepositoryData[]> {
    const cacheKey = CacheKeys.TRENDING_REPOSITORIES(language)

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get<GitHubRepositoryData[]>(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Build trending query (repositories created in the last 7 days, sorted by stars)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    let query = `created:>${oneWeekAgo}`

    if (language) {
      query += ` language:${language}`
    }

    const params: Record<string, string> = {
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: '10'
    }

    const result = await this.apiClient.get<SearchResult>('/search/repositories', params)

    // Cache result
    if (this.cache) {
      this.cache.set(cacheKey, result.items, CacheKeys.TTL.TRENDING)
    }

    return result.items
  }

  public async getRateLimit(): Promise<{ remaining: number; limit: number; resetTime: Date }> {
    return this.apiClient.getRateLimitInfo()
  }
}
