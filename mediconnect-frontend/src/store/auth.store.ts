import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Admin } from '../types/auth.types'

interface AuthState {
  token: string | null
  user: Admin | null
  isAuthenticated: boolean
  login: (token: string, user: Admin) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('accessToken', token)
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage' }
  )
)