import api from './axios'

export const getAppointmentsApi = async (params?: {
  page?: number
  limit?: number
  status?: string
  date?: string
  doctorId?: string
}) => {
  const res = await api.get('/api/appointments', { params })
  return res.data
}

export const getTodayAppointmentsApi = async () => {
  const res = await api.get('/api/appointments/today')
  return res.data
}

export const getAppointmentByIdApi = async (id: string) => {
  const res = await api.get(`/api/appointments/${id}`)
  return res.data
}

export const createAppointmentApi = async (data: any) => {
  const res = await api.post('/api/appointments', data)
  return res.data
}

export const updateAppointmentStatusApi = async (id: string, status: string, reason?: string) => {
  const res = await api.patch(`/api/appointments/${id}/status`, { status, reason })
  return res.data
}

export const cancelAppointmentApi = async (id: string, reason: string) => {
  const res = await api.patch(`/api/appointments/${id}/cancel`, { reason })
  return res.data
}

export const savePrescriptionApi = async (id: string, data: any) => {
  const res = await api.post(`/api/appointments/${id}/prescription`, data)
  return res.data
}