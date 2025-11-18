import type { Repository } from '../types/auth'
import { githubHttp } from './github.http'
import config from '../utils/config'
import { Sanitizer } from '../utils/sanitizer'
import { Validator } from '../utils/validator'

interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: Repository[]
}

interface GitHubRateLimit {
  limit: number
  remaining: number
  reset: number
  used: number
}

interface GitHubError {
  message: string
  documentation_url?: string
}

class GitHubApiService {
  constructor() {
    // base URL is configured in the axios instance (src/api/github.http.ts)
    if (!config.githubToken) {
      console.warn('GitHub token not found. API requests may be rate limited.')
    }
  }

  /**
   * Small wrapper around the axios instance to normalize responses and errors
   */
  private async request<T>(configReq: {
    method?: 'get' | 'post' | 'put' | 'delete'
    url: string
    params?: Record<string, any>
    headers?: Record<string, any>
    responseType?: string
  }): Promise<T> {
    try {
      const resp = await githubHttp.request({
        method: configReq.method || 'get',
        url: configReq.url,
        params: configReq.params,
        headers: configReq.headers,
        responseType: (configReq.responseType as any) || undefined
      })

      return resp.data as T
    } catch (err: any) {
      // axios error handling
      if (err.response) {
        const status = err.response.status
        const data = err.response.data as GitHubError | any
        const rateReset = err.response.headers?.['x-ratelimit-reset']

        if (status === 401) {
          throw new Error('Invalid GitHub token. Please check your authentication.')
        }

        if (status === 403 && rateReset) {
          const resetDate = new Date(parseInt(rateReset, 10) * 1000)
          throw new Error(
            `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`
          )
        }

        if (status === 422) {
          throw new Error('Validation failed. Please check your request parameters.')
        }

        const message = (data && data.message) || `GitHub API Error: ${status}`
        throw new Error(message)
      }

      // network or unknown error
      throw err
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<GitHubRateLimit> {
    const data = await this.request<{ rate: GitHubRateLimit }>({ url: '/rate_limit' })
    return data.rate
  }

  /**
   * Search repositories
   */
  async searchRepositories(params: {
    query: string
    sort?: 'stars' | 'forks' | 'updated' | 'help-wanted-issues'
    order?: 'asc' | 'desc'
    perPage?: number
    page?: number
  }): Promise<GitHubSearchResponse> {
    const rawQuery = params.query || ''
    const query = Sanitizer.sanitizeSearchQuery(rawQuery)

    if (!Validator.isValidSearchQuery(query)) {
      throw new Error('Search query is invalid or empty')
    }

    const perPage = Number.isFinite(Number(params.perPage)) ? Math.max(1, Math.min(100, Number(params.perPage))) : 30
    const page = Number.isFinite(Number(params.page)) ? Math.max(1, Number(params.page)) : 1

    const queryParams: Record<string, any> = {
      q: query,
      per_page: perPage,
      page
    }

    if (params.sort) {
      queryParams.sort = params.sort
      queryParams.order = params.order || 'desc'
    }

    return this.request<GitHubSearchResponse>({ url: '/search/repositories', params: queryParams })
  }

  /**
   * Build advanced search query
   */
  buildSearchQuery(params: {
    query: string
    language?: string[]
    stars?: { min?: number; max?: number }
    forks?: { min?: number; max?: number }
    created?: { from?: string; to?: string }
    pushed?: { from?: string; to?: string }
    license?: string[]
    topic?: string[]
    archived?: boolean
    fork?: boolean | 'only'
  }): string {
    let searchQuery = Sanitizer.sanitizeSearchQuery(params.query || '')

    // ensure base query is valid (allow empty advanced queries to still work)
    if (searchQuery && !Validator.isValidSearchQuery(searchQuery)) {
      searchQuery = ''
    }

    // Add language filters
    if (params.language && params.language.length > 0) {
      params.language.forEach(lang => {
        const safeLang = Sanitizer.sanitizeRepositoryName(lang)
        if (safeLang) searchQuery += (searchQuery ? ' ' : '') + `language:${safeLang}`
      })
    }

    // Add star filters
    if (params.stars) {
      const min = typeof params.stars.min === 'number' ? params.stars.min : undefined
      const max = typeof params.stars.max === 'number' ? params.stars.max : undefined
      if (min !== undefined && max !== undefined) {
        searchQuery += (searchQuery ? ' ' : '') + `stars:${min}..${max}`
      } else if (min !== undefined) {
        searchQuery += (searchQuery ? ' ' : '') + `stars:>=${min}`
      } else if (max !== undefined) {
        searchQuery += (searchQuery ? ' ' : '') + `stars:<=${max}`
      }
    }

    // Add fork filters
    if (params.forks) {
      const min = typeof params.forks.min === 'number' ? params.forks.min : undefined
      const max = typeof params.forks.max === 'number' ? params.forks.max : undefined
      if (min !== undefined && max !== undefined) {
        searchQuery += (searchQuery ? ' ' : '') + `forks:${min}..${max}`
      } else if (min !== undefined) {
        searchQuery += (searchQuery ? ' ' : '') + `forks:>=${min}`
      } else if (max !== undefined) {
        searchQuery += (searchQuery ? ' ' : '') + `forks:<=${max}`
      }
    }

    // Add created date filters
    if (params.created) {
      const from = Sanitizer.escapeHtml(params.created.from || '')
      const to = Sanitizer.escapeHtml(params.created.to || '')
      if (from && to) {
        searchQuery += (searchQuery ? ' ' : '') + `created:${from}..${to}`
      } else if (from) {
        searchQuery += (searchQuery ? ' ' : '') + `created:>=${from}`
      } else if (to) {
        searchQuery += (searchQuery ? ' ' : '') + `created:<=${to}`
      }
    }

    // Add pushed date filters
    if (params.pushed) {
      const from = Sanitizer.escapeHtml(params.pushed.from || '')
      const to = Sanitizer.escapeHtml(params.pushed.to || '')
      if (from && to) {
        searchQuery += (searchQuery ? ' ' : '') + `pushed:${from}..${to}`
      } else if (from) {
        searchQuery += (searchQuery ? ' ' : '') + `pushed:>=${from}`
      } else if (to) {
        searchQuery += (searchQuery ? ' ' : '') + `pushed:<=${to}`
      }
    }

    // Add license filters
    if (params.license && params.license.length > 0) {
      params.license.forEach(lic => {
        const safeLic = Sanitizer.sanitizeRepositoryName(lic)
        if (safeLic) searchQuery += (searchQuery ? ' ' : '') + `license:${safeLic}`
      })
    }

    // Add topic filters
    if (params.topic && params.topic.length > 0) {
      params.topic.forEach(topic => {
        const safeTopic = Sanitizer.sanitizeRepositoryName(topic)
        if (safeTopic) searchQuery += (searchQuery ? ' ' : '') + `topic:${safeTopic}`
      })
    }

    // Add archived filter
    if (typeof params.archived === 'boolean') {
      searchQuery += (searchQuery ? ' ' : '') + `archived:${params.archived}`
    }

    // Add fork filter
    if (params.fork !== undefined) {
      if (params.fork === 'only') {
        searchQuery += (searchQuery ? ' ' : '') + `fork:only`
      } else {
        searchQuery += (searchQuery ? ' ' : '') + `fork:${params.fork}`
      }
    }

    return searchQuery.trim()
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    if (!Validator.isValidGitHubUsername(owner) || !Validator.isValidRepositoryName(repo)) {
      throw new Error('Invalid repository owner or name')
    }

    const safeOwner = Sanitizer.sanitizeRepositoryName(owner)
    const safeRepo = Sanitizer.sanitizeRepositoryName(repo)

    const url = `/repos/${encodeURIComponent(safeOwner)}/${encodeURIComponent(safeRepo)}`
    return this.request<Repository>({ url })
  }

  /**
   * Get repository by numeric ID
   */
  async getRepositoryById(id: number): Promise<Repository> {
    if (!Number.isFinite(Number(id)) || id <= 0) {
      throw new Error('Invalid repository id')
    }
    return this.request<Repository>({ url: `/repositories/${id}` })
  }

  /**
   * Get repository README
   */
  async getRepositoryReadme(owner: string, repo: string): Promise<{ content: string }> {
    if (!Validator.isValidGitHubUsername(owner) || !Validator.isValidRepositoryName(repo)) {
      throw new Error('Invalid repository owner or name')
    }

    const safeOwner = Sanitizer.sanitizeRepositoryName(owner)
    const safeRepo = Sanitizer.sanitizeRepositoryName(repo)

    const data = await this.request<string>({
      url: `/repos/${encodeURIComponent(safeOwner)}/${encodeURIComponent(safeRepo)}/readme`,
      headers: { Accept: 'application/vnd.github.v3.raw' },
      responseType: 'text'
    })

    return { content: data }
  }

  /**
   * Get repository contributors
   */
  async getRepositoryContributors(owner: string, repo: string, perPage = 30): Promise<any[]> {
    if (!Validator.isValidGitHubUsername(owner) || !Validator.isValidRepositoryName(repo)) {
      throw new Error('Invalid repository owner or name')
    }

    const safeOwner = Sanitizer.sanitizeRepositoryName(owner)
    const safeRepo = Sanitizer.sanitizeRepositoryName(repo)

    const p = {
      per_page: Math.max(1, Math.min(100, Number(perPage)))
    }

    return this.request<any[]>({
      url: `/repos/${encodeURIComponent(safeOwner)}/${encodeURIComponent(safeRepo)}/contributors`,
      params: p
    })
  }

  /**
   * Get repository languages
   */
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    if (!Validator.isValidGitHubUsername(owner) || !Validator.isValidRepositoryName(repo)) {
      throw new Error('Invalid repository owner or name')
    }

    const safeOwner = Sanitizer.sanitizeRepositoryName(owner)
    const safeRepo = Sanitizer.sanitizeRepositoryName(repo)

    return this.request<Record<string, number>>({
      url: `/repos/${encodeURIComponent(safeOwner)}/${encodeURIComponent(safeRepo)}/languages`
    })
  }

  /**
   * Get repository issues
   */
  async getRepositoryIssues(
    owner: string,
    repo: string,
    params?: {
      state?: 'open' | 'closed' | 'all'
      perPage?: number
      page?: number
    }
  ): Promise<any[]> {
    if (!Validator.isValidGitHubUsername(owner) || !Validator.isValidRepositoryName(repo)) {
      throw new Error('Invalid repository owner or name')
    }

    const safeOwner = Sanitizer.sanitizeRepositoryName(owner)
    const safeRepo = Sanitizer.sanitizeRepositoryName(repo)

    const p = {
      state: params?.state || 'open',
      per_page: Number.isFinite(Number(params?.perPage)) ? Math.max(1, Math.min(100, Number(params!.perPage))) : 30,
      page: Number.isFinite(Number(params?.page)) ? Math.max(1, Number(params!.page)) : 1
    }

    return this.request<any[]>({
      url: `/repos/${encodeURIComponent(safeOwner)}/${encodeURIComponent(safeRepo)}/issues`,
      params: p
    })
  }
}

export const githubApi = new GitHubApiService()