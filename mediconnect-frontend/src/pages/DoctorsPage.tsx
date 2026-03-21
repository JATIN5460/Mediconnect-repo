import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import { getDoctorsApi, deleteDoctorApi, getDepartmentsApi } from '../api/doctor.api'
import { Doctor } from '../types/doctor.types'
import DoctorForm from '../components/forms/DoctorForm'

const DoctorsPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, search, department],
    queryFn: () => getDoctorsApi({ page, limit: 10, search, department }),
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartmentsApi,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDoctorApi,
    onSuccess: () => {
      toast.success('Doctor deleted')
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cannot delete doctor')
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete Dr. ${name}? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const doctors: Doctor[] = data?.data || []
  const pagination = data?.pagination
  const departments: string[] = deptData?.data?.departments || []

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Doctors" />
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button
            onClick={() => { setEditDoctor(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Doctor
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Doctor</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Department</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fee</th>
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
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No doctors found
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{doctor.name}</p>
                        <p className="text-xs text-gray-400">{doctor.specialization}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doctor.department}</td>
                    <td className="px-4 py-3 text-gray-600">{doctor.phone}</td>
                    <td className="px-4 py-3 text-gray-600">₹{doctor.consultationFee}</td>
                    <td className="px-4 py-3">
                      {doctor.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs">
                          <XCircle size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditDoctor(doctor); setShowForm(true) }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor._id, doctor.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                Showing {doctors.length} of {pagination.total} doctors
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

      {/* Doctor Form Modal */}
      {showForm && (
        <DoctorForm
          doctor={editDoctor}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['doctors'] })
          }}
        />
      )}
    </div>
  )
}

export default DoctorsPage