import api from './axios'

export const getSettingsApi = async () => {
  const res = await api.get('/api/settings')
  return res.data
}

export const updateSettingsApi = async (data: any) => {
  const res = await api.put('/api/settings', data)
  return res.data
}