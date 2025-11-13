import type { ComparisonState } from './comparison.state'

export const getters = {
  hasRepositories: (state: ComparisonState): boolean => state.selectedRepositories.length > 0,

  canAddMore: (state: ComparisonState): boolean =>
    state.selectedRepositories.length < state.maxRepositories,

  repositoryCount: (state: ComparisonState): number => state.selectedRepositories.length,

  canCompare: (state: ComparisonState): boolean => state.selectedRepositories.length >= 2,

  isRepositorySelected:
    (state: ComparisonState) =>
    (repoId: number): boolean =>
      state.selectedRepositories.some(repo => repo.id === repoId),

  getRepositoryById: (state: ComparisonState) => (repoId: number) =>
    state.selectedRepositories.find(repo => repo.id === repoId),

  comparisonMetrics: (state: ComparisonState) => {
    if (state.selectedRepositories.length === 0) return null

    const metrics = {
      totalStars: state.selectedRepositories.reduce(
        (sum, repo) => sum + (repo.stargazers_count || 0),
        0
      ),
      totalForks: state.selectedRepositories.reduce(
        (sum, repo) => sum + (repo.forks_count || 0),
        0
      ),
      avgStars: 0,
      avgForks: 0,
      languages: new Set<string>(),
      mostStarred: null as any,
      mostForked: null as any,
      newest: null as any,
      oldest: null as any
    }

    metrics.avgStars = Math.round(metrics.totalStars / state.selectedRepositories.length)
    metrics.avgForks = Math.round(metrics.totalForks / state.selectedRepositories.length)

    state.selectedRepositories.forEach(repo => {
      if (repo.language) metrics.languages.add(repo.language)
    })

    metrics.mostStarred = state.selectedRepositories.reduce((prev, current) =>
      (current.stargazers_count || 0) > (prev.stargazers_count || 0) ? current : prev
    )

    metrics.mostForked = state.selectedRepositories.reduce((prev, current) =>
      (current.forks_count || 0) > (prev.forks_count || 0) ? current : prev
    )

    metrics.newest = state.selectedRepositories.reduce((prev, current) =>
      new Date(current.created_at || 0) > new Date(prev.created_at || 0) ? current : prev
    )

    metrics.oldest = state.selectedRepositories.reduce((prev, current) =>
      new Date(current.created_at || 0) < new Date(prev.created_at || 0) ? current : prev
    )

    return metrics
  }
}
