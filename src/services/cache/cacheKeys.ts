// Centralized cache key management
export class CacheKeys {
  private static readonly PREFIX = 'github_explorer:'

  public static readonly SEARCH_REPOSITORIES = (query: string, page: number = 1): string =>
    `${this.PREFIX}search:${query}:${page}`

  public static readonly REPOSITORY_DETAILS = (owner: string, repo: string): string =>
    `${this.PREFIX}repo:${owner}/${repo}`

  public static readonly REPOSITORY_README = (owner: string, repo: string): string =>
    `${this.PREFIX}readme:${owner}/${repo}`

  public static readonly REPOSITORY_CONTRIBUTORS = (owner: string, repo: string): string =>
    `${this.PREFIX}contributors:${owner}/${repo}`

  public static readonly TRENDING_REPOSITORIES = (language?: string): string =>
    `${this.PREFIX}trending:${language || 'all'}`

  public static readonly USER_PROFILE = (username: string): string =>
    `${this.PREFIX}user:${username}`

  // Cache TTL constants (in milliseconds)
  public static readonly TTL = {
    SEARCH_RESULTS: 2 * 60 * 1000, // 2 minutes
    REPOSITORY_DETAILS: 5 * 60 * 1000, // 5 minutes
    README_CONTENT: 10 * 60 * 1000, // 10 minutes
    CONTRIBUTORS: 15 * 60 * 1000, // 15 minutes
    TRENDING: 30 * 60 * 1000, // 30 minutes
    USER_PROFILE: 5 * 60 * 1000 // 5 minutes
  } as const
}
