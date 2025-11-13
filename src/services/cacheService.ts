import type { ICacheService, CacheEntry, CacheOptions } from './interfaces/iCacheService'

// In-memory caching service implementation
export class CacheService implements ICacheService {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTtl: number
  private maxSize: number
  private cleanupTimer: number | null = null

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.defaultTtl || 5 * 60 * 1000 // 5 minutes
    this.maxSize = options.maxSize || 100
    
    // Auto cleanup expired entries
    if (options.cleanupInterval) {
      this.startAutoCleanup(options.cleanupInterval)
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    // Enforce cache size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
      key
    }

    this.cache.set(key, entry)
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  public delete(key: string): boolean {
    return this.cache.delete(key)
  }

  public clear(): void {
    this.cache.clear()
  }

  public size(): number {
    return this.cache.size
  }

  public cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry, now)) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  private isExpired(entry: CacheEntry<unknown>, now: number = Date.now()): boolean {
    return now - entry.timestamp > entry.ttl
  }

  private evictOldest(): void {
    const oldestKey = this.cache.keys().next().value
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private startAutoCleanup(interval: number): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = window.setInterval(() => {
      this.cleanup()
    }, interval)
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}