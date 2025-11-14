import { defineStore } from 'pinia'
import { state } from './search.state'
import { getters } from './search.getters'
import { actions } from './search.actions'

export const useSearchStore = defineStore('search', {
  state: () => ({ ...state }),
  getters,
  actions
})
