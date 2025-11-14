import type { ComparisonState } from './comparison.state'
import type { Repository } from '../../types/auth'

export const getters = {
  /**
   * Get count of selected repositories
   */
  selectedCount: (state: ComparisonState): number => {
    return state.selectedRepositories.length
  },

  /**
   * Check if repository is selected
   */
  isSelected: (state: ComparisonState) => {
    return (repoId: number): boolean => {
      return state.selectedRepositories.some(repo => repo.id === repoId)
    }
  },

  /**
   * Check if at maximum limit
   */
  isAtLimit: (state: ComparisonState): boolean => {
    return state.selectedRepositories.length >= state.maxRepositories
  },

  /**
   * Check if can add more repositories
   */
  canAddMore: (state: ComparisonState): boolean => {
    return state.selectedRepositories.length < state.maxRepositories
  },

  /**
   * Check if has any selections
   */
  hasSelections: (state: ComparisonState): boolean => {
    return state.selectedRepositories.length > 0
  },

  /**
   * Check if has minimum selections for comparison (at least 2)
   */
  canCompare: (state: ComparisonState): boolean => {
    return state.selectedRepositories.length >= 2
  },

  /**
   * Get repository IDs as comma-separated string (for URL)
   */
  selectedIds: (state: ComparisonState): string => {
    return state.selectedRepositories.map(repo => repo.id).join(',')
  },

  /**
   * Get comparison metrics
   */
  comparisonMetrics: (state: ComparisonState) => {
    if (state.selectedRepositories.length === 0) return null

    const metrics = {
      totalStars: 0,
      totalForks: 0,
      totalIssues: 0,
      averageStars: 0,
      averageForks: 0,
      averageIssues: 0,
      mostStarred: null as Repository | null,
      mostForked: null as Repository | null,
      mostRecent: null as Repository | null,
      languages: new Set<string>(),
      licenses: new Set<string>()
    }

    state.selectedRepositories.forEach(repo => {
      metrics.totalStars += repo.stargazers_count
      metrics.totalForks += repo.forks_count
      metrics.totalIssues += repo.open_issues_count

      if (repo.language) metrics.languages.add(repo.language)
      if (repo.license) metrics.licenses.add(repo.license.name)

      // Most starred
      if (!metrics.mostStarred || repo.stargazers_count > metrics.mostStarred.stargazers_count) {
        metrics.mostStarred = repo
      }

      // Most forked
      if (!metrics.mostForked || repo.forks_count > metrics.mostForked.forks_count) {
        metrics.mostForked = repo
      }

      // Most recent
      if (
        !metrics.mostRecent ||
        new Date(repo.updated_at) > new Date(metrics.mostRecent.updated_at)
      ) {
        metrics.mostRecent = repo
      }
    })

    const count = state.selectedRepositories.length
    metrics.averageStars = Math.round(metrics.totalStars / count)
    metrics.averageForks = Math.round(metrics.totalForks / count)
    metrics.averageIssues = Math.round(metrics.totalIssues / count)

    return metrics
  },

  /**
   * Get insights/recommendations
   */
  insights: (state: ComparisonState) => {
    const insights: string[] = []

    if (state.selectedRepositories.length < 2) {
      insights.push('Select at least 2 repositories to compare')
      return insights
    }

    const repos = state.selectedRepositories

    // Check for same language
    const languages = repos.map(r => r.language).filter(Boolean)
    const uniqueLangs = new Set(languages)
    if (uniqueLangs.size === 1 && languages.length > 0) {
      insights.push(`All repositories use ${languages[0]}`)
    }

    // Check for same license
    const licenses = repos.map(r => r.license?.name).filter(Boolean)
    const uniqueLicenses = new Set(licenses)
    if (uniqueLicenses.size === 1 && licenses.length > 0) {
      insights.push(`All repositories use ${licenses[0]}`)
    }

    // Star count variance
    const stars = repos.map(r => r.stargazers_count)
    const maxStars = Math.max(...stars)
    const minStars = Math.min(...stars)
    const variance = maxStars / (minStars || 1)

    if (variance > 10) {
      insights.push('High popularity variance - repositories have very different star counts')
    } else if (variance < 2) {
      insights.push('Similar popularity levels across all repositories')
    }

    // Activity check
    const now = new Date()
    const recentlyUpdated = repos.filter(r => {
      const daysSinceUpdate =
        (now.getTime() - new Date(r.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceUpdate < 30
    })

    if (recentlyUpdated.length === repos.length) {
      insights.push('All repositories are actively maintained (updated in last 30 days)')
    } else if (recentlyUpdated.length === 0) {
      insights.push('⚠️ None of these repositories were updated recently')
    }

    return insights
  },

  /**
   * Export data as JSON
   */
  exportData: (state: ComparisonState) => {
    return {
      timestamp: new Date().toISOString(),
      repositories: state.selectedRepositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        updated_at: repo.updated_at,
        license: repo.license?.name,
        topics: repo.topics,
        html_url: repo.html_url
      }))
    }
  }
}
