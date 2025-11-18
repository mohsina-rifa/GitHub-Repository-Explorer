import type { Repository } from '../types/auth'
import { githubHttp } from './github.http'
import config from '../utils/config'

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
  private async request<T>(config: {
    method?: 'get' | 'post' | 'put' | 'delete'
    url: string
    params?: Record<string, any>
    headers?: Record<string, any>
    responseType?: string
  }): Promise<T> {
    try {
      const resp = await githubHttp.request({
        method: config.method || 'get',
        url: config.url,
        params: config.params,
        headers: config.headers,
        responseType: (config.responseType as any) || undefined
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
          throw new Error('Validation failed. Please check your search query.')
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
    const { query, sort, order = 'desc', perPage = 30, page = 1 } = params

    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty')
    }

    const queryParams: Record<string, any> = {
      q: query.trim(),
      per_page: perPage,
      page
    }

    if (sort) {
      queryParams.sort = sort
      queryParams.order = order
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
    let searchQuery = params.query

    // Add language filters
    if (params.language && params.language.length > 0) {
      params.language.forEach(lang => {
        searchQuery += ` language:${lang}`
      })
    }

    // Add star filters
    if (params.stars) {
      if (params.stars.min !== undefined && params.stars.max !== undefined) {
        searchQuery += ` stars:${params.stars.min}..${params.stars.max}`
      } else if (params.stars.min !== undefined) {
        searchQuery += ` stars:>=${params.stars.min}`
      } else if (params.stars.max !== undefined) {
        searchQuery += ` stars:<=${params.stars.max}`
      }
    }

    // Add fork filters
    if (params.forks) {
      if (params.forks.min !== undefined && params.forks.max !== undefined) {
        searchQuery += ` forks:${params.forks.min}..${params.forks.max}`
      } else if (params.forks.min !== undefined) {
        searchQuery += ` forks:>=${params.forks.min}`
      } else if (params.forks.max !== undefined) {
        searchQuery += ` forks:<=${params.forks.max}`
      }
    }

    // Add created date filters
    if (params.created) {
      if (params.created.from && params.created.to) {
        searchQuery += ` created:${params.created.from}..${params.created.to}`
      } else if (params.created.from) {
        searchQuery += ` created:>=${params.created.from}`
      } else if (params.created.to) {
        searchQuery += ` created:<=${params.created.to}`
      }
    }

    // Add pushed date filters
    if (params.pushed) {
      if (params.pushed.from && params.pushed.to) {
        searchQuery += ` pushed:${params.pushed.from}..${params.pushed.to}`
      } else if (params.pushed.from) {
        searchQuery += ` pushed:>=${params.pushed.from}`
      } else if (params.pushed.to) {
        searchQuery += ` pushed:<=${params.pushed.to}`
      }
    }

    // Add license filters
    if (params.license && params.license.length > 0) {
      params.license.forEach(lic => {
        searchQuery += ` license:${lic}`
      })
    }

    // Add topic filters
    if (params.topic && params.topic.length > 0) {
      params.topic.forEach(topic => {
        searchQuery += ` topic:${topic}`
      })
    }

    // Add archived filter
    if (params.archived !== undefined) {
      searchQuery += ` archived:${params.archived}`
    }

    // Add fork filter
    if (params.fork !== undefined) {
      if (params.fork === 'only') {
        searchQuery += ` fork:only`
      } else {
        searchQuery += ` fork:${params.fork}`
      }
    }

    return searchQuery
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    return this.request<Repository>({ url: `/repos/${owner}/${repo}` })
  }

  /**
   * Get repository by numeric ID
   */
  async getRepositoryById(id: number): Promise<Repository> {
    return this.request<Repository>({ url: `/repositories/${id}` })
  }

  /**
   * Get repository README
   */
  async getRepositoryReadme(owner: string, repo: string): Promise<{ content: string }> {
    const data = await this.request<string>({
      url: `/repos/${owner}/${repo}/readme`,
      headers: { Accept: 'application/vnd.github.v3.raw' },
      responseType: 'text'
    })

    return { content: data }
  }

  /**
   * Get repository contributors
   */
  async getRepositoryContributors(owner: string, repo: string, perPage = 30): Promise<any[]> {
    return this.request<any[]>({
      url: `/repos/${owner}/${repo}/contributors`,
      params: { per_page: perPage }
    })
  }

  /**
   * Get repository languages
   */
  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    return this.request<Record<string, number>>({ url: `/repos/${owner}/${repo}/languages` })
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
    const p = {
      state: params?.state || 'open',
      per_page: params?.perPage || 30,
      page: params?.page || 1
    }

    return this.request<any[]>({ url: `/repos/${owner}/${repo}/issues`, params: p })
  }
}

export const githubApi = new GitHubApiService()
