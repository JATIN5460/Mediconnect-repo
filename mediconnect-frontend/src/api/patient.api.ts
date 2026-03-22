import api from './axios'

export const getPatientsApi = async (params?: {
  page?: number
  limit?: number
  search?: string
}) => {
  const res = await api.get('/api/patients', { params })
  return res.data
}

export const getPatientByIdApi = async (id: string) => {
  const res = await api.get(`/api/patients/${id}`)
  return res.data
}

export const createPatientApi = async (data: any) => {
  const res = await api.post('/api/patients', data)
  return res.data
}

export const updatePatientApi = async (id: string, data: any) => {
  const res = await api.put(`/api/patients/${id}`, data)
  return res.data
}

export const deletePatientApi = async (id: string) => {
  const res = await api.delete(`/api/patients/${id}`)
  return res.data
}

export const getPatientHistoryApi = async (id: string) => {
  const res = await api.get(`/api/patients/${id}/appointments`)
  return res.data
}