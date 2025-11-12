import { BaseRepository } from "./base/baseRepository";
import type {
  IGitHubRepository,
  GitHubRepositoryData,
} from "./interfaces/iGitHubRepository";

// Concrete GitHub repository implementation
export class GitHubRepository
  extends BaseRepository<GitHubRepositoryData, string>
  implements IGitHubRepository
{
  protected apiClient: unknown = null; // Will be injected via service

  constructor(apiClient: unknown) {
    super();
    this.apiClient = apiClient;
  }

  async findById(id: string): Promise<GitHubRepositoryData | null> {
    this.validateId(id);
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }

  async findAll(
    _params?: Record<string, unknown>
  ): Promise<GitHubRepositoryData[]> {
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }

  async search(
    query: string,
    _filters?: Record<string, unknown>
  ): Promise<{ items: GitHubRepositoryData[]; total: number }> {
    if (!query.trim()) {
      return { items: [], total: 0 };
    }
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }

  async getRepositoryDetails(
    owner: string,
    repo: string
  ): Promise<GitHubRepositoryData | null> {
    this.validateId(`${owner}/${repo}`);
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }

  async getRepositoryReadme(
    owner: string,
    repo: string
  ): Promise<string | null> {
    this.validateId(`${owner}/${repo}`);
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }

  async getRepositoryContributors(
    owner: string,
    repo: string
  ): Promise<unknown[]> {
    this.validateId(`${owner}/${repo}`);
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }

  async getTrendingRepositories(
    _language?: string
  ): Promise<GitHubRepositoryData[]> {
    // Implementation will be added when we create the GitHub service
    throw new Error("Method not implemented yet");
  }
}
