import { defineStore } from 'pinia'
import { state } from './comparison.state'
import { getters } from './comparison.getters'
import { actions } from './comparison.actions'

export const useComparisonStore = defineStore('comparison', {
  state: () => ({ ...state }),
  getters,
  actions
})