import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useRouterStore = defineStore('router', () => {
  const isCollapse = ref(true)
  return { isCollapse }
})
