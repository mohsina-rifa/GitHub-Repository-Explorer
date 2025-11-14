import config from '../../utils/config'
import { Sanitizer } from '../../utils/sanitizer'

export class GitHubApiClient {
  private baseUrl: string
  private token: string
  private rateLimitRemaining: number = 5000
  private rateLimitLimit: number = 5000
  private rateLimitResetTime: Date = new Date()

  constructor() {
    this.baseUrl = config.githubApiBaseUrl
    this.token = config.githubToken
  }

  public async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': config.appName,
          ...config.securityHeaders
        }
      })

      // Update rate limit info from headers
      this.updateRateLimitInfo(response.headers)

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      // Sanitize response data
      return Sanitizer.sanitizeObject(data)
    } catch (error) {
      console.error('GitHub API request failed:', error)
      throw error
    }
  }

  public getRateLimitInfo(): { remaining: number; limit: number; resetTime: Date } {
    return {
      remaining: this.rateLimitRemaining,
      limit: this.rateLimitLimit,
      resetTime: this.rateLimitResetTime
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, Sanitizer.sanitizeForDisplay(value))
        }
      })
    }

    return url.toString()
  }

  private updateRateLimitInfo(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining')
    const limit = headers.get('X-RateLimit-Limit')
    const reset = headers.get('X-RateLimit-Reset')

    if (remaining) this.rateLimitRemaining = parseInt(remaining, 10)
    if (limit) this.rateLimitLimit = parseInt(limit, 10)
    if (reset) this.rateLimitResetTime = new Date(parseInt(reset, 10) * 1000)
  }
}
