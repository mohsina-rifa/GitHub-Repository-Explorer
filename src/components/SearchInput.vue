<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useDebounce } from '../composables/useDebounce'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  showClearButton?: boolean
  debounceMs?: number
  autoFocus?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void
  (e: 'clear'): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search repositories...',
  disabled: false,
  showClearButton: true,
  debounceMs: 300,
  autoFocus: false
})

const emit = defineEmits<Emits>()

const searchInputRef = ref<HTMLInputElement>()
const localQuery = ref(props.modelValue)

// Debounced search functionality
const { debouncedValue } = useDebounce(localQuery, props.debounceMs)

// Watch for external model value changes
watch(
  () => props.modelValue,
  newValue => {
    localQuery.value = newValue
  }
)

// Watch for debounced value changes and emit search
watch(debouncedValue, newValue => {
  emit('update:modelValue', newValue)
  if (newValue.trim()) {
    emit('search', newValue.trim())
  }
})

const handleEnterKey = (): void => {
  if (localQuery.value.trim()) {
    emit('search', localQuery.value.trim())
  }
}

const clearSearch = (): void => {
  localQuery.value = ''
  emit('clear')
  searchInputRef.value?.focus()
}

const handleFocus = (): void => {
  emit('focus')
}

const handleBlur = (): void => {
  emit('blur')
}

onMounted(() => {
  if (props.autoFocus && searchInputRef.value) {
    searchInputRef.value.focus()
  }
})
</script>

<template>
  <div class="search-input-container">
    <div class="input-group">
      <span class="input-group-text">
        <i class="bi bi-search"></i>
      </span>
      <input
        ref="searchInputRef"
        v-model="localQuery"
        type="text"
        class="form-control"
        :placeholder="placeholder"
        :disabled="disabled"
        @keyup.enter="handleEnterKey"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <button
        v-if="showClearButton && localQuery"
        class="btn btn-outline-secondary clear-btn"
        type="button"
        @click="clearSearch"
      >
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-input-container {
  position: relative;
  width: 100%;
}

.input-group {
  position: relative;
}

.input-group-text {
  background-color: var(--bs-white);
  border-right: none;
  color: var(--bs-secondary);
}

.form-control {
  border-left: none;
  box-shadow: none;
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.clear-btn {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  border: none;
  background: transparent;
  padding: 0.25rem 0.5rem;
}

.clear-btn:hover {
  background-color: var(--bs-light);
}

@media (max-width: 768px) {
  .search-input-container {
    margin-bottom: 1rem;
  }
}
</style>
