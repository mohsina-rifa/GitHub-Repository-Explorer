<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content: string | null
  repositoryUrl?: string
}

const props = defineProps<Props>()

const hasContent = computed(() => props.content && props.content.trim().length > 0)

const downloadReadme = (): void => {
  if (!props.content) return

  const blob = new Blob([props.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'README.md'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const copyToClipboard = async (): Promise<void> => {
  if (!props.content) return

  try {
    await navigator.clipboard.writeText(props.content)
    // You could emit an event here for showing a toast notification
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}
</script>

<template>
  <div class="readme-viewer">
    <!-- No README State -->
    <div v-if="!hasContent" class="text-center py-5">
      <i class="bi bi-file-text display-4 text-muted mb-3"></i>
      <h4 class="text-muted">No README available</h4>
      <p class="text-muted">This repository doesn't have a README file.</p>
      <a
        v-if="repositoryUrl"
        :href="`${repositoryUrl}#readme`"
        target="_blank"
        class="btn btn-outline-primary"
      >
        <i class="bi bi-github me-1"></i>
        View on GitHub
      </a>
    </div>

    <!-- README Content -->
    <div v-else class="readme-content">
      <!-- Toolbar -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h5 mb-0 d-flex align-items-center">
          <i class="bi bi-file-text me-2"></i>
          README.md
        </h3>
        <div class="btn-group btn-group-sm">
          <button
            class="btn btn-outline-secondary"
            @click="copyToClipboard"
            title="Copy to clipboard"
          >
            <i class="bi bi-clipboard"></i>
          </button>
          <button class="btn btn-outline-secondary" @click="downloadReadme" title="Download README">
            <i class="bi bi-download"></i>
          </button>
          <a
            v-if="repositoryUrl"
            :href="`${repositoryUrl}/blob/main/README.md`"
            target="_blank"
            class="btn btn-outline-secondary"
            title="View on GitHub"
          >
            <i class="bi bi-github"></i>
          </a>
        </div>
      </div>

      <!-- Content Display -->
      <div class="card">
        <div class="card-body">
          <!-- Raw Content (fallback) -->
          <div class="readme-raw">
            <pre class="readme-text">{{ content }}</pre>
          </div>
        </div>
      </div>

      <!-- Content Stats -->
      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle me-1"></i>
        {{ content?.length.toLocaleString() }} characters • {{ content?.split('\n').length }} lines
      </div>
    </div>
  </div>
</template>

<style scoped>
.readme-viewer {
  min-height: 300px;
}

.readme-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
  background-color: var(--bs-light);
  border-radius: 0.375rem;
  max-height: 600px;
  overflow-y: auto;
}

.readme-raw {
  max-height: 500px;
  overflow-y: auto;
}

.card-body {
  padding: 0;
}

@media (max-width: 768px) {
  .btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .readme-text {
    font-size: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
