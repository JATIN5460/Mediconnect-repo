import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import api from '../api/axios'

interface Clinic {
  _id: string
  name: string
  email: string
  phone: string
  slug: string
  address: string
  isActive: boolean
  plan: { type: string; maxDoctors: number; maxAppointments: number }
  createdAt: string
}

const schema = z.object({
  clinicName:    z.string().min(2, 'Clinic name required'),
  clinicEmail:   z.string().email('Invalid email'),
  clinicPhone:   z.string().optional(),
  clinicAddress: z.string().optional(),
  ownerName:     z.string().min(2, 'Owner name required'),
  ownerEmail:    z.string().email('Invalid owner email'),
  ownerPassword: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Need one uppercase letter')
    .regex(/[0-9]/, 'Need one number'),
})

type FormData = z.infer<typeof schema>

const getClinicsApi   = () => api.get('/api/clinics/admin').then(r => r.data)
const createClinicApi = (data: FormData) => api.post('/api/clinics/admin', data).then(r => r.data)
const toggleClinicApi = (id: string) => api.patch(`/api/clinics/admin/${id}/toggle`).then(r => r.data)

const planColors: Record<string, string> = {
  free:  'bg-gray-100 text-gray-600',
  basic: 'bg-blue-50 text-blue-600',
  pro:   'bg-purple-50 text-purple-600',
}

interface FormProps {
  onClose: () => void
  onSuccess: () => void
}

const ClinicForm = ({ onClose, onSuccess }: FormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createClinicApi(data)
      toast.success('Clinic registered successfully')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create clinic')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Register New Clinic</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Creates the clinic and an owner account in one step
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Clinic information
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic name</label>
            <input
              {...register('clinicName')}
              placeholder="City Hospital Delhi"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.clinicName && <p className="text-red-500 text-xs mt-1">{errors.clinicName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('clinicEmail')}
                type="email"
                placeholder="clinic@hospital.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.clinicEmail && <p className="text-red-500 text-xs mt-1">{errors.clinicEmail.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                {...register('clinicPhone')}
                placeholder="+91-9876543210"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              {...register('clinicAddress')}
              placeholder="123 Medical Street, Delhi"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-2">
            Owner account
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner full name</label>
            <input
              {...register('ownerName')}
              placeholder="Dr. Rajesh Kumar"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner email</label>
              <input
                {...register('ownerEmail')}
                type="email"
                placeholder="owner@hospital.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{errors.ownerEmail.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('ownerPassword')}
                type="password"
                placeholder="Min 8 chars"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.ownerPassword && <p className="text-red-500 text-xs mt-1">{errors.ownerPassword.message}</p>}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            The owner can login immediately after creation and start adding doctors and patients.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Register Clinic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ClinicsPage = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['clinics'],
    queryFn:  getClinicsApi,
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleClinicApi(id),
    onSuccess: (res: any) => {
      toast.success(res.data?.isActive ? 'Clinic activated' : 'Clinic suspended')
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update')
    },
  })

  const clinics: Clinic[] = data?.data || []
  const activeCount    = clinics.filter(c => c.isActive).length
  const suspendedCount = clinics.filter(c => !c.isActive).length

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Clinics" />
      <div className="flex-1 p-6 overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {clinics.length} clinic{clinics.length !== 1 ? 's' : ''} registered
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Register Clinic
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total',     value: clinics.length, color: 'text-blue-600'  },
            { label: 'Active',    value: activeCount,    color: 'text-green-600' },
            { label: 'Suspended', value: suspendedCount, color: 'text-red-500'   },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className={'text-2xl font-bold mt-1 ' + item.color}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : clinics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Building2 size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No clinics registered yet</p>
              <p className="text-xs mt-1">Click Register Clinic to add the first one</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Clinic</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Contact</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Registered</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic: Clinic) => (
                  <tr key={clinic._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                          {clinic.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{clinic.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{clinic.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700 text-xs">{clinic.email}</p>
                      <p className="text-gray-400 text-xs">{clinic.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={'text-xs px-2.5 py-1 rounded-full font-medium capitalize ' +
                        (planColors[clinic.plan?.type] || 'bg-gray-100 text-gray-600')}>
                        {clinic.plan?.type || 'free'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={'text-xs px-2.5 py-1 rounded-full font-medium ' +
                        (clinic.isActive
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-500')}>
                        {clinic.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {format(new Date(clinic.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleMutation.mutate(clinic._id)}
                        disabled={toggleMutation.status === 'pending'}
                        className={'p-1.5 rounded transition-colors ' +
                          (clinic.isActive
                            ? 'text-green-500 hover:text-amber-500 hover:bg-amber-50'
                            : 'text-gray-400 hover:text-green-500 hover:bg-green-50')}
                        title={clinic.isActive ? 'Suspend clinic' : 'Activate clinic'}
                      >
                        {clinic.isActive
                          ? <ToggleRight size={20} />
                          : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {showForm && (
        <ClinicForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['clinics'] })
          }}
        />
      )}
    </div>
  )
}

export default ClinicsPage
