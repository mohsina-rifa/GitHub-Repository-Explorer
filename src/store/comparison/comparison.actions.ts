import type { Repository } from '../../types/auth'
import { githubApi } from '../../api/github.api'

export const actions = {
  /**
   * Add a repository to comparison
   * @param repository - Repository object to add
   * @returns boolean - true if added successfully, false otherwise
   */
  addRepository(this: any, repository: Repository): boolean {
    // Check if repository already exists
    if (this.selectedRepositories.some((r: Repository) => r.id === repository.id)) {
      console.warn(`Repository with id ${repository.id} already selected`)
      return false
    }

    // Check if at limit
    if (this.selectedRepositories.length >= this.maxRepositories) {
      this.error = `Cannot add more than ${this.maxRepositories} repositories`
      return false
    }

    // Add repository and update the cache
    this.selectedRepositories.push(repository)
    if (this.repositoryCache && !this.repositoryCache.has(repository.id)) {
      this.repositoryCache.set(repository.id, repository)
    }
    this.error = null
    return true
  },

  /**
   * Remove a repository from comparison
   * @param repoId - Repository ID to remove
   * @returns boolean - true if removed, false if not found
   */
  removeRepository(this: any, repoId: number): boolean {
    const index = this.selectedRepositories.findIndex((r: Repository) => r.id === repoId)
    if (index === -1) {
      console.warn(`Repository with id ${repoId} not found in selection`)
      return false
    }

    this.selectedRepositories.splice(index, 1)
    this.error = null
    return true
  },

  /**
   * Toggle repository selection (add if not selected, remove if selected)
   * @param repository - Repository object to toggle
   * @returns boolean - true if added, false if removed
   */
  toggleRepository(this: any, repository: Repository): boolean {
    const index = this.selectedRepositories.findIndex((r: Repository) => r.id === repository.id)

    // If found -> remove and return false (indicates removed)
    if (index !== -1) {
      this.selectedRepositories.splice(index, 1)
      this.error = null
      return false
    }

    // If not found -> try to add and return the add result (true if added)
    return this.addRepository(repository)
  },

  /**
   * Clear all selected repositories
   */
  clearAll(this: any) {
    this.selectedRepositories = []
    this.error = null
  },

  /**
   * Set error message
   * @param error - Error message or null
   */
  setError(this: any, error: string | null) {
    this.error = error
  },

  /**
   * Set loading state
   * @param loading - Loading boolean
   */
  setLoading(this: any, loading: boolean) {
    this.isLoading = loading
  },

  /**
   * Load repositories from IDs (for URL sharing), using an in-memory cache.
   * @param ids - Array of repository IDs
   */
  async loadFromIds(this: any, ids: number[]) {
    this.setLoading(true)
    this.setError(null)

    const uniqueIds = Array.from(new Set(ids))

    if (uniqueIds.length === 0) {
      this.setLoading(false)
      return
    }

    if (uniqueIds.length > this.maxRepositories) {
      this.setError(`Cannot load more than ${this.maxRepositories} repositories`)
      this.setLoading(false)
      return
    }

    try {
      // --- Caching Logic Start ---
      const cachedRepos: Repository[] = []
      const idsToFetch: number[] = []

      // Ensure cache exists on the store instance
      this.repositoryCache = this.repositoryCache || new Map<number, Repository>()

      for (const id of uniqueIds) {
        if (this.repositoryCache.has(id)) {
          cachedRepos.push(this.repositoryCache.get(id)!)
        } else {
          idsToFetch.push(id)
        }
      }
      // --- Caching Logic End ---

      let newlyFetchedRepos: Repository[] = []
      if (idsToFetch.length > 0) {
        // Fetch only the repositories that are not in the cache
        const results = await Promise.allSettled(
          idsToFetch.map(id => githubApi.getRepositoryById(id))
        )

        newlyFetchedRepos = results
          .filter((r): r is PromiseFulfilledResult<Repository> => r.status === 'fulfilled')
          .map(r => r.value)

        // Populate the cache with the newly fetched repositories
        for (const repo of newlyFetchedRepos) {
          this.repositoryCache.set(repo.id, repo)
        }
      }

      const allRepos = [...cachedRepos, ...newlyFetchedRepos]
      if (allRepos.length === 0) {
        this.setError('Failed to load repositories from provided IDs')
        return
      }

      // Combine and order the final list based on the original `uniqueIds` array
      const repoMap = new Map<number, Repository>()
      allRepos.forEach(r => repoMap.set(r.id, r))
      this.selectedRepositories = uniqueIds
        .map(id => repoMap.get(id))
        .filter((r): r is Repository => !!r)

      this.setError(null)
    } catch (err: any) {
      this.setError(err?.message || 'An error occurred while loading repositories')
    } finally {
      this.setLoading(false)
    }
  },

  /**
   * Export comparison data as JSON string
   * @returns JSON string
   */
  exportAsJson(this: any): string {
    const data = {
      timestamp: new Date().toISOString(),
      repositories: (this.selectedRepositories || []).map((repo: Repository) => ({
        id: repo.id,
        name: (repo as any).name ?? null,
        full_name: (repo as any).full_name ?? null,
        html_url: (repo as any).html_url ?? null,
        description: (repo as any).description ?? null,
        owner: (repo as any).owner?.login ?? null,
        stargazers_count: (repo as any).stargazers_count ?? 0,
        forks_count: (repo as any).forks_count ?? 0,
        open_issues_count: (repo as any).open_issues_count ?? 0,
        language: (repo as any).language ?? null,
        license: (repo as any).license?.name ?? null,
        topics: Array.isArray((repo as any).topics) ? (repo as any).topics : [],
        created_at: (repo as any).created_at ?? null,
        updated_at: (repo as any).updated_at ?? null
      }))
    }

    return JSON.stringify(data, null, 2)
  },

  /**
   * Download comparison as JSON file
   */
  downloadAsJson(this: any) {
    // Guard for non-browser environments
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      this.setError('Download is only available in a browser environment')
      return
    }

    const json = this.exportAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    // sanitize filename
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    a.download = `comparison-${ts}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()

    // cleanup
    URL.revokeObjectURL(url)
  },

  /**
   * Export as CSV string
   * @returns CSV string
   */
  exportAsCsv(this: any): string {
    const repos: Repository[] = this.selectedRepositories || []

    const headers = [
      'id',
      'name',
      'full_name',
      'html_url',
      'description',
      'owner',
      'stargazers_count',
      'forks_count',
      'open_issues_count',
      'language',
      'license',
      'topics',
      'created_at',
      'updated_at'
    ]

    const escapeField = (value: any): string => {
      if (value === null || value === undefined) return ''
      const s = String(value)
      // Escape double quotes by doubling them
      const escaped = s.replace(/"/g, '""')
      // Wrap in quotes if it contains comma, newline or double quotes
      if (/[,"\n\r]/.test(s)) {
        return `"${escaped}"`
      }
      return escaped
    }

    const rows = repos.map((repo: Repository) => {
      const topics = Array.isArray((repo as any).topics) ? (repo as any).topics.join('|') : ''

      const license = (repo as any).license?.name ?? ''
      const owner = (repo as any).owner?.login ?? ''

      const fields = [
        repo.id,
        (repo as any).name ?? '',
        (repo as any).full_name ?? '',
        (repo as any).html_url ?? '',
        (repo as any).description ?? '',
        owner,
        (repo as any).stargazers_count ?? 0,
        (repo as any).forks_count ?? 0,
        (repo as any).open_issues_count ?? 0,
        (repo as any).language ?? '',
        license,
        topics,
        (repo as any).created_at ?? '',
        (repo as any).updated_at ?? ''
      ]

      return fields.map(escapeField).join(',')
    })

    // If no rows, still return header line
    return headers.join(',') + (rows.length ? '\n' + rows.join('\n') : '\n')
  },

  /**
   * Download comparison as CSV file
   */
  downloadAsCsv(this: any) {
    // Guard for non-browser environments
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      this.setError('Download is only available in a browser environment')
      return
    }

    const csv = this.exportAsCsv()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    a.download = `comparison-${ts}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()

    // cleanup
    URL.revokeObjectURL(url)
  },

  /**
   * Copy comparison URL to clipboard for sharing
   * @returns Promise<boolean> - true if successful
   */
  async copyComparisonUrl(this: any): Promise<boolean> {
    // Guard for non-browser environments
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      typeof document === 'undefined'
    ) {
      this.setError('Clipboard is only available in a browser environment')
      return false
    }

    const ids = (this.selectedRepositories || []).map((r: Repository) => r.id).join(',')
    if (!ids) {
      this.setError('No repositories selected to copy')
      return false
    }

    const url = `${window.location.origin}/comparison?repos=${encodeURIComponent(ids)}`

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea')
        ta.value = url
        ta.setAttribute('readonly', '')
        ta.style.position = 'absolute'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!ok) throw new Error('Fallback clipboard copy failed')
      }

      this.setError(null)
      return true
    } catch (err: any) {
      this.setError(err?.message || 'Failed to copy URL to clipboard')
      return false
    }
  }
}