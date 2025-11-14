<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'page-change': [page: number]
}>()

const jumpToPageInput = ref(props.currentPage)

const startItem = computed(() => (props.currentPage - 1) * props.itemsPerPage + 1)
const endItem = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems))

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (props.totalPages <= maxVisible + 2) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    let start = Math.max(2, props.currentPage - 1)
    let end = Math.min(props.totalPages - 1, props.currentPage + 1)

    if (props.currentPage <= 3) {
      end = maxVisible
    } else if (props.currentPage >= props.totalPages - 2) {
      start = props.totalPages - maxVisible + 1
    }

    if (start > 2) {
      pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < props.totalPages - 1) {
      pages.push('...')
    }

    pages.push(props.totalPages)
  }

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const handleJumpToPage = (event: Event) => {
  const target = event.target as HTMLInputElement
  const page = parseInt(target.value)
  if (page >= 1 && page <= props.totalPages) {
    goToPage(page)
  }
}
</script>

<template>
  <nav class="pagination-nav">
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a class="page-link" href="#" tabindex="-1" @click.prevent="goToPage(currentPage - 1)">
          <i class="bi bi-chevron-left"></i> Previous
        </a>
      </li>

      <li
        v-for="(page, index) in visiblePages"
        :key="index"
        class="page-item"
        :class="{ active: page === currentPage, disabled: page === '...' }"
      >
        <a
          class="page-link"
          href="#"
          @click.prevent="typeof page === 'number' ? goToPage(page) : null"
        >
          {{ page }}
        </a>
      </li>

      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
          Next <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    </ul>

    <div class="text-center mt-3">
      <small class="text-muted">
        Showing {{ startItem }}-{{ endItem }} of {{ totalItems.toLocaleString() }} results | Jump to
        page:
      </small>
      <input
        v-model="jumpToPageInput"
        type="number"
        class="form-control form-control-sm d-inline-block ms-2"
        style="width: 80px"
        :min="1"
        :max="totalPages"
        @change="handleJumpToPage"
      />
    </div>
  </nav>
</template>

<style scoped>
.pagination-nav {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  color: var(--bs-primary);
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.pagination .page-link:hover {
  background-color: #f8f9fa;
  border-color: var(--bs-primary);
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  font-weight: 600;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination .page-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .pagination .page-link {
    margin: 0 0.1rem;
    padding: 0.25rem 0.5rem;
  }

  .pagination-nav {
    padding: 1rem;
  }
}
</style>
