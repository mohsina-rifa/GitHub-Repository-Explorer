<script setup lang="ts">
import { computed } from 'vue'

interface Contributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
  type: string
}

interface Props {
  contributors: Contributor[]
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 12
})

const hasContributors = computed(() => props.contributors && props.contributors.length > 0)

const visibleContributors = computed(() => props.contributors.slice(0, props.maxVisible))

const hiddenCount = computed(() => Math.max(0, props.contributors.length - props.maxVisible))

const topContributor = computed(() =>
  props.contributors.length > 0 ? props.contributors[0] : null
)

const getContributionText = (count: number): string => {
  if (count === 1) return '1 contribution'
  return `${count.toLocaleString()} contributions`
}

const getTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'bot':
      return 'bi-robot'
    case 'organization':
      return 'bi-building'
    default:
      return 'bi-person'
  }
}

const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'bot':
      return 'text-info'
    case 'organization':
      return 'text-warning'
    default:
      return 'text-primary'
  }
}
</script>

<template>
  <div class="contributor-list">
    <!-- No Contributors State -->
    <div v-if="!hasContributors" class="text-center py-5">
      <i class="bi bi-people display-4 text-muted mb-3"></i>
      <h4 class="text-muted">No contributors found</h4>
      <p class="text-muted">Contributor information is not available for this repository.</p>
    </div>

    <!-- Contributors Grid -->
    <div v-else>
      <!-- Top Contributor Highlight -->
      <div v-if="topContributor" class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">
            <i class="bi bi-trophy text-warning me-2"></i>
            Top Contributor
          </h5>
          <div class="d-flex align-items-center">
            <img
              :src="topContributor.avatar_url"
              :alt="topContributor.login"
              class="rounded-circle me-3"
              width="64"
              height="64"
            />
            <div class="flex-grow-1">
              <h6 class="mb-1">
                <a :href="topContributor.html_url" target="_blank" class="text-decoration-none">
                  {{ topContributor.login }}
                  <i class="bi bi-box-arrow-up-right ms-1 small"></i>
                </a>
              </h6>
              <p class="text-muted mb-1">
                {{ getContributionText(topContributor.contributions) }}
              </p>
              <span class="badge bg-light text-dark">
                <i :class="getTypeIcon(topContributor.type)" class="me-1"></i>
                {{ topContributor.type }}
              </span>
            </div>
            <div class="text-end">
              <div class="display-6 text-primary fw-bold">
                {{ topContributor.contributions }}
              </div>
              <small class="text-muted">contributions</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Contributors Grid -->
      <div class="row">
        <div
          v-for="contributor in visibleContributors"
          :key="contributor.id"
          class="col-lg-4 col-md-6 col-12 mb-3"
        >
          <div class="card h-100 contributor-card">
            <div class="card-body text-center">
              <img
                :src="contributor.avatar_url"
                :alt="contributor.login"
                class="rounded-circle mb-3"
                width="48"
                height="48"
              />
              <h6 class="card-title mb-2">
                <a :href="contributor.html_url" target="_blank" class="text-decoration-none">
                  {{ contributor.login }}
                </a>
              </h6>
              <p class="card-text text-muted small mb-2">
                {{ getContributionText(contributor.contributions) }}
              </p>
              <span class="badge bg-light text-dark">
                <i
                  :class="`${getTypeIcon(contributor.type)} ${getTypeColor(contributor.type)}`"
                  class="me-1"
                ></i>
                {{ contributor.type }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Show More Button -->
      <div v-if="hiddenCount > 0" class="text-center mt-4">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          Showing {{ visibleContributors.length }} of {{ contributors.length }} contributors.
          <strong>{{ hiddenCount }}</strong> more contributors not shown.
        </div>
      </div>

      <!-- Contributors Summary -->
      <div class="row mt-4">
        <div class="col-md-4 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-primary">{{ contributors.length }}</h3>
              <p class="text-muted mb-0">Total Contributors</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-success">
                {{ contributors.reduce((sum, c) => sum + c.contributions, 0).toLocaleString() }}
              </h3>
              <p class="text-muted mb-0">Total Contributions</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-info">
                {{
                  Math.round(
                    contributors.reduce((sum, c) => sum + c.contributions, 0) / contributors.length
                  )
                }}
              </h3>
              <p class="text-muted mb-0">Avg. per Contributor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contributor-list {
  min-height: 300px;
}

.contributor-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.contributor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.contributor-card img {
  transition: transform 0.2s;
}

.contributor-card:hover img {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .contributor-card .card-body {
    padding: 1rem 0.75rem;
  }

  .contributor-card img {
    width: 40px;
    height: 40px;
  }
}
</style>
