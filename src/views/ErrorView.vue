<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  error?: string | string[]
  message?: string | string[]
  statusCode?: string | string[]
}

const props = defineProps<Props>()
const router = useRouter()

// Convert arrays to strings (from query params)
const errorType = computed(() => {
  if (Array.isArray(props.error)) return props.error[0]
  return props.error || 'unknown'
})

const errorMessage = computed(() => {
  if (Array.isArray(props.message)) return props.message[0]
  return props.message || 'An unexpected error occurred'
})

const statusCode = computed(() => {
  if (Array.isArray(props.statusCode)) return props.statusCode[0]
  return props.statusCode
})

// Error icon and color based on type
const errorConfig = computed(() => {
  const code = statusCode.value
  const type = errorType.value

  if (code === '404' || type === 'not-found') {
    return {
      icon: 'bi-search',
      color: '#6c757d',
      title: '404 - Page Not Found'
    }
  }

  if (code === '403' || type === 'forbidden') {
    return {
      icon: 'bi-lock-fill',
      color: '#dc3545',
      title: '403 - Access Forbidden'
    }
  }

  if (code === '500' || type === 'server-error') {
    return {
      icon: 'bi-exclamation-triangle-fill',
      color: '#ffc107',
      title: '500 - Server Error'
    }
  }

  if (type === 'invalid-repository' || type === 'invalid-comparison') {
    return {
      icon: 'bi-exclamation-circle-fill',
      color: '#0dcaf0',
      title: 'Invalid Request'
    }
  }

  return {
    icon: 'bi-exclamation-triangle-fill',
    color: '#dc3545',
    title: 'Error'
  }
})

// Actions
const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

const tryAgain = () => {
  router.go(0) // Reload current page
}
</script>

<template>
  <div class="error-view">
    <div class="error-container">
      <div class="error-icon-wrapper">
        <i class="bi" :class="errorConfig.icon" :style="{ color: errorConfig.color }"></i>
      </div>

      <h1 class="error-title">{{ errorConfig.title }}</h1>

      <p class="error-message">{{ errorMessage }}</p>

      <div class="error-actions">
        <button class="btn btn-primary" @click="goHome">
          <i class="bi bi-house-door"></i> Go Home
        </button>
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left"></i> Go Back
        </button>
        <button v-if="statusCode === '500'" class="btn btn-outline-primary" @click="tryAgain">
          <i class="bi bi-arrow-clockwise"></i> Try Again
        </button>
      </div>

      <div class="error-details" v-if="errorType !== 'unknown'">
        <small class="text-muted">
          Error Code: <code>{{ errorType }}</code>
        </small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-view {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 600px;
  padding: 3rem 2rem;
  border-radius: 16px;
}

.error-icon-wrapper {
  margin-bottom: 2rem;
}

.error-icon-wrapper i {
  font-size: 5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.error-actions .btn {
  min-width: 140px;
  transition: all 0.2s;
}

.error-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-details {
  padding-top: 1.5rem;
  border-top: 1px solid #dee2e6;
}

.error-details code {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #dc3545;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 576px) {
  .error-container {
    padding: 2rem 1.5rem;
  }

  .error-icon-wrapper i {
    font-size: 3.5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions .btn {
    width: 100%;
  }
}
</style>