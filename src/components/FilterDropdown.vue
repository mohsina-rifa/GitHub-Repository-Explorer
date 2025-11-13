<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string
  label: string
  icon?: string
  count?: number
}

interface Props {
  label: string
  options: Option[]
  modelValue: string | null
  showClearOption?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', option: Option | null): void
}

const props = withDefaults(defineProps<Props>(), {
  showClearOption: true
})

const emit = defineEmits<Emits>()

const selectedLabel = computed(() => {
  const selected = props.options.find(option => option.value === props.modelValue)
  return selected?.label
})

const selectedValue = computed(() => props.modelValue)

const selectOption = (option: Option): void => {
  emit('update:modelValue', option.value)
  emit('change', option)
}

const clearSelection = (): void => {
  emit('update:modelValue', null)
  emit('change', null)
}
</script>

<template>
  <div class="dropdown">
    <button
      class="btn btn-outline-secondary dropdown-toggle"
      type="button"
      :data-bs-toggle="'dropdown'"
      :aria-expanded="false"
    >
      {{ selectedLabel || label }}
      <span v-if="selectedValue" class="badge bg-primary ms-2">{{ selectedValue }}</span>
    </button>
    <ul class="dropdown-menu">
      <li v-if="showClearOption">
        <button class="dropdown-item" type="button" @click="clearSelection">
          <i class="bi bi-x-circle me-2"></i>
          Clear {{ label }}
        </button>
        <hr class="dropdown-divider" />
      </li>
      <li v-for="option in options" :key="option.value">
        <button
          class="dropdown-item"
          :class="{ active: selectedValue === option.value }"
          type="button"
          @click="selectOption(option)"
        >
          <i v-if="option.icon" :class="option.icon" class="me-2"></i>
          {{ option.label }}
          <span v-if="option.count" class="badge bg-light text-dark ms-2">{{ option.count }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown-item.active {
  background-color: var(--bs-primary);
  color: var(--bs-white);
}

.dropdown-item:hover {
  background-color: var(--bs-light);
}

@media (max-width: 768px) {
  .dropdown {
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
