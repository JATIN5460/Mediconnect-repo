import api from './axios'

export const getAuditLogsApi = async (params?: {
  page?: number
  limit?: number
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
}) => {
  const res = await api.get('/api/audit', { params })
  return res.data
}

export const clearAuditLogsApi = async (days: number) => {
  const res = await api.delete(`/api/audit?days=${days}`)
  return res.data
}