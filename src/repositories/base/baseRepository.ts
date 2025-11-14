import type { IRepository } from "../interfaces/iRepository";

// Abstract base repository with common functionality
export abstract class BaseRepository<T, K = string>
  implements IRepository<T, K>
{
  protected abstract apiClient: unknown;

  abstract findById(id: K): Promise<T | null>;
  abstract findAll(params?: Record<string, unknown>): Promise<T[]>;
  abstract search(
    query: string,
    filters?: Record<string, unknown>
  ): Promise<{ items: T[]; total: number }>;

  // Common utility methods
  protected handleError(error: unknown): never {
    console.error("Repository error:", error);
    throw new Error("Repository operation failed");
  }

  protected validateId(id: K): void {
    if (!id) {
      throw new Error("Invalid ID provided");
    }
  }
}
