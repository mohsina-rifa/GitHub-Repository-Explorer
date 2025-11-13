<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  isLoading?: boolean
  maxVisiblePages?: number
}

interface Emits {
  (e: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  maxVisiblePages: 5
})

const emit = defineEmits<Emits>()

const changePage = (page: number): void => {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages && !props.isLoading) {
    emit('page-change', page)
  }
}

const getVisiblePages = (): number[] => {
  const { currentPage, totalPages, maxVisiblePages } = props
  const pages: number[] = []

  let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let end = Math.min(totalPages, start + maxVisiblePages - 1)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}
</script>

<template>
  <nav aria-label="Search results pagination" class="mt-4">
    <ul class="pagination justify-content-center">
      <!-- Previous Button -->
      <li class="page-item" :class="{ disabled: currentPage === 1 || isLoading }">
        <button
          class="page-link"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || isLoading"
        >
          <i class="bi bi-chevron-left"></i>
          Previous
        </button>
      </li>

      <!-- First Page -->
      <li
        v-if="
          getVisiblePages().length > 0 && getVisiblePages()[0] != null && getVisiblePages()[0]! > 1
        "
        class="page-item"
      >
        <button class="page-link" @click="changePage(1)">1</button>
      </li>
      <li
        v-if="
          getVisiblePages().length > 0 && getVisiblePages()[0] != null && getVisiblePages()[0]! > 2
        "
        class="page-item disabled"
      >
        <span class="page-link">...</span>
      </li>

      <!-- Visible Pages -->
      <li
        v-for="page in getVisiblePages()"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
      >
        <button class="page-link" @click="changePage(page)" :disabled="isLoading">
          {{ page }}
        </button>
      </li>

      <!-- Last Page -->
      <li
        v-if="
          getVisiblePages().length > 0 &&
          getVisiblePages()[getVisiblePages().length - 1]! < totalPages - 1
        "
        class="page-item disabled"
      >
        <span class="page-link">...</span>
      </li>
      <li
        v-if="
          getVisiblePages().length > 0 &&
          getVisiblePages()[getVisiblePages().length - 1]! < totalPages
        "
        class="page-item"
      >
        <button class="page-link" @click="changePage(totalPages)">{{ totalPages }}</button>
      </li>

      <!-- Next Button -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages || isLoading }">
        <button
          class="page-link"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages || isLoading"
        >
          Next
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>

    <!-- Page Info -->
    <div class="text-center mt-2">
      <small class="text-muted"> Page {{ currentPage }} of {{ totalPages }} </small>
    </div>
  </nav>
</template>

<style scoped>
.page-link {
  border: none;
  background: transparent;
}

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.page-item.disabled .page-link {
  opacity: 0.5;
}
</style>
