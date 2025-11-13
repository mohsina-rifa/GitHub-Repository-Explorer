<script setup lang="ts">
interface Props {
  icon: string
  value: string | number
  label: string
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
}

withDefaults(defineProps<Props>(), {
  color: 'primary'
})
</script>

<template>
  <div class="card h-100 text-center">
    <div class="card-body">
      <div class="mb-2">
        <i :class="`${icon} text-${color}`" style="font-size: 2rem"></i>
      </div>
      <h3 class="card-title h4 mb-1">{{ value }}</h3>
      <p class="card-text text-muted small mb-0">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
