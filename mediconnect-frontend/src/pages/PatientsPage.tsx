import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import { getPatientsApi, deletePatientApi } from '../api/patient.api'
import { Patient } from '../types/patient.types'
import PatientForm from '../components/forms/PatientForm'

const PatientsPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => getPatientsApi({ page, limit: 10, search }),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePatientApi,
    onSuccess: () => {
      toast.success('Patient deleted')
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cannot delete patient')
    },
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete patient ${name}?`)) {
      deleteMutation.mutate(id)
    }
  }

  const patients: Patient[] = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Patients" />
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => { setEditPatient(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Patient
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Patient</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Gender</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Blood Group</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">City</th>
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
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No patients found. Add your first patient.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{patient.name}</p>
                        <p className="text-xs text-gray-400">{patient.email || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{patient.phone}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{patient.gender || '—'}</td>
                    <td className="px-4 py-3">
                      {patient.bloodGroup ? (
                        <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                          {patient.bloodGroup}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{patient.address?.city || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditPatient(patient); setShowForm(true) }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient._id, patient.name)}
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
                Showing {patients.length} of {pagination.total} patients
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
        <PatientForm
          patient={editPatient}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['patients'] })
          }}
        />
      )}
    </div>
  )
}

export default PatientsPage