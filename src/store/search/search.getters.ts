import type { SearchState } from './search.state'
import type { GitHubRepositoryData } from '../../repositories/interfaces/iGitHubRepository'

export const getters = {
  hasResults: (state: SearchState): boolean => state.results.length > 0,
  
  totalPages: (state: SearchState): number => Math.ceil(state.totalCount / 30),
  
  isFirstPage: (state: SearchState): boolean => state.currentPage === 1,
  
  isLastPage: (state: SearchState): boolean => {
    const totalPages = Math.ceil(state.totalCount / 30)
    return state.currentPage >= totalPages
  },
  
  hasActiveFilters: (state: SearchState): boolean => {
    return Object.keys(state.filters).some(key => 
      state.filters[key as keyof typeof state.filters]
    )
  },
  
  getRepositoryById: (state: SearchState) => (id: number): GitHubRepositoryData | undefined => {
    return state.results.find(repo => repo.id === id)
  },
  
  getFilteredResults: (state: SearchState) => (language?: string): GitHubRepositoryData[] => {
    if (!language) return state.results
    return state.results.filter(repo => 
      repo.language?.toLowerCase() === language.toLowerCase()
    )
  },
  
  searchSummary: (state: SearchState): string => {
    if (!state.hasSearched) return 'Search GitHub repositories'
    if (state.isLoading) return 'Searching...'
    if (state.error) return 'Search failed'
    if (state.totalCount === 0) return 'No repositories found'
    
    const start = (state.currentPage - 1) * 30 + 1
    const end = Math.min(state.currentPage * 30, state.totalCount)
    return `Showing ${start}-${end} of ${state.totalCount.toLocaleString()} repositories`
  }
}