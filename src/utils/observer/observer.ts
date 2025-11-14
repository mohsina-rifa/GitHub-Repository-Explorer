export interface Observer<T = unknown> {
  update(data: T): void
  getId(): string
}

export interface Observable<T = unknown> {
  subscribe(observer: Observer<T>): void
  unsubscribe(observer: Observer<T>): void
  notify(data: T): void
}
