import api from './axios'

export const getDoctorsApi = async (params?: {
  page?: number
  limit?: number
  search?: string
  department?: string
}) => {
  const res = await api.get('/api/doctors', { params })
  return res.data
}

export const getDoctorByIdApi = async (id: string) => {
  const res = await api.get(`/api/doctors/${id}`)
  return res.data
}

export const createDoctorApi = async (data: any) => {
  const res = await api.post('/api/doctors', data)
  return res.data
}

export const updateDoctorApi = async (id: string, data: any) => {
  const res = await api.put(`/api/doctors/${id}`, data)
  return res.data
}

export const deleteDoctorApi = async (id: string) => {
  const res = await api.delete(`/api/doctors/${id}`)
  return res.data
}

export const getDepartmentsApi = async () => {
  const res = await api.get('/api/doctors/departments')
  return res.data
}

export const getDoctorSlotsApi = async (id: string, date: string) => {
  const res = await api.get(`/api/doctors/${id}/slots`, { params: { date } })
  return res.data
}