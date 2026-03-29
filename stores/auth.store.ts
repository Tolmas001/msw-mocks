import { defineStore } from 'pinia'

export interface UserInfo {
  id: number
  email: string
  role: 'admin' | 'user'
  name: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)

  // Decode token payload (base64 JSON)
  function decodeToken(t: string): { id: number; email: string; role: 'admin' | 'user' } | null {
    try {
      return JSON.parse(atob(t))
    } catch {
      return null
    }
  }

  // Initialize from localStorage on app start
  function initFromStorage() {
    if (process.client) {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (storedToken && storedUser) {
        token.value = storedToken
        try {
          user.value = JSON.parse(storedUser)
        } catch {
          logout()
        }
      }
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message || 'Ошибка входа')
    }

    const data = await res.json() as { token: string; user: UserInfo }
    token.value = data.token
    user.value = data.user

    if (process.client) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message || 'Ошибка регистрации')
    }

    const data = await res.json() as { token: string; user: UserInfo }
    token.value = data.token
    user.value = data.user

    if (process.client) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
  }

  function logout() {
    token.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLoggedIn = computed(() => !!token.value)

  return { user, token, login, register, logout, initFromStorage, isAdmin, isLoggedIn }
})
