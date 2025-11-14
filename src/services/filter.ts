import type { Repository } from '../types/auth'

export interface FilterOptions {
  languages?: string[]
  minStars?: number
  maxStars?: number
  minForks?: number
  maxForks?: number
  dateFrom?: Date
  dateTo?: Date
  licenses?: string[]
  hasIssues?: boolean
  hasTopics?: boolean
}

export interface SortOption {
  field: 'stars' | 'forks' | 'updated' | 'name'
  direction: 'asc' | 'desc'
}

export class FilterService {
  /**
   * Filter repositories based on filter options
   */
  static filterRepositories(repositories: Repository[], filters: FilterOptions): Repository[] {
    return repositories.filter(repo => {
      // Language filter
      if (filters.languages && filters.languages.length > 0) {
        if (!repo.language || !filters.languages.includes(repo.language)) {
          return false
        }
      }

      // Star count filter
      if (filters.minStars !== undefined && repo.stargazers_count < filters.minStars) {
        return false
      }
      if (filters.maxStars !== undefined && repo.stargazers_count > filters.maxStars) {
        return false
      }

      // Fork count filter
      if (filters.minForks !== undefined && repo.forks_count < filters.minForks) {
        return false
      }
      if (filters.maxForks !== undefined && repo.forks_count > filters.maxForks) {
        return false
      }

      // Date filter
      if (filters.dateFrom || filters.dateTo) {
        const updatedDate = new Date(repo.updated_at)
        if (filters.dateFrom && updatedDate < filters.dateFrom) {
          return false
        }
        if (filters.dateTo && updatedDate > filters.dateTo) {
          return false
        }
      }

      // License filter
      if (filters.licenses && filters.licenses.length > 0) {
        if (!repo.license || !filters.licenses.includes(repo.license.name)) {
          return false
        }
      }

      // Has issues filter
      if (filters.hasIssues !== undefined) {
        if (filters.hasIssues && repo.open_issues_count === 0) {
          return false
        }
      }

      // Has topics filter
      if (filters.hasTopics !== undefined) {
        if (filters.hasTopics && (!repo.topics || repo.topics.length === 0)) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Sort repositories based on sort option
   */
  static sortRepositories(repositories: Repository[], sortOption: SortOption): Repository[] {
    const sorted = [...repositories]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortOption.field) {
        case 'stars':
          comparison = a.stargazers_count - b.stargazers_count
          break
        case 'forks':
          comparison = a.forks_count - b.forks_count
          break
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }

      return sortOption.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  /**
   * Get unique languages from repositories
   */
  static getUniqueLanguages(repositories: Repository[]): string[] {
    const languages = new Set<string>()
    repositories.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language)
      }
    })
    return Array.from(languages).sort()
  }

  /**
   * Get unique licenses from repositories
   */
  static getUniqueLicenses(repositories: Repository[]): string[] {
    const licenses = new Set<string>()
    repositories.forEach(repo => {
      if (repo.license) {
        licenses.add(repo.license.name)
      }
    })
    return Array.from(licenses).sort()
  }

  /**
   * Get star count ranges
   */
  static getStarRanges(): Array<{ label: string; min: number; max?: number }> {
    return [
      { label: '< 100', min: 0, max: 100 },
      { label: '100 - 1K', min: 100, max: 1000 },
      { label: '1K - 10K', min: 1000, max: 10000 },
      { label: '10K - 100K', min: 10000, max: 100000 },
      { label: '> 100K', min: 100000 }
    ]
  }
}
