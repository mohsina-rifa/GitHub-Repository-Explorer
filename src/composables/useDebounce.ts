import { ref, watch, type Ref } from 'vue'

export const useDebounce = <T>(source: Ref<T>, delay: number = 300) => {
  const debouncedValue = ref<T>(source.value) as Ref<T>
  const isDebouncing = ref(false)
  let timeoutId: number | null = null

  watch(
    source,
    newValue => {
      isDebouncing.value = true

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
        isDebouncing.value = false
      }, delay)
    },
    { immediate: false }
  )

  return {
    debouncedValue,
    isDebouncing
  }
}
