import type { ComparisonState } from './comparison.state'
import type { GitHubRepositoryData } from '../../repositories/interfaces/iGitHubRepository'
import { EventBus } from '../../utils/observer/eventBus'

const comparisonEventBus = EventBus.getInstance<{
  action: 'added' | 'removed' | 'cleared'
  repository?: GitHubRepositoryData
  repositories: GitHubRepositoryData[]
}>('repository-comparison')

export const actions = {
  addRepository(this: ComparisonState, repository: GitHubRepositoryData) {
    if (this.selectedRepositories.length >= this.maxRepositories) {
      throw new Error(`Maximum ${this.maxRepositories} repositories allowed for comparison`)
    }

    const exists = this.selectedRepositories.some(repo => repo.id === repository.id)
    if (exists) {
      throw new Error('Repository already added to comparison')
    }

    this.selectedRepositories.push(repository)

    // Notify observers
    comparisonEventBus.notify({
      action: 'added',
      repository,
      repositories: [...this.selectedRepositories]
    })

    // Save to localStorage
    actions.saveToStorage.call(this)
  },

  removeRepository(this: ComparisonState, repositoryId: number) {
    const index = this.selectedRepositories.findIndex(repo => repo.id === repositoryId)
    if (index === -1) {
      throw new Error('Repository not found in comparison')
    }

    const repository = this.selectedRepositories[index]
    this.selectedRepositories.splice(index, 1)

    // Notify observers
    comparisonEventBus.notify({
      action: 'removed',
      repository,
      repositories: [...this.selectedRepositories]
    })

    // Save to localStorage
    actions.saveToStorage.call(this)
  },

  clearAll(this: ComparisonState) {
    this.selectedRepositories = []
    this.comparisonId = null

    // Notify observers
    comparisonEventBus.notify({
      action: 'cleared',
      repositories: []
    })

    // Clear localStorage
    localStorage.removeItem('github_explorer_comparison')
  },

  reorderRepositories(this: ComparisonState, newOrder: GitHubRepositoryData[]) {
    if (newOrder.length !== this.selectedRepositories.length) {
      throw new Error('Invalid reorder operation')
    }

    this.selectedRepositories = [...newOrder]
    actions.saveToStorage.call(this)
  },

  generateComparisonId(this: ComparisonState): string {
    const ids = this.selectedRepositories
      .map(repo => repo.id)
      .sort()
      .join('-')
    this.comparisonId = `comparison-${Date.now()}-${ids}`
    actions.saveToStorage.call(this)
    return this.comparisonId
  },

  saveToStorage(this: ComparisonState) {
    const data = {
      repositories: this.selectedRepositories,
      comparisonId: this.comparisonId,
      timestamp: Date.now()
    }
    localStorage.setItem('github_explorer_comparison', JSON.stringify(data))
  },

  loadFromStorage(this: ComparisonState) {
    try {
      const saved = localStorage.getItem('github_explorer_comparison')
      if (saved) {
        const data = JSON.parse(saved)

        // Check if data is not too old (24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          this.selectedRepositories = data.repositories || []
          this.comparisonId = data.comparisonId
        } else {
          // Clear old data
          localStorage.removeItem('github_explorer_comparison')
        }
      }
    } catch (error) {
      console.error('Failed to load comparison from storage:', error)
      localStorage.removeItem('github_explorer_comparison')
    }
  },

  exportComparison(this: ComparisonState, format: 'json' | 'csv'): void {
    if (this.selectedRepositories.length === 0) {
      throw new Error('No repositories to export')
    }

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(
        {
          comparison: {
            id: this.comparisonId,
            timestamp: new Date().toISOString(),
            repositories: this.selectedRepositories.map(repo => ({
              name: repo.name,
              owner: repo.owner?.login,
              description: repo.description,
              language: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              watchers: repo.watchers_count,
              issues: repo.open_issues_count,
              created: repo.created_at,
              updated: repo.updated_at,
              url: repo.html_url
            }))
          }
        },
        null,
        2
      )
      filename = `repository-comparison-${Date.now()}.json`
      mimeType = 'application/json'
    } else {
      // CSV format
      const headers = [
        'Name',
        'Owner',
        'Description',
        'Language',
        'Stars',
        'Forks',
        'Watchers',
        'Issues',
        'Created',
        'URL'
      ]
      const rows = this.selectedRepositories.map(repo => [
        repo.name,
        repo.owner?.login || '',
        (repo.description || '').replace(/"/g, '""'),
        repo.language || '',
        repo.stargazers_count || 0,
        repo.forks_count || 0,
        repo.watchers_count || 0,
        repo.open_issues_count || 0,
        repo.created_at || '',
        repo.html_url || ''
      ])

      content = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      filename = `repository-comparison-${Date.now()}.csv`
      mimeType = 'text/csv'
    }

    // Download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
