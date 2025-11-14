// Input sanitization utilities for XSS prevention
export class Sanitizer {
  private static readonly HTML_ESCAPE_MAP: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  private static readonly DANGEROUS_PROTOCOLS = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "about:",
  ];

  /**
   * Escapes HTML characters to prevent XSS
   */
  public static escapeHtml(input: string): string {
    if (!input || typeof input !== "string") {
      return "";
    }

    return input.replace(/[&<>"'`=/]/g, (char) => {
      return this.HTML_ESCAPE_MAP[char] || char;
    });
  }

  /**
   * Sanitizes URLs to prevent malicious protocols
   */
  public static sanitizeUrl(url: string): string {
    if (!url || typeof url !== "string") {
      return "";
    }

    const trimmedUrl = url.trim().toLowerCase();

    // Check for dangerous protocols
    for (const protocol of this.DANGEROUS_PROTOCOLS) {
      if (trimmedUrl.startsWith(protocol)) {
        return "";
      }
    }

    // Allow only http, https, and relative URLs
    if (
      trimmedUrl.startsWith("http://") ||
      trimmedUrl.startsWith("https://") ||
      trimmedUrl.startsWith("//") ||
      trimmedUrl.startsWith("/") ||
      trimmedUrl.startsWith("#")
    ) {
      return url.trim();
    }

    return "";
  }

  /**
   * Sanitizes search query input
   */
  public static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== "string") {
      return "";
    }

    return query
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes that could break queries
      .substring(0, 256); // Limit length
  }

  /**
   * Sanitizes markdown content (basic sanitization)
   */
  public static sanitizeMarkdown(content: string): string {
    if (!content || typeof content !== "string") {
      return "";
    }

    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ""); // Remove event handlers
  }

  /**
   * Validates and sanitizes repository names
   */
  public static sanitizeRepositoryName(name: string): string {
    if (!name || typeof name !== "string") {
      return "";
    }

    // GitHub repository names can contain alphanumeric, hyphens, underscores, and dots
    return name
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .substring(0, 100); // GitHub limit
  }

  /**
   * Sanitizes user input for display
   */
  public static sanitizeForDisplay(input: string): string {
    return this.escapeHtml(input);
  }

  /**
   * Deep sanitizes an object recursively
   */
  public static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    const sanitized = { ...obj };

    for (const key in sanitized) {
      if (typeof sanitized[key] === "string") {
        sanitized[key] = this.sanitizeForDisplay(sanitized[key]) as T[Extract<
          keyof T,
          string
        >];
      } else if (
        typeof sanitized[key] === "object" &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }
}
