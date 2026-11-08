import { computed, ref } from 'vue'
import { authApi } from '../api/auth'
import { setAccessToken, setUnauthorizedHandler } from '../api/http'
import type { AuthResponse, PrivateUser, UserRole } from '../api/types'

const TOKEN_KEY = 'tm-token'

export const currentUser = ref<PrivateUser | null>(null)
export const isAuthenticated = computed(() => currentUser.value !== null)
export const isPhotographer = computed(() => currentUser.value?.role === 'PHOTOGRAPHER')

let restoring: Promise<void> | null = null

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function persist(token: string | null) {
  setAccessToken(token)
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage may be unavailable (private mode); the session then lasts only for this tab.
  }
}

function start(response: AuthResponse) {
  persist(response.accessToken)
  currentUser.value = response.user
}

export function restoreSession(): Promise<void> {
  restoring ??= (async () => {
    const token = readToken()
    if (!token) return
    setAccessToken(token)
    try {
      currentUser.value = await authApi.me()
    } catch {
      logout()
    }
  })()
  return restoring
}

export async function login(email: string, password: string) {
  start(await authApi.login({ email, password }))
}

export async function register(input: { name: string; email: string; password: string; role: UserRole }) {
  start(await authApi.register(input))
}

export function logout() {
  persist(null)
  currentUser.value = null
}

export function updateCurrentUser(user: PrivateUser) {
  currentUser.value = user
}

setUnauthorizedHandler(() => {
  logout()
  if (window.location.pathname !== '/entrar') window.location.assign('/entrar')
})
