import api from './axios'

export const getDashboardStatsApi = async () => {
  const res = await api.get('/api/analytics/dashboard')
  return res.data
}

export const getMonthlyTrendApi = async (year: number, month: number) => {
  const res = await api.get('/api/analytics/trend/monthly', { params: { year, month } })
  return res.data
}

export const getTopDoctorsApi = async (limit = 5) => {
  const res = await api.get('/api/analytics/top-doctors', { params: { limit } })
  return res.data
}

export const getStatusBreakdownApi = async () => {
  const res = await api.get('/api/analytics/status-breakdown')
  return res.data
}