export interface CacheStats {
  memory: { size: number; hits: number; misses: number }
  session: { size: number; enabled: boolean }
}

export interface AppState {
  rateLimitRemaining: number
  rateLimitLimit: number
  rateLimitResetTime: Date
  isOnline: boolean
  cacheStats: CacheStats
  currentTheme: 'light' | 'dark'
  sidebarCollapsed: boolean
  notifications: Array<{
    id: string
    type: 'info' | 'warning' | 'error' | 'success'
    message: string
    timestamp: Date
  }>
}

export const state: AppState = {
  rateLimitRemaining: 5000,
  rateLimitLimit: 5000,
  rateLimitResetTime: new Date(),
  isOnline: navigator.onLine,
  cacheStats: {
    memory: { size: 0, hits: 0, misses: 0 },
    session: { size: 0, enabled: true }
  },
  currentTheme: 'light',
  sidebarCollapsed: false,
  notifications: []
}
