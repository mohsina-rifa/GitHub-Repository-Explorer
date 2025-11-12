export interface IRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(params?: Record<string, unknown>): Promise<T[]>;
  search(
    query: string,
    filters?: Record<string, unknown>
  ): Promise<{ items: T[]; total: number }>;
  create?(data: Partial<T>): Promise<T>;
  update?(id: K, data: Partial<T>): Promise<T>;
  delete?(id: K): Promise<void>;
}
