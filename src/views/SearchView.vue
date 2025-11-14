<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search-result', query: { q: searchQuery.value } })
  }
}
</script>

<template>
  <div class="search-view bg-dark text-light min-vh-100 d-flex flex-column">
    <!-- Header -->
    <header class="py-3 px-4 border-bottom border-secondary">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">GitHub Explorer</h5>
        <nav>
          <a href="#" class="text-light me-4">Home</a>
          <a href="#" class="text-light">Favorites</a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <h1 class="display-4 fw-bold mb-3 text-center">Explore GitHub Repositories</h1>
      <p class="lead text-center mb-4">
        Discover, compare, and analyze millions of open-source projects
      </p>
      <div class="search-box w-100" style="max-width: 500px;">
        <div class="input-group">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control form-control-lg"
            placeholder="Search repositories... (e.g., react, vue, typescript)"
            @keyup.enter="handleSearch"
            autofocus
          />
          <button class="btn btn-primary btn-lg" @click="handleSearch">Search</button>
        </div>
      </div>
      <!-- Stats Row -->
      <div class="row text-center mt-5 w-100" style="max-width: 600px;">
        <div class="col">
          <div class="fw-bold fs-4">100M+</div>
          <div class="fs-6">Repositories</div>
        </div>
        <div class="col">
          <div class="fw-bold fs-4">100M+</div>
          <div class="fs-6">Developers</div>
        </div>
        <div class="col">
          <div class="fw-bold fs-4">500+</div>
          <div class="fs-6">Languages</div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-3 px-4 border-top border-secondary mt-auto">
      <div class="d-flex justify-content-between align-items-center">
        <span>GitHub Explorer<br /><small class="text-muted">Explore and discover amazing open-source projects</small></span>
        <span class="small">
          Built with Vue.js & GitHub API<br />
          © 2025 GitHub Repository Explorer
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.search-view {
  background: #f5f7fa;
}
.search-box .form-control {
  border-radius: 0.5rem 0 0 0.5rem;
  font-size: 1.15rem;
}
.search-box .btn {
  border-radius: 0 0.5rem 0.5rem 0;
  font-size: 1.15rem;
}
.display-4 {
  color: #fff;
}
.lead {
  color: #b0b8c1;
}
footer {
  background: #181c23;
}
</style>