import type { ICacheService, CacheOptions } from '../interfaces/iCacheService'
import { CacheService } from '../cacheService'
import { SessionStorageCache } from './sessionStorageCache'
import { MultiTierCache } from './multiTierCache'

export const CacheStrategy = {
  MEMORY_ONLY: 'memory_only',
  SESSION_ONLY: 'session_only',
  MULTI_TIER: 'multi_tier'
} as const

export type CacheStrategy = (typeof CacheStrategy)[keyof typeof CacheStrategy]

export interface CacheConfig extends CacheOptions {
  strategy: CacheStrategy
  enableSessionStorage?: boolean
  sessionStoragePrefix?: string
}

export class CacheStrategyManager {
  public static createCache(config: CacheConfig): ICacheService {
    switch (config.strategy) {
      case CacheStrategy.MEMORY_ONLY:
        return new CacheService({
          defaultTtl: config.defaultTtl,
          maxSize: config.maxSize,
          cleanupInterval: config.cleanupInterval
        })

      case CacheStrategy.SESSION_ONLY:
        return new SessionStorageCache(config.sessionStoragePrefix)

      case CacheStrategy.MULTI_TIER:
      default:
        return new MultiTierCache({
          defaultTtl: config.defaultTtl,
          maxSize: config.maxSize,
          cleanupInterval: config.cleanupInterval,
          enableSessionStorage: config.enableSessionStorage
        })
    }
  }

  public static getRecommendedStrategy(): CacheStrategy {
    try {
      const testKey = '__cache_test__'
      sessionStorage.setItem(testKey, 'test')
      sessionStorage.removeItem(testKey)
      return CacheStrategy.MULTI_TIER
    } catch {
      console.warn('SessionStorage not available, falling back to memory-only cache')
      return CacheStrategy.MEMORY_ONLY
    }
  }
}
