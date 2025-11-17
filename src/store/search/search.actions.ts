import type { FilterOptions } from './search.state'
import type { Repository } from '../../types/auth'
import { githubApi } from '../../api//github.api'

export const actions = {
  /**
   * Set search query
   * @param query - Search query string
   */
  setQuery(this: any, query: string) {
    this.query = query
  },

  /**
   * Set repositories and update available filters
   * @param repositories - Array of Repository objects
   */
  setRepositories(this: any, repositories: Repository[]) {
    this.repositories = repositories
    this.updateAvailableFilters()
  },

  /**
   * Set total count and calculate total pages
   * @param count - Total number of results
   */
  setTotalCount(this: any, count: number) {
    this.totalCount = count
    this.totalPages = Math.ceil(count / (this.perPage || 1))
  },

  /**
   * Set current page number
   * @param page - Page number
   */
  setCurrentPage(this: any, page: number) {
    this.currentPage = page
  },

  /**
   * Set items per page and recalculate total pages
   * @param perPage - Number of items per page
   */
  setPerPage(this: any, perPage: number) {
    this.perPage = perPage
    this.totalPages = Math.ceil((this.totalCount || 0) / (this.perPage || 1))
    this.currentPage = 1
  },

  /**
   * Set sort option and re-search
   * @param sortBy - Sort field
   */
  setSortBy(this: any, sortBy: 'best-match' | 'stars' | 'forks' | 'updated') {
    this.sortBy = sortBy
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set sort direction and re-search
   * @param direction - Sort direction
   */
  setSortDirection(this: any, direction: 'asc' | 'desc') {
    this.sortDirection = direction
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Toggle between asc and desc sort direction
   */
  toggleSortDirection(this: any) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set view mode and persist to localStorage
   * @param mode - View mode (list or grid)
   */
  setViewMode(this: any, mode: 'list' | 'grid') {
    this.viewMode = mode
    try {
      localStorage.setItem('search-view-mode', mode)
    } catch (e) {
      // localStorage may be unavailable (e.g., SSR); ignore errors
    }
  },

  /**
   * Load view mode from localStorage
   */
  loadViewMode(this: any) {
    try {
      const mode = localStorage.getItem('search-view-mode')
      if (mode === 'list' || mode === 'grid') {
        this.viewMode = mode as 'list' | 'grid'
      }
    } catch (e) {
      // localStorage may be unavailable (e.g., SSR); ignore errors
    }
  },

  /**
   * Set loading state
   * @param loading - Loading boolean
   */
  setLoading(this: any, loading: boolean) {
    this.isLoading = loading
    if (loading) {
      this.error = null
    }
  },

  /**
   * Set error message
   * @param error - Error message or null
   */
  setError(this: any, error: string | null) {
    this.error = error
    this.isLoading = false
  },

  /**
   * Set rate limit information
   * @param rateLimit - Rate limit object or null
   */
  setRateLimit(this: any, rateLimit: { remaining: number; limit: number; reset: number } | null) {
    this.rateLimit = rateLimit
  },

  /**
   * Add a language to filters
   * @param language - Language name
   */
  addLanguageFilter(this: any, language: string) {
    // ensure filters structure exists
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.languages = this.filters.languages || []

    if (!this.filters.languages.includes(language)) {
      this.filters.languages.push(language)
      this.currentPage = 1
      if (this.query && this.query.trim() !== '') {
        this.performSearch(this.query)
      }
    }
  },

  /**
   * Remove a language from filters
   * @param language - Language name
   */
  removeLanguageFilter(this: any, language: string) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.languages = this.filters.languages || []

    const idx = this.filters.languages.indexOf(language)
    if (idx !== -1) {
      this.filters.languages.splice(idx, 1)
      this.currentPage = 1
      if (this.query && this.query.trim() !== '') {
        this.performSearch(this.query)
      }
    }
  },

  /**
   * Toggle a language filter on/off
   * @param language - Language name
   */
  toggleLanguageFilter(this: any, language: string) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.languages = this.filters.languages || []

    const idx = this.filters.languages.indexOf(language)
    if (idx !== -1) {
      this.filters.languages.splice(idx, 1)
    } else {
      this.filters.languages.push(language)
    }

    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Add a license to filters
   * @param license - License name
   */
  addLicenseFilter(this: any, license: string) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.licenses = this.filters.licenses || []

    if (!this.filters.licenses.includes(license)) {
      this.filters.licenses.push(license)
      this.currentPage = 1
      if (this.query && this.query.trim() !== '') {
        this.performSearch(this.query)
      }
    }
  },

  /**
   * Remove a license from filters
   * @param license - License name
   */
  removeLicenseFilter(this: any, license: string) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.licenses = this.filters.licenses || []

    const idx = this.filters.licenses.indexOf(license)
    if (idx !== -1) {
      this.filters.licenses.splice(idx, 1)
      this.currentPage = 1
      if (this.query && this.query.trim() !== '') {
        this.performSearch(this.query)
      }
    }
  },

  /**
   * Toggle a license filter on/off
   * @param license - License name
   */
  toggleLicenseFilter(this: any, license: string) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.licenses = this.filters.licenses || []

    const idx = this.filters.licenses.indexOf(license)
    if (idx !== -1) {
      this.filters.licenses.splice(idx, 1)
    } else {
      this.filters.licenses.push(license)
    }

    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set star count range filter
   * @param min - Minimum stars
   * @param max - Maximum stars
   */
  setStarRange(this: any, min?: number, max?: number) {
    this.filters = this.filters || { languages: [], licenses: [] }
    // store provided star bounds
    this.filters.minStars = typeof min === 'number' ? min : undefined
    this.filters.maxStars = typeof max === 'number' ? max : undefined
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set fork count range filter
   * @param min - Minimum forks
   * @param max - Maximum forks
   */
  setForkRange(this: any, min?: number, max?: number) {
    this.filters = this.filters || { languages: [], licenses: [] }
    // store provided fork bounds
    this.filters.minForks = typeof min === 'number' ? min : undefined
    this.filters.maxForks = typeof max === 'number' ? max : undefined
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set date range filter
   * @param from - From date (ISO string)
   * @param to - To date (ISO string)
   */
  setDateRange(this: any, from?: string, to?: string) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.dateFrom = from
    this.filters.dateTo = to
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set has issues filter
   * @param hasIssues - Filter by repositories with issues
   */
  setHasIssues(this: any, hasIssues?: boolean) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.hasIssues = typeof hasIssues === 'boolean' ? hasIssues : undefined
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Set has topics filter
   * @param hasTopics - Filter by repositories with topics
   */
  setHasTopics(this: any, hasTopics?: boolean) {
    this.filters = this.filters || { languages: [], licenses: [] }
    this.filters.hasTopics = typeof hasTopics === 'boolean' ? hasTopics : undefined
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Update all filters at once
   * @param filters - Partial filter options
   */
  setFilters(this: any, filters: Partial<FilterOptions>) {
    this.filters = this.filters || { languages: [], licenses: [] }
    const merged = { ...this.filters, ...filters } as any
    merged.languages = merged.languages || []
    merged.licenses = merged.licenses || []
    this.filters = merged
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Reset all filters to initial state
   */
  resetFilters(this: any) {
    this.filters = { languages: [], licenses: [] } as Partial<FilterOptions>
    this.currentPage = 1
    if (this.query && this.query.trim() !== '') {
      this.performSearch(this.query)
    }
  },

  /**
   * Reset entire search state, including the cache.
   */
  resetSearch(this: any) {
    this.query = ''
    this.repositories = []
    this.totalCount = 0
    this.currentPage = 1
    this.totalPages = 0
    this.error = null
    this.isLoading = false
    this.rateLimit = null
    this.availableLanguages = []
    this.availableLicenses = []
    this.resetFilters()
    
    if (this.searchCache) {
      this.searchCache.clear()
    }
  },

  /**
   * Extract unique languages and licenses from current repositories
   */
  updateAvailableFilters(this: any) {
    const repos = Array.isArray(this.repositories) ? this.repositories : []
    const langSet = new Set<string>()
    const licenseSet = new Set<string>()

    for (const repo of repos) {
      if (!repo) continue

      // language
      if (repo.language && typeof repo.language === 'string' && repo.language.trim() !== '') {
        langSet.add(repo.language.trim())
      }

      // license - be defensive about shape since Repository type may not include it
      const lic = (repo as any).license
      if (lic && typeof lic === 'object') {
        const name = (lic.name || lic.spdx_id || lic.key) as string | undefined
        if (name && name.trim() !== '') {
          licenseSet.add(name.trim())
        }
      }
    }

    this.availableLanguages = Array.from(langSet).sort((a, b) => a.localeCompare(b))
    this.availableLicenses = Array.from(licenseSet).sort((a, b) => a.localeCompare(b))
  },

  /**
   * Perform search using GitHub API, with in-memory caching.
   * @param query - Search query string
   */
  async performSearch(this: any, query: string) {
    this.setLoading(true)
    this.setQuery(query)

    try {
      const filters: Partial<FilterOptions> = this.filters || {}
      let baseQuery = query.trim()
      if (filters.hasIssues) baseQuery += ' has:issues'
      if (filters.hasTopics) baseQuery += ' topic:*'

      const builtQuery = githubApi.buildSearchQuery({
        query: baseQuery,
        language: filters.languages,
        stars: { min: filters.minStars, max: filters.maxStars },
        forks: { min: filters.minForks, max: filters.maxForks },
        created: { from: filters.dateFrom, to: filters.dateTo },
        license: filters.licenses
      })

      const sort =
        this.sortBy === 'best-match' ? undefined : (this.sortBy as 'stars' | 'forks' | 'updated')
      const order = this.sortDirection || 'desc'

      const cacheKey = JSON.stringify({
        query: builtQuery,
        sort,
        order,
        perPage: this.perPage,
        page: this.currentPage
      })

      this.searchCache = this.searchCache || new Map()
      if (this.searchCache.has(cacheKey)) {
        const cachedResp = this.searchCache.get(cacheKey)!
        this.setRepositories(cachedResp.items || [])
        this.setTotalCount(cachedResp.total_count || 0)
        this.setError(null)
        return 
      }

      const resp = await githubApi.searchRepositories({
        query: builtQuery,
        sort,
        order,
        perPage: this.perPage,
        page: this.currentPage
      })

      // Store the fresh result in the cache
      this.searchCache.set(cacheKey, resp)

      this.setRepositories(resp.items || [])
      this.setTotalCount(resp.total_count || 0)
      this.setError(null)
    } catch (err: any) {
      const msg = err && err.message ? err.message : 'An unknown error occurred'
      this.setError(msg)
      this.setRepositories([])
      this.setTotalCount(0)
    } finally {
      this.setLoading(false)
    }
  },

  /**
   * Navigate to a specific page
   * @param page - Page number
   */
  async goToPage(this: any, page: number) {
    let p = Math.max(1, Math.floor(Number(page) || 1))
    if (this.totalPages && this.totalPages > 0) {
      p = Math.min(p, this.totalPages)
    }
    this.setCurrentPage(p)
    if (this.query && this.query.trim() !== '') {
      await this.performSearch(this.query)
    }
  },

  /**
   * Fetch GitHub API rate limit information
   */
  async fetchRateLimit(this: any) {
    try {
      const rl = await githubApi.getRateLimit()
      if (rl && typeof rl.remaining === 'number') {
        this.setRateLimit({ remaining: rl.remaining, limit: rl.limit, reset: rl.reset })
      } else {
        this.setRateLimit(null)
      }
    } catch (err) {
      console.error('Failed to fetch GitHub rate limit:', err)
      this.setRateLimit(null)
    }
  }
}
