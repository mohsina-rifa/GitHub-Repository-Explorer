import type { ICacheService, CacheOptions } from '../interfaces/iCacheService'
import { CacheService } from '../cacheService'
import { SessionStorageCache } from './sessionStorageCache'

export class MultiTierCache implements ICacheService {
  private memoryCache: ICacheService
  private sessionCache: ICacheService
  private enableSessionStorage: boolean

  constructor(options: CacheOptions & { enableSessionStorage?: boolean } = {}) {
    this.memoryCache = new CacheService(options)
    this.sessionCache = new SessionStorageCache()
    this.enableSessionStorage = options.enableSessionStorage !== false
  }

  public get<T>(key: string): T | null {
    const memoryResult = this.memoryCache.get<T>(key)
    if (memoryResult !== null) {
      return memoryResult
    }

    if (this.enableSessionStorage) {
      const sessionResult = this.sessionCache.get<T>(key)
      if (sessionResult !== null) {
        this.memoryCache.set(key, sessionResult)
        return sessionResult
      }
    }

    return null
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    this.memoryCache.set(key, value, ttl)

    if (this.enableSessionStorage) {
      this.sessionCache.set(key, value, ttl)
    }
  }

  public has(key: string): boolean {
    return this.memoryCache.has(key) || (this.enableSessionStorage && this.sessionCache.has(key))
  }

  public delete(key: string): boolean {
    const memoryDeleted = this.memoryCache.delete(key)
    const sessionDeleted = this.enableSessionStorage ? this.sessionCache.delete(key) : true

    return memoryDeleted && sessionDeleted
  }

  public clear(): void {
    this.memoryCache.clear()

    if (this.enableSessionStorage) {
      this.sessionCache.clear()
    }
  }

  public size(): number {
    return this.memoryCache.size()
  }

  public cleanup(): void {
    this.memoryCache.cleanup()

    if (this.enableSessionStorage) {
      this.sessionCache.cleanup()
    }
  }

  public getStats(): {
    memory: { size: number; hits: number; misses: number }
    session: { size: number; enabled: boolean }
  } {
    return {
      memory: {
        size: this.memoryCache.size(),
        hits: 0,
        misses: 0
      },
      session: {
        size: this.enableSessionStorage ? this.sessionCache.size() : 0,
        enabled: this.enableSessionStorage
      }
    }
  }

  public warmupFromSessionStorage(): void {
    if (!this.enableSessionStorage) return

    try {
      console.log('MultiTierCache: L1 cache will be warmed up on access')
    } catch (error) {
      console.warn('Cache warmup failed:', error)
    }
  }

  public destroy(): void {
    if ('destroy' in this.memoryCache) {
      ;(this.memoryCache as any).destroy()
    }

    // Session storage persists, just cleanup expired items
    if (this.enableSessionStorage) {
      this.sessionCache.cleanup()
    }
  }
}
