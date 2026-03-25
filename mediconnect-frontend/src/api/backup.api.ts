import api from './axios'

export const listBackupsApi = async () => {
  const res = await api.get('/api/backup')
  return res.data
}

export const createBackupApi = async () => {
  const res = await api.post('/api/backup')
  return res.data
}

export const deleteBackupApi = async (filename: string) => {
  const res = await api.delete(`/api/backup/${filename}`)
  return res.data
}

export const downloadBackupUrl = (filename: string) =>
  `${import.meta.env.VITE_API_BASE_URL}/api/backup/${filename}/download`