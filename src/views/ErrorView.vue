<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  error?: string
  message?: string
  statusCode?: string
}

const props = withDefaults(defineProps<Props>(), {
  error: 'unknown',
  message: 'An unexpected error occurred',
  statusCode: '500'
})

const router = useRouter()

const currentUrl = computed(() => window.location.href)
const userAgent = computed(() => navigator.userAgent)

const debugInfo = computed(() => ({
  error: props.error,
  message: props.message,
  statusCode: props.statusCode,
  url: currentUrl.value,
  userAgent: userAgent.value,
  timestamp: new Date().toISOString()
}))

const errorConfig = computed(() => {
  const configs = {
    'not-found': {
      icon: 'bi-exclamation-triangle',
      title: 'Page Not Found',
      description: 'The page you are looking for could not be found.',
      color: 'warning',
      showHome: true,
      showBack: true,
      showRetry: false
    },
    'invalid-repository': {
      icon: 'bi-github',
      title: 'Invalid Repository',
      description: 'The repository URL format is invalid or the repository does not exist.',
      color: 'danger',
      showHome: true,
      showBack: true,
      showRetry: false
    },
    'invalid-comparison': {
      icon: 'bi-bar-chart',
      title: 'Invalid Comparison',
      description: 'The comparison URL is malformed or contains invalid repository IDs.',
      color: 'danger',
      showHome: true,
      showBack: true,
      showRetry: false
    },
    'network-error': {
      icon: 'bi-wifi-off',
      title: 'Network Error',
      description: 'Unable to connect to GitHub API. Please check your internet connection.',
      color: 'danger',
      showHome: true,
      showBack: true,
      showRetry: true
    },
    'rate-limit': {
      icon: 'bi-speedometer2',
      title: 'Rate Limit Exceeded',
      description: 'GitHub API rate limit exceeded. Please try again later.',
      color: 'warning',
      showHome: true,
      showBack: false,
      showRetry: false
    },
    forbidden: {
      icon: 'bi-shield-exclamation',
      title: 'Access Forbidden',
      description: 'You do not have permission to access this resource.',
      color: 'danger',
      showHome: true,
      showBack: true,
      showRetry: false
    },
    'server-error': {
      icon: 'bi-server',
      title: 'Server Error',
      description: 'GitHub servers are experiencing issues. Please try again later.',
      color: 'danger',
      showHome: true,
      showBack: true,
      showRetry: true
    },
    unknown: {
      icon: 'bi-question-circle',
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try again.',
      color: 'secondary',
      showHome: true,
      showBack: true,
      showRetry: true
    }
  }

  return configs[props.error as keyof typeof configs] || configs.unknown
})

const goHome = (): void => {
  router.push({ name: 'Search' })
}

const goBack = (): void => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}

const retry = (): void => {
  window.location.reload()
}

const reportIssue = (): void => {
  const githubIssueUrl =
    'https://github.com/your-repo/issues/new?' +
    new URLSearchParams({
      title: `Error: ${errorConfig.value.title}`,
      body: `**Error Details:**\n- Type: ${props.error}\n- Message: ${props.message}\n- Status Code: ${props.statusCode}\n- URL: ${currentUrl.value}\n- User Agent: ${userAgent.value}\n\n**Steps to Reproduce:**\n1. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n`
    }).toString()

  window.open(githubIssueUrl, '_blank')
}
</script>

<template>
  <div class="error-view min-vh-100 d-flex align-items-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8 col-12">
          <div class="text-center mb-5">
            <!-- Error Icon -->
            <div class="error-icon mb-4">
              <i
                :class="`${errorConfig.icon} text-${errorConfig.color}`"
                style="font-size: 4rem"
              ></i>
            </div>

            <!-- Error Title -->
            <h1 class="display-4 fw-bold mb-3">
              {{ errorConfig.title }}
            </h1>

            <!-- Status Code -->
            <div v-if="statusCode" class="mb-3">
              <span :class="`badge bg-${errorConfig.color} fs-6`"> Error {{ statusCode }} </span>
            </div>

            <!-- Error Description -->
            <p class="lead text-muted mb-4">
              {{ errorConfig.description }}
            </p>

            <!-- Custom Message -->
            <div
              v-if="message && message !== errorConfig.description"
              class="alert alert-light mb-4"
            >
              <small> <strong>Details:</strong> {{ message }} </small>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <!-- Primary Actions -->
            <button v-if="errorConfig.showHome" class="btn btn-primary btn-lg" @click="goHome">
              <i class="bi bi-house me-2"></i>
              Go to Search
            </button>

            <button
              v-if="errorConfig.showBack"
              class="btn btn-outline-secondary btn-lg"
              @click="goBack"
            >
              <i class="bi bi-arrow-left me-2"></i>
              Go Back
            </button>

            <!-- Secondary Actions -->
            <button v-if="errorConfig.showRetry" class="btn btn-outline-primary" @click="retry">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>

          <!-- Additional Help -->
          <div class="text-center mt-5">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">
                  <i class="bi bi-question-circle me-2"></i>
                  Need Help?
                </h5>
                <p class="card-text text-muted mb-3">
                  If this error persists, you can report it or try these suggestions:
                </p>

                <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                  <button class="btn btn-outline-info btn-sm" @click="reportIssue">
                    <i class="bi bi-bug me-1"></i>
                    Report Issue
                  </button>

                  <a
                    href="https://docs.github.com/en/rest"
                    target="_blank"
                    class="btn btn-outline-secondary btn-sm"
                  >
                    <i class="bi bi-book me-1"></i>
                    API Documentation
                  </a>

                  <button class="btn btn-outline-secondary btn-sm" @click="retry">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Details (Development Mode) -->
          <div v-if="import.meta.env.DEV" class="mt-4">
            <details class="text-start">
              <summary class="btn btn-outline-secondary btn-sm mb-3">
                <i class="bi bi-code me-1"></i>
                Debug Information
              </summary>
              <div class="card">
                <div class="card-body">
                  <pre class="small text-muted mb-0">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-view {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.error-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 576px) {
  .error-icon i {
    font-size: 3rem !important;
  }

  .display-4 {
    font-size: 2rem;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
