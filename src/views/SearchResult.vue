<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Repository from '../components/Repository.vue'
import Pagination from '../components/Pagination.vue'
import type { Repository as RepositoryType } from '../types/auth'

const route = useRoute()

// Get query from route params and convert kebab-case back to normal
const searchQuery = computed(() => {
  const query = route.params.query as string
  return query.replace(/-/g, ' ')
})

// Dummy data (6 repositories)
const repositories = ref<RepositoryType[]>([
  {
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4'
    },
    description:
      'The library for web and native user interfaces. React lets you build user interfaces out of individual pieces called components.',
    language: 'JavaScript',
    stargazers_count: 223456,
    forks_count: 45678,
    open_issues_count: 890,
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    license: { name: 'MIT License' },
    topics: ['react', 'javascript', 'ui', 'frontend'],
    html_url: 'https://github.com/facebook/react'
  },
  {
    id: 2,
    name: 'vue',
    full_name: 'vuejs/vue',
    owner: {
      login: 'vuejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4'
    },
    description:
      '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
    language: 'TypeScript',
    stargazers_count: 207000,
    forks_count: 33700,
    open_issues_count: 356,
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    license: { name: 'MIT License' },
    topics: ['vue', 'typescript', 'framework', 'frontend'],
    html_url: 'https://github.com/vuejs/vue'
  },
  {
    id: 3,
    name: 'angular',
    full_name: 'angular/angular',
    owner: {
      login: 'angular',
      avatar_url: 'https://avatars.githubusercontent.com/u/139426?v=4'
    },
    description: "The modern web developer's platform",
    language: 'TypeScript',
    stargazers_count: 95800,
    forks_count: 25300,
    open_issues_count: 1234,
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    license: { name: 'MIT License' },
    topics: ['angular', 'typescript', 'framework'],
    html_url: 'https://github.com/angular/angular'
  },
  {
    id: 4,
    name: 'svelte',
    full_name: 'sveltejs/svelte',
    owner: {
      login: 'sveltejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/23617963?v=4'
    },
    description: 'Cybernetically enhanced web apps',
    language: 'JavaScript',
    stargazers_count: 76500,
    forks_count: 4020,
    open_issues_count: 567,
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    license: { name: 'MIT License' },
    topics: ['svelte', 'compiler', 'framework'],
    html_url: 'https://github.com/sveltejs/svelte'
  },
  {
    id: 5,
    name: 'next.js',
    full_name: 'vercel/next.js',
    owner: {
      login: 'vercel',
      avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4'
    },
    description: 'The React Framework for the Web',
    language: 'JavaScript',
    stargazers_count: 120000,
    forks_count: 25800,
    open_issues_count: 2345,
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    license: { name: 'MIT License' },
    topics: ['react', 'nextjs', 'ssr', 'framework'],
    html_url: 'https://github.com/vercel/next.js'
  },
  {
    id: 6,
    name: 'nuxt',
    full_name: 'nuxt/nuxt',
    owner: {
      login: 'nuxt',
      avatar_url: 'https://avatars.githubusercontent.com/u/23360933?v=4'
    },
    description: 'The Intuitive Vue Framework',
    language: 'TypeScript',
    stargazers_count: 51000,
    forks_count: 4680,
    open_issues_count: 123,
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    license: { name: 'MIT License' },
    topics: ['vue', 'nuxt', 'ssr', 'framework'],
    html_url: 'https://github.com/nuxt/nuxt'
  }
])

// Selected repositories for comparison
const selectedRepos = ref<Set<number>>(new Set())

// Pagination
const currentPage = ref(1)
const itemsPerPage = 30
const totalItems = ref(1234)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// Sort option
const sortOption = ref('best-match')

// View mode
const viewMode = ref<'list' | 'grid'>('list')

// Toggle repository selection
const toggleSelection = (id: number) => {
  if (selectedRepos.value.has(id)) {
    selectedRepos.value.delete(id)
  } else {
    selectedRepos.value.add(id)
  }
}

// Toggle favorite
const toggleFavorite = (id: number) => {
  console.log('Toggle favorite:', id)
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle sort change
const handleSortChange = (option: string) => {
  sortOption.value = option
}

// Handle view mode change
const setViewMode = (mode: 'list' | 'grid') => {
  viewMode.value = mode
}
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Main Content -->
      <main class="col-12 main-content">
        <!-- Results Header -->
        <div class="results-header">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="results-info">
              <h4 class="mb-1">
                <strong>{{ totalItems.toLocaleString() }}</strong> repositories found for
                <span class="text-primary">"{{ searchQuery }}"</span>
              </h4>
              <p class="text-muted mb-0">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                  Math.min(currentPage * itemsPerPage, totalItems)
                }}
                of {{ totalItems.toLocaleString() }} results
              </p>
            </div>

            <div class="results-controls d-flex gap-2 align-items-center">
              <!-- Sort Dropdown -->
              <div class="dropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-sort-down"></i> Sort:
                  {{ sortOption === 'best-match' ? 'Best match' : sortOption }}
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortOption === 'best-match' }"
                      href="#"
                      @click.prevent="handleSortChange('best-match')"
                    >
                      Best match
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortOption === 'stars' }"
                      href="#"
                      @click.prevent="handleSortChange('stars')"
                    >
                      Most stars
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortOption === 'forks' }"
                      href="#"
                      @click.prevent="handleSortChange('forks')"
                    >
                      Most forks
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      :class="{ active: sortOption === 'updated' }"
                      href="#"
                      @click.prevent="handleSortChange('updated')"
                    >
                      Recently updated
                    </a>
                  </li>
                </ul>
              </div>

              <!-- View Toggle -->
              <div class="btn-group" role="group">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'list' }"
                  title="List view"
                  @click="setViewMode('list')"
                >
                  <i class="bi bi-list-ul"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'grid' }"
                  title="Grid view"
                  @click="setViewMode('grid')"
                >
                  <i class="bi bi-grid-3x3"></i>
                </button>
              </div>

              <!-- Compare Button -->
              <button class="btn btn-primary" :disabled="selectedRepos.size === 0">
                <i class="bi bi-arrow-left-right"></i> Compare ({{ selectedRepos.size }})
              </button>
            </div>
          </div>
        </div>

        <!-- Repository List -->
        <div class="repository-list">
          <Repository
            v-for="repo in repositories"
            :key="repo.id"
            :repository="repo"
            :is-selected="selectedRepos.has(repo.id)"
            @toggle-select="toggleSelection"
            @toggle-favorite="toggleFavorite"
          />
        </div>

        <!-- Pagination -->
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          @page-change="handlePageChange"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
}

.results-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-info h4 {
  font-size: 1.25rem;
  color: #212529;
}

.results-info strong {
  color: var(--bs-primary);
}

.results-controls {
  flex-wrap: wrap;
}

.results-controls .btn {
  font-size: 0.9rem;
}

.results-controls .dropdown-menu {
  font-size: 0.9rem;
}

.repository-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 991px) {
  .main-content {
    padding: 1rem;
  }

  .results-header {
    padding: 1rem;
  }

  .results-controls {
    width: 100%;
    margin-top: 1rem;
  }

  .results-controls > * {
    flex: 1;
  }
}

@media (max-width: 576px) {
  .results-controls {
    flex-direction: column;
    align-items: stretch !important;
  }

  .results-controls .dropdown,
  .results-controls .btn-group,
  .results-controls .btn {
    width: 100%;
  }

  .results-controls .btn-group .btn {
    width: 50%;
  }
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}
</style>
