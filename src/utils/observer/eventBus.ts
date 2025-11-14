import type { Observer, Observable } from './observer'

export class EventBus<T = unknown> implements Observable<T> {
  private observers: Map<string, Observer<T>> = new Map()
  private static instances: Map<string, EventBus<any>> = new Map()

  private constructor() {
  }

  public static getInstance<T>(eventName: string): EventBus<T> {
    if (!EventBus.instances.has(eventName)) {
      EventBus.instances.set(eventName, new EventBus<T>())
    }
    return EventBus.instances.get(eventName)!
  }

  public subscribe(observer: Observer<T>): void {
    this.observers.set(observer.getId(), observer)
  }

  public unsubscribe(observer: Observer<T>): void {
    this.observers.delete(observer.getId())
  }

  public notify(data: T): void {
    this.observers.forEach(observer => {
      try {
        observer.update(data)
      } catch (error) {
        console.error(`Observer ${observer.getId()} update failed:`, error)
      }
    })
  }

  public getObserverCount(): number {
    return this.observers.size
  }

  public clear(): void {
    this.observers.clear()
  }

  public static clearAll(): void {
    EventBus.instances.forEach(bus => bus.clear())
    EventBus.instances.clear()
  }
}