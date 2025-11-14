<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  text: string
  color?: string
  variant?: 'language' | 'topic' | 'license' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Vue: '#4FC08D'
  }
  return colors[language] || '#6c757d'
}

const badgeClass = computed(() => {
  switch (props.variant) {
    case 'language':
      return 'badge-language'
    case 'topic':
      return 'badge bg-light text-dark'
    case 'license':
      return 'badge bg-info'
    default:
      return 'badge bg-secondary'
  }
})

const badgeStyle = computed(() => {
  if (props.variant === 'language' && props.text) {
    return {
      backgroundColor: props.color || getLanguageColor(props.text),
      color: '#fff'
    }
  }
  return {}
})
</script>

<template>
  <span :class="badgeClass" :style="badgeStyle" class="badge">
    <span
      v-if="variant === 'language'"
      class="language-dot me-1"
      :style="{ backgroundColor: badgeStyle.backgroundColor }"
    ></span>
    {{ text }}
  </span>
</template>

<style scoped>
.badge-language {
  background-color: var(--bs-light);
  color: var(--bs-dark);
  border: 1px solid var(--bs-border-color);
}

.language-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
</style>
