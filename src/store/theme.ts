import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

function initial(): Theme {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem('tm-theme') === 'dark' ? 'dark' : 'light'
}

export const theme = ref<Theme>(initial())

watchEffect(() => {
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
  localStorage.setItem('tm-theme', theme.value)
})

export function setTheme(next: Theme) {
  theme.value = next
}
