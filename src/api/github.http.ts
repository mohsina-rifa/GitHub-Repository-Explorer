import axios from 'axios'

export const githubHttp = axios.create({
  baseURL: import.meta.env.VITE_GITHUB_API_BASE_URL || 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: import.meta.env.VITE_GITHUB_TOKEN
      ? `token ${import.meta.env.VITE_GITHUB_TOKEN}`
      : undefined
  },
  timeout: 15000
})
