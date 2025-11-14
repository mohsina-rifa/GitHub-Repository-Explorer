import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export interface RouteValidationError {
  code: 'INVALID_PARAMS' | 'MISSING_PARAMS' | 'MALFORMED_URL'
  message: string
  params?: Record<string, any>
}

export class RouteValidator {
  private static readonly GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
  private static readonly GITHUB_REPO_PATTERN = /^[a-zA-Z0-9._-]+$/

  static validateRepositoryRoute = (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): void => {
    const { owner, repo } = to.params

    try {
      // Validate required parameters
      if (!owner || !repo) {
        throw new Error('Missing required parameters: owner and repo')
      }

      // Validate parameter types
      if (typeof owner !== 'string' || typeof repo !== 'string') {
        throw new Error('Invalid parameter types')
      }

      // Use RouteValidator.PROPERTY instead of this.PROPERTY
      if (!RouteValidator.GITHUB_USERNAME_PATTERN.test(owner)) {
        throw new Error('Invalid GitHub username format')
      }

      // Validate repository name format
      if (!RouteValidator.GITHUB_REPO_PATTERN.test(repo)) {
        throw new Error('Invalid repository name format')
      }

      // Validate length constraints
      if (owner.length > 39) {
        throw new Error('Username too long (max 39 characters)')
      }

      if (repo.length > 100) {
        throw new Error('Repository name too long (max 100 characters)')
      }

      // Decode URL-encoded parameters
      to.params.owner = decodeURIComponent(owner)
      to.params.repo = decodeURIComponent(repo)

      next()
    } catch (error: any) {
      console.error('Route validation failed:', error.message)

      // Redirect to Search (capital S to match your route name)
      next({
        name: 'Search',
        query: {
          error: 'invalid-repository',
          message: error.message,
          attempted: `${owner}/${repo}`
        }
      })
    }
  }

  static validateComparisonRoute = (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): void => {
    const { repos } = to.query

    try {
      if (repos && typeof repos === 'string') {
        const repoIds = repos.split(',').map(id => parseInt(id, 10))

        // Validate repository IDs
        for (const id of repoIds) {
          if (isNaN(id) || id <= 0) {
            throw new Error('Invalid repository ID in comparison URL')
          }
        }

        // Validate count (max 4 repositories)
        if (repoIds.length > 4) {
          throw new Error('Too many repositories for comparison (max 4)')
        }
      }

      next()
    } catch (error: any) {
      console.error('Comparison route validation failed:', error.message)

      next({
        name: 'Search',
        query: {
          error: 'invalid-comparison',
          message: error.message
        }
      })
    }
  }
}

// Global navigation guard for security
export const globalBeforeEach = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  // Sanitize query parameters
  if (to.query) {
    const sanitizedQuery: Record<string, any> = {}

    for (const [key, value] of Object.entries(to.query)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitizedQuery[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
      } else {
        sanitizedQuery[key] = value
      }
    }

    to.query = sanitizedQuery
  }

  next()
}