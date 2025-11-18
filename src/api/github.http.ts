import axios from 'axios'
import { config } from '../utils/index'

export const githubHttp = axios.create({
  baseURL: config.githubApiBaseUrl || 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: config.githubToken ? `token ${config.githubToken}` : undefined
  },
  timeout: 15000
})
