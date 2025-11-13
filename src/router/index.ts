import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: '/search',
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('../views/SearchView.vue'),
    },
    {
      path: '/repository/:owner/:repo',
      name: 'RepositoryDetail',
      component: () => import('../views/RepositoryDetailView.vue'),
    }
  ]
})

export default router