import { GitHubApiClient } from '../api/gitHubApiClient'
import { RepositoryService } from '../repositoryService'
import { CacheService } from '../cacheService'
import type { IRepositoryService } from '../interfaces/iRepositoryService'
import type { ICacheService } from '../interfaces/iCacheService'

export class ServiceFactory {
  private static instance: ServiceFactory
  private cacheService: ICacheService | null = null
  private repositoryService: IRepositoryService | null = null
  private apiClient: GitHubApiClient | null = null

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory()
    }
    return ServiceFactory.instance
  }

  public createCacheService(): ICacheService {
    if (!this.cacheService) {
      this.cacheService = new CacheService({
        defaultTtl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        cleanupInterval: 60 * 1000 // 1 minute
      })
    }
    return this.cacheService
  }

  public createApiClient(): GitHubApiClient {
    if (!this.apiClient) {
      this.apiClient = new GitHubApiClient()
    }
    return this.apiClient
  }

  public createRepositoryService(): IRepositoryService {
    if (!this.repositoryService) {
      const apiClient = this.createApiClient()
      const cacheService = this.createCacheService()

      this.repositoryService = new RepositoryService(cacheService, apiClient)
    }
    return this.repositoryService!
  }

  public createServiceWithConfig(config: {
    cacheEnabled?: boolean
    cacheTtl?: number
    cacheSize?: number
  }): IRepositoryService {
    const apiClient = this.createApiClient()

    const cacheService = config.cacheEnabled
      ? new CacheService({
          defaultTtl: config.cacheTtl || 5 * 60 * 1000,
          maxSize: config.cacheSize || 100
        })
      : null

    return new RepositoryService(cacheService, apiClient)
  }

  public destroyServices(): void {
    if (this.cacheService && 'destroy' in this.cacheService) {
      ;(this.cacheService as any).destroy()
    }

    this.cacheService = null
    this.repositoryService = null
    this.apiClient = null
  }
}
