import type { AppState, CacheStats } from './app.state'
import { EventBus } from '../../utils/observer/eventBus'

// Event buses for live updates
const rateLimitEventBus = EventBus.getInstance<{
  remaining: number
  limit: number
  resetTime: Date
}>('rate-limit')

const connectionEventBus = EventBus.getInstance<boolean>('connection-status')
const cacheEventBus = EventBus.getInstance<CacheStats>('cache-stats')
const notificationEventBus = EventBus.getInstance<AppState['notifications'][0]>('new-notification')

export const actions = {
  updateRateLimit(this: AppState, remaining: number, limit: number, resetTime: Date) {
    this.rateLimitRemaining = remaining
    this.rateLimitLimit = limit
    this.rateLimitResetTime = resetTime

    // Notify observers of rate limit changes
    rateLimitEventBus.notify({
      remaining,
      limit,
      resetTime
    })

    // Add notification if rate limit is low
    if (remaining < 100 && remaining > 0) {
      actions.addNotification.call(this, {
        type: 'warning',
        message: `Rate limit low: ${remaining} requests remaining`
      })
    } else if (remaining === 0) {
      actions.addNotification.call(this, {
        type: 'error',
        message: 'Rate limit exceeded. Please wait before making more requests.'
      })
    }
  },

  setOnlineStatus(this: AppState, online: boolean) {
    const wasOffline = !this.isOnline
    this.isOnline = online

    // Notify observers of connection changes
    connectionEventBus.notify(online)

    // Add notification on status change
    if (online && wasOffline) {
      actions.addNotification.call(this, {
        type: 'success',
        message: 'Connection restored'
      })
    } else if (!online) {
      actions.addNotification.call(this, {
        type: 'warning',
        message: 'Connection lost. Working offline.'
      })
    }
  },

  updateCacheStats(this: AppState, stats: CacheStats) {
    this.cacheStats = { ...stats }

    // Notify observers of cache changes
    cacheEventBus.notify(stats)
  },

  setTheme(this: AppState, theme: 'light' | 'dark') {
    this.currentTheme = theme
    // Persist to localStorage
    localStorage.setItem('github_explorer_theme', theme)

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
  },

  toggleSidebar(this: AppState) {
    this.sidebarCollapsed = !this.sidebarCollapsed
    // Persist to localStorage
    localStorage.setItem('github_explorer_sidebar', this.sidebarCollapsed.toString())
  },

  addNotification(
    this: AppState,
    notification: {
      type: 'info' | 'warning' | 'error' | 'success'
      message: string
    }
  ) {
    const newNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date()
    }

    this.notifications.unshift(newNotification)

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Notify observers of new notification
    notificationEventBus.notify(newNotification)
  },

  removeNotification(this: AppState, id: string) {
    this.notifications = this.notifications.filter(notification => notification.id !== id)
  },

  clearNotifications(this: AppState) {
    this.notifications = []
  },

  initializeFromStorage(this: AppState) {
    // Initialize theme
    const savedTheme = localStorage.getItem('github_explorer_theme') as 'light' | 'dark'
    if (savedTheme) {
      actions.setTheme.call(this, savedTheme)
    }

    // Initialize sidebar state
    const savedSidebar = localStorage.getItem('github_explorer_sidebar')
    if (savedSidebar) {
      this.sidebarCollapsed = savedSidebar === 'true'
    }
  },

  initializeOnlineListener(this: AppState) {
    // Set up online/offline event listeners
    window.addEventListener('online', () => actions.setOnlineStatus.call(this, true))
    window.addEventListener('offline', () => actions.setOnlineStatus.call(this, false))
  },

  checkRateLimit(this: AppState) {
    // This would be called by the service layer after API requests
    const percentage = (this.rateLimitRemaining / this.rateLimitLimit) * 100

    if (percentage <= 5) {
      actions.addNotification.call(this, {
        type: 'error',
        message: 'Rate limit critical! Consider caching or waiting.'
      })
    } else if (percentage <= 20) {
      actions.addNotification.call(this, {
        type: 'warning',
        message: 'Rate limit getting low. Use cache when possible.'
      })
    }
  }
}
