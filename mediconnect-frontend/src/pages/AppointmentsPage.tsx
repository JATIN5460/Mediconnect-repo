import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import StatusBadge from '../components/shared/StatusBadge'
import AppointmentForm from '../components/forms/AppointmentForm'
import {
  getAppointmentsApi,
  updateAppointmentStatusApi,
  cancelAppointmentApi,
} from '../api/appointment.api'
import { Appointment } from '../types/appointment.types'
import { format } from 'date-fns'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  scheduled:     ['confirmed', 'cancelled', 'no-show'],
  confirmed:     ['in-progress', 'cancelled', 'no-show'],
  'in-progress': ['completed'],
  completed:     [],
  cancelled:     [],
  'no-show':     [],
}

const AppointmentsPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [date, setDate]       = useState('')
  const [page, setPage]       = useState(1)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, status, date, search],
    queryFn:  () => getAppointmentsApi({ page, limit: 10, status, date }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAppointmentStatusApi(id, status),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelAppointmentApi(id, reason),
    onSuccess: () => {
      toast.success('Appointment cancelled')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      const reason = prompt('Reason for cancellation:') || 'No reason provided'
      cancelMutation.mutate({ id, reason })
    } else {
      statusMutation.mutate({ id, status: newStatus })
    }
  }

  const appointments: Appointment[] = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Appointments" />
      <div className="flex-1 p-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={16} /> Book
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Patient</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Doctor</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Date & Time</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => {
                  const transitions = STATUS_TRANSITIONS[appt.status] || []
                  return (
                    <tr key={appt._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{appt.patientName}</p>
                        <p className="text-xs text-gray-400">{appt.patientPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{appt.doctor?.name}</p>
                        <p className="text-xs text-gray-400">{appt.doctor?.specialization}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">
                          {format(new Date(appt.appointmentDate), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs text-gray-400">{appt.timeSlot}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">{appt.type}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-4 py-3">
                        {transitions.length > 0 && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleStatusChange(appt._id, e.target.value)
                              e.target.value = ''
                            }}
                            defaultValue=""
                            className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="" disabled>Update</option>
                            {transitions.map((t) => (
                              <option key={t} value={t} className="capitalize">{t}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {appointments.length} of {pagination.total}
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

      {showForm && (
        <AppointmentForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
          }}
        />
      )}
    </div>
  )
}

export default AppointmentsPage