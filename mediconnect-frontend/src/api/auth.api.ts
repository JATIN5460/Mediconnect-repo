import api from './axios'
import { LoginCredentials } from '../types/auth.types'

export const loginApi = async (credentials: LoginCredentials) => {
  const res = await api.post('/api/auth/login', credentials)
  return res.data
}

export const logoutApi = async () => {
  const res = await api.post('/api/auth/logout')
  return res.data
}

export const getMeApi = async () => {
  const res = await api.get('/api/auth/me')
  return res.data
}