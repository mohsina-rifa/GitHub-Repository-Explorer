import type { Repository } from '../types/auth'
import { Sanitizer } from '../utils/sanitizer'

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
  private static sanitizeArray(arr?: string[]): string[] {
    if (!arr || !Array.isArray(arr)) return []
    return arr
      .map(v => (v == null ? '' : String(v)))
      .map(v => Sanitizer.sanitizeRepositoryName(v).trim())
      .filter(Boolean)
  }

  /**
   * Filter repositories based on filter options
   */
  static filterRepositories(repositories: Repository[], filters: FilterOptions): Repository[] {
    const allowedLanguages = this.sanitizeArray(filters.languages)
    const allowedLicenses = this.sanitizeArray(filters.licenses)

    const dateFrom =
      filters.dateFrom instanceof Date
        ? filters.dateFrom
        : filters.dateFrom
          ? new Date(String(filters.dateFrom))
          : undefined
    const dateTo =
      filters.dateTo instanceof Date
        ? filters.dateTo
        : filters.dateTo
          ? new Date(String(filters.dateTo))
          : undefined

    return repositories.filter(repo => {
      // Language filter
      if (allowedLanguages.length > 0) {
        const repoLang = repo.language
          ? Sanitizer.sanitizeRepositoryName(String(repo.language))
          : ''
        if (!repoLang || !allowedLanguages.includes(repoLang)) {
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
      if (dateFrom || dateTo) {
        const updatedDate = new Date(repo.updated_at)
        if (dateFrom && updatedDate < dateFrom) {
          return false
        }
        if (dateTo && updatedDate > dateTo) {
          return false
        }
      }

      // License filter
      if (allowedLicenses.length > 0) {
        const licName =
          repo.license && repo.license.name
            ? Sanitizer.sanitizeRepositoryName(String(repo.license.name))
            : ''
        if (!licName || !allowedLicenses.includes(licName)) {
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
        const hasTopics = Array.isArray(repo.topics) && repo.topics.length > 0
        if (filters.hasTopics && !hasTopics) {
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
          // sanitize names for deterministic sorting
          comparison = Sanitizer.sanitizeRepositoryName(a.name || '').localeCompare(
            Sanitizer.sanitizeRepositoryName(b.name || '')
          )
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
        const lang = Sanitizer.sanitizeRepositoryName(String(repo.language))
        if (lang) languages.add(lang)
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
      if (repo.license && repo.license.name) {
        const name = Sanitizer.sanitizeRepositoryName(String(repo.license.name))
        if (name) licenses.add(name)
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
