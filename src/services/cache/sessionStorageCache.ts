import type { ICacheService, CacheEntry } from '../interfaces/iCacheService'
import { Sanitizer } from '../../utils/sanitizer'

export class SessionStorageCache implements ICacheService {
  private keyPrefix: string

  constructor(keyPrefix: string = 'github_cache_') {
    this.keyPrefix = keyPrefix
  }

  public get<T>(key: string): T | null {
    try {
      const storageKey = this.buildStorageKey(key)
      const item = sessionStorage.getItem(storageKey)

      if (!item) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(item)

      if (this.isExpired(entry)) {
        this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('SessionStorage cache get error:', error)
      return null
    }
  }

  public set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        key
      }

      const storageKey = this.buildStorageKey(key)
      const serialized = JSON.stringify(entry)

      if (this.canStore(serialized)) {
        sessionStorage.setItem(storageKey, serialized)
      }
    } catch (error) {
      console.warn('SessionStorage cache set error:', error)
      this.cleanup()
    }
  }

  public has(key: string): boolean {
    const storageKey = this.buildStorageKey(key)
    const item = sessionStorage.getItem(storageKey)

    if (!item) {
      return false
    }

    try {
      const entry: CacheEntry<unknown> = JSON.parse(item)

      if (this.isExpired(entry)) {
        this.delete(key)
        return false
      }

      return true
    } catch {
      this.delete(key)
      return false
    }
  }

  public delete(key: string): boolean {
    try {
      const storageKey = this.buildStorageKey(key)
      sessionStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.warn('SessionStorage cache delete error:', error)
      return false
    }
  }

  public clear(): void {
    try {
      const keysToRemove: string[] = []

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('SessionStorage cache clear error:', error)
    }
  }

  public size(): number {
    let count = 0

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          count++
        }
      }
    } catch (error) {
      console.warn('SessionStorage cache size error:', error)
    }

    return count
  }

  public cleanup(): void {
    try {
      const expiredKeys: string[] = []

      for (let i = 0; i < sessionStorage.length; i++) {
        const storageKey = sessionStorage.key(i)

        if (storageKey && storageKey.startsWith(this.keyPrefix)) {
          const item = sessionStorage.getItem(storageKey)

          if (item) {
            try {
              const entry: CacheEntry<unknown> = JSON.parse(item)

              if (this.isExpired(entry)) {
                expiredKeys.push(storageKey)
              }
            } catch {
              expiredKeys.push(storageKey)
            }
          }
        }
      }

      expiredKeys.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('SessionStorage cache cleanup error:', error)
    }
  }

  private buildStorageKey(key: string): string {
    return `${this.keyPrefix}${Sanitizer.sanitizeForDisplay(key)}`
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private canStore(data: string): boolean {
    try {
      return data.length < 1024 * 1024
    } catch {
      return false
    }
  }
}
