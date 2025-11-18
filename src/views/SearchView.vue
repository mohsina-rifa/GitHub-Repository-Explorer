<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Sanitizer } from '../utils/sanitizer'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')

const DEBOUNCE_DELAY = 300
let navTimeout = null

// Convert string to kebab-case
const toKebabCase = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const debouncedNavigate = (rawQuery) => {
  const clean = Sanitizer.sanitizeSearchQuery(rawQuery)
  const kebabQuery = toKebabCase(clean)
  
  if (!kebabQuery) return
  if (route.params.query === kebabQuery) return

  if (navTimeout) clearTimeout(navTimeout)

  navTimeout = setTimeout(() => {
    if (route.params.query !== kebabQuery) {
      router.push({ name: 'SearchResult', params: { query: kebabQuery } })
    }
    navTimeout = null
  }, DEBOUNCE_DELAY)
}

onUnmounted(() => {
  if (navTimeout) {
    clearTimeout(navTimeout)
    navTimeout = null
  }
})

// Handle search submission (debounced navigation)
const handleSearch = () => {
  const q = Sanitizer.sanitizeSearchQuery(searchQuery.value)
  if (!q) return

  debouncedNavigate(q)
}
</script>

<template>
  <!-- Hero Section with Search -->
  <section class="hero-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8 text-center">
          <h1 class="display-4 fw-bold mb-3">Explore GitHub Repositories</h1>
          <p class="lead mb-4">Discover, compare, and analyze millions of open-source projects</p>

          <!-- Search Bar -->
          <div class="search-container">
            <form @submit.prevent="handleSearch">
              <div class="input-group input-group-lg shadow-lg">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Search repositories... (e.g., react, vue, typescript)"
                  aria-label="Search repositories"
                />
                <button class="btn btn-primary px-4" type="submit">Search</button>
              </div>
            </form>
          </div>

          <!-- Quick Stats -->
          <div class="row mt-5 quick-stats">
            <div class="col-md-4 mb-3">
              <div class="stat-card">
                <i class="bi bi-database-fill"></i>
                <h3>100M+</h3>
                <p>Repositories</p>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="stat-card">
                <i class="bi bi-people-fill"></i>
                <h3>100M+</h3>
                <p>Developers</p>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="stat-card">
                <i class="bi bi-code-slash"></i>
                <h3>500+</h3>
                <p>Languages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Global Styles */
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --success-color: #198754;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
  --dark-color: #212529;
  --light-color: #f8f9fa;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
}

.hero-section h1 {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-section .lead {
  opacity: 0.95;
}

/* Search Container */
.search-container {
  max-width: 700px;
  margin: 0 auto;
}

.search-container .input-group {
  border-radius: 50px;
  overflow: hidden;
  background: white;
}

.search-container .input-group-text {
  border: none;
  padding-left: 1.5rem;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.search-container input {
  border: none;
  font-size: 1.1rem;
}

.search-container input:focus {
  box-shadow: none;
  outline: none;
}

.search-container .btn-primary {
  border-radius: 0 50px 50px 0;
  padding: 0.75rem 2rem;
  font-weight: 500;
}

.search-hints {
  text-align: center;
}

.search-hints .badge {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-hints .badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Quick Stats */
.quick-stats {
  margin-top: 3rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-card i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.stat-card p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 0;
  }

  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }

  .search-container .input-group {
    border-radius: 12px;
  }

  .search-container .btn-primary {
    border-radius: 0 12px 12px 0;
    padding: 0.75rem 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .stat-card h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .quick-stats {
    margin-top: 2rem;
  }

  .search-container .input-group {
    flex-direction: column;
    border-radius: 12px;
  }

  .search-container .input-group-text,
  .search-container input,
  .search-container .btn-primary {
    border-radius: 0 !important;
  }

  .search-container .input-group-text {
    border-radius: 12px 12px 0 0 !important;
  }

  .search-container .btn-primary {
    border-radius: 0 0 12px 12px !important;
    width: 100%;
  }
}

/* Loading and Animation States */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

/* Utility Classes */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
