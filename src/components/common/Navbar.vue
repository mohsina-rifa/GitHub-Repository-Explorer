<script setup></script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-github"></i> GitHub Explorer
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Navigation */
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #281e5d !important;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 600;
}

.navbar-brand i {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}
</style>
