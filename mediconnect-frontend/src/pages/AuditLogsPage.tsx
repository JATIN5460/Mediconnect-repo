import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import { getAuditLogsApi, clearAuditLogsApi } from '../api/audit.api'

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-50 text-green-600',
  UPDATE: 'bg-blue-50 text-blue-600',
  DELETE: 'bg-red-50 text-red-500',
  LOGIN:  'bg-purple-50 text-purple-600',
  CANCEL: 'bg-amber-50 text-amber-600',
}

const getActionColor = (action: string) => {
  const key = Object.keys(actionColors).find(k => action.startsWith(k))
  return key ? actionColors[key] : 'bg-gray-100 text-gray-500'
}

const AuditLogsPage = () => {
  const queryClient = useQueryClient()
  const [page, setPage]       = useState(1)
  const [action, setAction]   = useState('')
  const [resource, setResource] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, action, resource],
    queryFn:  () => getAuditLogsApi({ page, limit: 20, action, resource }),
  })

  const clearMutation = useMutation({
    mutationFn: clearAuditLogsApi,
    onSuccess: (res) => {
      toast.success(`Deleted ${res.data?.deleted} old log entries`)
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const handleClear = () => {
    const days = prompt('Delete logs older than how many days?', '90')
    if (days && !isNaN(Number(days))) {
      clearMutation.mutate(Number(days))
    }
  }

  const logs   = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Audit Logs" />
      <div className="flex-1 p-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Filter by action..."
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
          <select
            value={resource}
            onChange={(e) => { setResource(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Resources</option>
            <option value="Doctor">Doctor</option>
            <option value="Patient">Patient</option>
            <option value="Appointment">Appointment</option>
            <option value="Backup">Backup</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            onClick={handleClear}
            disabled={clearMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} /> Clear Old Logs
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Resource</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Admin</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">IP Address</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.resource || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{log.admin?.name || 'System'}</p>
                      <p className="text-xs text-gray-400">{log.admin?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.status === 'success'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {logs.length} of {pagination.total} logs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AuditLogsPage