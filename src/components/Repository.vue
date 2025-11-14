<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Repository } from '../types/auth'

interface Props {
  repository: Repository
  isSelected?: boolean
}

const props = defineProps<Props>()
const router = useRouter()

const emit = defineEmits<{
  'toggle-select': [id: number]
  'toggle-favorite': [id: number]
}>()

// Navigate to repository detail page
const goToDetail = () => {
  router.push({
    name: 'RepositoryDetail',
    params: {
      owner: props.repository.owner.login,
      repo: props.repository.name
    }
  })
}

// Handle checkbox click (prevent navigation)
const handleCheckboxClick = (event: Event) => {
  event.stopPropagation()
  emit('toggle-select', props.repository.id)
}

// Handle favorite click (prevent navigation)
const handleFavoriteClick = (event: Event) => {
  event.stopPropagation()
  emit('toggle-favorite', props.repository.id)
}

// Format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit)
    if (interval >= 1) {
      return `Updated ${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'Updated just now'
}

// Format number with commas
const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>

<template>
  <div class="repo-item" @click="goToDetail">
    <div class="form-check repo-checkbox" @click.stop>
      <input
        :id="`repo-${repository.id}`"
        class="form-check-input"
        type="checkbox"
        :checked="isSelected"
        @change="handleCheckboxClick"
      />
    </div>
    <div class="repo-content">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h5 class="repo-title">
            <span class="repo-title-text">{{ repository.full_name }}</span>
          </h5>
          <p class="repo-description">
            {{ repository.description || 'No description available' }}
          </p>
        </div>
        <button
          class="btn btn-sm btn-outline-warning ms-3 favorite-btn"
          @click="handleFavoriteClick"
        >
          <i class="bi bi-star"></i>
        </button>
      </div>
      <div class="repo-meta">
        <span v-if="repository.language" class="badge bg-primary">
          {{ repository.language }}
        </span>
        <span class="meta-item">
          <i class="bi bi-star-fill text-warning"></i>
          {{ formatNumber(repository.stargazers_count) }}
        </span>
        <span class="meta-item">
          <i class="bi bi-diagram-3-fill"></i> {{ formatNumber(repository.forks_count) }}
        </span>
        <span class="meta-item">
          <i class="bi bi-exclamation-circle"></i>
          {{ formatNumber(repository.open_issues_count) }} issues
        </span>
        <span class="meta-item">
          <i class="bi bi-calendar"></i> {{ formatTimeAgo(repository.updated_at) }}
        </span>
        <span v-if="repository.license" class="meta-item">
          <i class="bi bi-file-text"></i> {{ repository.license.name }}
        </span>
      </div>
      <div v-if="repository.topics && repository.topics.length > 0" class="repo-topics mt-2">
        <span v-for="topic in repository.topics" :key="topic" class="topic-badge">
          {{ topic }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repo-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer; /* Makes it clear the card is clickable */
}

.repo-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: var(--bs-primary);
}

.repo-checkbox {
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.repo-checkbox .form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.repo-content {
  flex: 1;
}

.repo-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.repo-title-text {
  color: var(--bs-primary);
  font-weight: 600;
  transition: color 0.2s;
}

.repo-item:hover .repo-title-text {
  color: #0a58ca;
  text-decoration: underline;
}

.repo-description {
  color: var(--bs-secondary);
  line-height: 1.6;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.repo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
}

.repo-meta .badge {
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
}

.repo-meta .meta-item {
  color: var(--bs-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.repo-meta .meta-item i {
  font-size: 0.9rem;
}

.repo-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-badge {
  background-color: #e7f3ff;
  color: #0969da;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-badge:hover {
  background-color: #0969da;
  color: white;
}

/* Favorite button should not be affected by card hover */
.favorite-btn {
  flex-shrink: 0;
  z-index: 1;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .repo-item {
    padding: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .repo-checkbox {
    order: -1;
  }

  .repo-title {
    font-size: 1.1rem;
  }

  .repo-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  .repo-title {
    font-size: 1rem;
  }

  .repo-description {
    font-size: 0.875rem;
  }
}
</style>