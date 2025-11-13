// Caching service interface for performance optimization
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface ICacheService {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttl?: number): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  size(): number
  cleanup(): void
}

export interface CacheOptions {
  defaultTtl?: number
  maxSize?: number
  cleanupInterval?: number
}
