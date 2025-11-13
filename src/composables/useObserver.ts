import { onUnmounted, ref } from 'vue'
import type { Observer } from '../utils/observer/observer'
import { EventBus } from '../utils/observer/eventBus'

export const useObserver = <T>(eventName: string, callback: (data: T) => void) => {
  const observerId = ref(`observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const eventBus = EventBus.getInstance<T>(eventName)

  const observer: Observer<T> = {
    update: callback,
    getId: () => observerId.value
  }

  eventBus.subscribe(observer)

  onUnmounted(() => {
    eventBus.unsubscribe(observer)
  })

  return {
    observerId: observerId.value,
    eventBus,
    unsubscribe: () => eventBus.unsubscribe(observer),
    resubscribe: () => eventBus.subscribe(observer)
  }
}

export const useEventEmitter = <T>(eventName: string) => {
  const eventBus = EventBus.getInstance<T>(eventName)

  return {
    emit: (data: T) => eventBus.notify(data),
    getObserverCount: () => eventBus.getObserverCount()
  }
}
