import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HardDrive, Download, Trash2, Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Topbar from '../components/layout/Topbar'
import { listBackupsApi, createBackupApi, deleteBackupApi } from '../api/backup.api'

interface Backup {
  filename: string
  size: number
  createdAt: string
}

const formatSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const BackupPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: listBackupsApi,
  })

  const createMutation = useMutation({
    mutationFn: createBackupApi,
    onSuccess: () => {
      toast.success('Backup created successfully')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Backup failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => deleteBackupApi(filename),
    onSuccess: () => {
      toast.success('Backup deleted')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Delete failed')
    },
  })

  const handleDownload = async (filename: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string
      const response = await fetch(
        baseUrl + '/api/backup/' + filename + '/download',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )
      if (!response.ok) {
        toast.error('Download failed')
        return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (err) {
      toast.error('Download failed')
    }
  }

  const handleCreate = (): void => {
    createMutation.mutate()
  }

  const handleDelete = (filename: string): void => {
    if (window.confirm('Delete backup ' + filename + '?')) {
      deleteMutation.mutate(filename)
    }
  }

  const backups: Backup[] = Array.isArray(data?.data?.backups)
    ? (data.data.backups as Backup[])
    : []

  const isCreating: boolean = createMutation.status === 'pending'

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Backup" />
      <div className="flex-1 p-6 overflow-y-auto">

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <HardDrive size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Database Backups</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {backups.length} backup{backups.length !== 1 ? 's' : ''} stored
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={15} className="animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus size={15} />
                Create Backup
              </span>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

          {isLoading && (
            <div className="p-6 space-y-3">
              <div className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            </div>
          )}

          {!isLoading && backups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <HardDrive size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No backups yet</p>
              <p className="text-xs mt-1">Click Create Backup to get started</p>
            </div>
          )}

          {!isLoading && backups.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Filename</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Size</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Created</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup: Backup) => (
                  <tr
                    key={backup.filename}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <HardDrive size={14} className="text-gray-300 flex-shrink-0" />
                        <span className="font-mono text-xs text-gray-700 break-all">
                          {backup.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {formatSize(backup.size)}
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {backup.createdAt
                        ? format(new Date(backup.createdAt), 'dd MMM yyyy, HH:mm')
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(backup.filename)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.filename)}
                          disabled={deleteMutation.status === 'pending'}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Download backups and store them off-site for production use.
        </p>

      </div>
    </div>
  )
}

export default BackupPage