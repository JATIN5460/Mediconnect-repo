export interface Admin {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'viewer'
  isActive: boolean
  lastLogin: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    admin: Admin
    accessToken: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}