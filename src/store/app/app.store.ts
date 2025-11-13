import { defineStore } from 'pinia'
import { state } from './app.state'
import { getters } from './app.getters'
import { actions } from './app.actions'

export const useAppStore = defineStore('app', {
  state: () => ({ ...state }),
  getters,
  actions
})
