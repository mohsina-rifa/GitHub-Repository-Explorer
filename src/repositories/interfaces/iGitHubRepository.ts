import type { IRepository } from "./iRepository";

export interface GitHubRepositoryData {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface IGitHubRepository
  extends IRepository<GitHubRepositoryData, string> {
  getRepositoryDetails(
    owner: string,
    repo: string
  ): Promise<GitHubRepositoryData | null>;
  getRepositoryReadme(owner: string, repo: string): Promise<string | null>;
  getRepositoryContributors(owner: string, repo: string): Promise<unknown[]>;
  getTrendingRepositories(language?: string): Promise<GitHubRepositoryData[]>;
}
