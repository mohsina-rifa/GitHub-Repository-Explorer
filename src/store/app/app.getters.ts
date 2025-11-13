import type { AppState } from './app.state'

export const getters = {
  rateLimitPercentage: (state: AppState): number => {
    if (state.rateLimitLimit === 0) return 0
    return (state.rateLimitRemaining / state.rateLimitLimit) * 100
  },

  isRateLimitLow: (state: AppState): boolean => {
    const percentage = (state.rateLimitRemaining / state.rateLimitLimit) * 100
    return percentage < 20
  },

  isRateLimitCritical: (state: AppState): boolean => {
    const percentage = (state.rateLimitRemaining / state.rateLimitLimit) * 100
    return percentage < 5
  },

  timeUntilReset: (state: AppState): string => {
    const now = new Date()
    const resetTime = state.rateLimitResetTime
    const diff = resetTime.getTime() - now.getTime()

    if (diff <= 0) return 'Available now'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    return `${minutes}m ${seconds}s`
  },

  activeNotifications: (state: AppState) => {
    return state.notifications.filter(notification => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return notification.timestamp > fiveMinutesAgo
    })
  },

  getNotificationsByType: (state: AppState) => (type: string) => {
    return state.notifications.filter(notification => notification.type === type)
  },

  hasUnreadNotifications: (state: AppState): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return state.notifications.some(notification => notification.timestamp > fiveMinutesAgo)
  },

  cacheEfficiency: (state: AppState): number => {
    const { hits, misses } = state.cacheStats.memory
    const total = hits + misses
    return total > 0 ? (hits / total) * 100 : 0
  },

  appStatus: (state: AppState): string => {
    if (!state.isOnline) return 'Offline'
    if (state.rateLimitRemaining === 0) return 'Rate Limited'
    if (state.rateLimitRemaining < 100) return 'Low Rate Limit'
    return 'Online'
  }
}
