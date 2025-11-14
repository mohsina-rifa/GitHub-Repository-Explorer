class Config {
  private static instance: Config;

  private constructor() {
    this.validateRequiredEnvVars();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private validateRequiredEnvVars(): void {
    const required = ["VITE_GITHUB_TOKEN", "VITE_GITHUB_API_BASE_URL"];
    const missing = required.filter((key) => !import.meta.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  public get githubToken(): string {
    return import.meta.env.VITE_GITHUB_TOKEN;
  }

  public get githubApiBaseUrl(): string {
    return import.meta.env.VITE_GITHUB_API_BASE_URL;
  }

  public get appName(): string {
    return import.meta.env.VITE_APP_NAME || "GitHub Repository Explorer";
  }

  public get securityHeaders(): Record<string, string> {
    return {
      "Content-Security-Policy":
        import.meta.env.VITE_CONTENT_SECURITY_POLICY || "",
      "X-Frame-Options": import.meta.env.VITE_X_FRAME_OPTIONS || "DENY",
      "X-Content-Type-Options":
        import.meta.env.VITE_X_CONTENT_TYPE_OPTIONS || "nosniff",
    };
  }
}

export default Config.getInstance();
