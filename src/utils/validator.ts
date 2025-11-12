// Input validation utilities
export class Validator {
  /**
   * Validates GitHub repository owner/name format
   */
  public static isValidRepositoryPath(path: string): boolean {
    if (!path || typeof path !== "string") {
      return false;
    }

    const parts = path.split("/");
    if (parts.length !== 2) {
      return false;
    }

    const [owner, repo] = parts;
    return (
      owner !== undefined &&
      repo !== undefined &&
      this.isValidGitHubUsername(owner) &&
      this.isValidRepositoryName(repo)
    );
  }

  /**
   * Validates GitHub username format
   */
  public static isValidGitHubUsername(username: string): boolean {
    if (!username || typeof username !== "string") {
      return false;
    }

    // GitHub username rules: 1-39 chars, alphanumeric and hyphens, cannot start/end with hyphen
    const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    return pattern.test(username);
  }

  /**
   * Validates GitHub repository name format
   */
  public static isValidRepositoryName(name: string): boolean {
    if (!name || typeof name !== "string") {
      return false;
    }

    // GitHub repo name rules: 1-100 chars, alphanumeric, hyphens, underscores, dots
    const pattern = /^[a-zA-Z0-9._-]{1,100}$/;
    return pattern.test(name);
  }

  /**
   * Validates search query
   */
  public static isValidSearchQuery(query: string): boolean {
    if (!query || typeof query !== "string") {
      return false;
    }

    const trimmed = query.trim();
    return trimmed.length >= 1 && trimmed.length <= 256;
  }

  /**
   * Validates URL format
   */
  public static isValidUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }
}
