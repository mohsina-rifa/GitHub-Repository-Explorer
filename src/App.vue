<script setup lang="ts">
import { ref } from 'vue'
import Navbar from "./components/common/Navbar.vue"
import Footer from './components/common/Footer.vue'
import { useObserver } from './composables/useObserver'

type RateLimitPayload = { remaining: number; resetAt?: number }

const remaining = ref<number | null>(null)
const resetAt = ref<number | null>(null)

useObserver<RateLimitPayload>('rateLimit:update', (data) => {
  try {
    remaining.value = data.remaining
    resetAt.value = data.resetAt ?? null
  } catch (e) {
    console.error('Error handling rateLimit:update event', e)
  }
})
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Footer />
  </div>
</template>

<style scoped>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
