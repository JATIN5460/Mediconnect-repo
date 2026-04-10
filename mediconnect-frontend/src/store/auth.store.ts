import { create } from 'zustand'
import { Admin } from '../types/auth.types'

interface AuthState {
  token: string | null
  user: Admin | null
  isAuthenticated: boolean
  login: (token: string, user: Admin) => void
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user:  null,
  isAuthenticated: false,

  login: (token, user) => {
    localStorage.setItem('accessToken', token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    set({ token: null, user: null, isAuthenticated: false })
  },

  setToken: (token) => {
    localStorage.setItem('accessToken', token)
    set({ token })
  },
}))

// Role helper
export const isSuperAdmin = (user: Admin | null) => user?.role === 'super_admin'
export const isClinicOwner = (user: Admin | null) => user?.role === 'clinic_owner'
export const isAdmin = (user: Admin | null) =>
  ['super_admin', 'clinic_owner', 'admin'].includes(user?.role || '')
export const isViewer = (user: Admin | null) => user?.role === 'viewer'
