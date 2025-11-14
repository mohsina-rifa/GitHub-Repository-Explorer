import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { RouteValidator } from './guard'

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
      meta: {
        title: 'GitHub Repository Search',
        description: 'Search and explore GitHub repositories'
      },
    },
    {
      path: '/search-result/:query',
      name: 'SearchResult',
      component: () => import('../views/SearchResult.vue'),
    },
    {
      path: '/repository/:owner/:repo',
      name: 'RepositoryDetail',
      component: () => import('../views/RepositoryDetailView.vue'),
      beforeEnter: RouteValidator.validateRepositoryRoute,
      props: (route) => ({
        owner: route.params.owner as string,
        repo: route.params.repo as string
      }),
      meta: {
        title: (route: RouteLocationNormalized) => `${route.params.owner}/${route.params.repo} - Repository Details`,
        description: 'Detailed repository information, README, and contributors'
      }
    },
    {
      path: '/comparison',
      name: 'Comparison',
      component: () => import('../views/ComparisonView.vue'),
      beforeEnter: RouteValidator.validateComparisonRoute,
      meta: {
        title: 'Repository Comparison',
        description: 'Compare multiple repositories side by side'
      }
    },
    {
      path: '/error',
      name: 'error',
      component: () => import('../views/ErrorView.vue'),
      props: (route) => ({
        error: route.query.error,
        message: route.query.message,
        statusCode: route.query.statusCode
      }),
      meta: {
        title: 'Error',
        description: 'An error occurred'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: (to) => ({
        name: 'error',
        query: {
          error: 'not-found',
          message: `Page not found: ${to.path}`,
          statusCode: '404'
        }
      })
    },
  ]
})

export default router