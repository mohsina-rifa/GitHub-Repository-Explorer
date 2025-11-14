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
      <!-- <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link active" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Favorites</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">
              <i class="bi bi-moon-stars"></i>
            </a>
          </li>
        </ul>
      </div> -->
    </div>
  </nav>
</template>

<style scoped>
/* Navigation */
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
