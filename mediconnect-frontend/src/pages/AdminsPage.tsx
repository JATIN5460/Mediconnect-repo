import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ToggleLeft, ToggleRight, Shield, Eye, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { useAuthStore } from '../store/auth.store'
import api from '../api/axios'

interface Admin {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'viewer'
  isActive: boolean
  lastLogin: string
  createdAt: string
}

const roleConfig = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    className: 'bg-purple-50 text-purple-600',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-blue-50 text-blue-600',
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    className: 'bg-gray-100 text-gray-600',
  },
}

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['admin', 'viewer']),
})

type FormData = z.infer<typeof schema>

const getAdminsApi = async () => {
  const res = await api.get('/api/admins')
  return res.data
}

const createAdminApi = async (data: FormData) => {
  const res = await api.post('/api/auth/register', data)
  return res.data
}

const toggleAdminApi = async (id: string) => {
  const res = await api.patch(`/api/admins/${id}/toggle`)
  return res.data
}

const deleteAdminApi = async (id: string) => {
  const res = await api.delete(`/api/admins/${id}`)
  return res.data
}

interface FormProps {
  onClose: () => void
  onSuccess: () => void
}

const AdminForm = ({ onClose, onSuccess }: FormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'admin' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createAdminApi(data)
      toast.success('Admin account created successfully')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create admin')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Create Admin Account</h2>
            <p className="text-xs text-gray-400 mt-0.5">New user will be able to login immediately</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              {...register('name')}
              placeholder="Dr. John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="john@mediconnect.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="Min 8 chars, uppercase, number"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin — can create and manage data</option>
              <option value="viewer">Viewer — read only access</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-700">Role permissions:</p>
            <p><span className="text-blue-600 font-medium">Admin</span> — manage doctors, patients, appointments, analytics</p>
            <p><span className="text-gray-600 font-medium">Viewer</span> — view only, no create/edit/delete access</p>
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
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdminsPage = () => {
  const queryClient      = useQueryClient()
  const { user }         = useAuthStore()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn:  getAdminsApi,
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleAdminApi(id),
    onSuccess: (res) => {
      toast.success(res.data?.isActive ? 'Account activated' : 'Account deactivated')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminApi(id),
    onSuccess: () => {
      toast.success('Admin account deleted')
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete')
    },
  })

  const handleToggle = (id: string, name: string, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'activate'
    if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${name}?`)) {
      toggleMutation.mutate(id)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently delete account for ${name}? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const admins: Admin[] = data?.data || []

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Admin Accounts" />
      <div className="flex-1 p-6 overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">
              {admins.length} account{admins.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Admin
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No admin accounts found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Account</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Last Login</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Created</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin: Admin) => {
                  const role      = roleConfig[admin.role] || roleConfig.viewer
                  const RoleIcon  = role.icon
                  const isSelf    = admin._id === user?._id
                  const isSuperAdmin = admin.role === 'super_admin'

                  return (
                    <tr
                      key={admin._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{admin.name}</p>
                              {isSelf && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span className={'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit ' + role.className}>
                          <RoleIcon size={12} />
                          {role.label}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className={'text-xs px-2.5 py-1 rounded-full font-medium ' +
                          (admin.isActive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-500')
                        }>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {admin.lastLogin
                          ? format(new Date(admin.lastLogin), 'dd MMM yyyy, HH:mm')
                          : 'Never'}
                      </td>

                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {format(new Date(admin.createdAt), 'dd MMM yyyy')}
                      </td>

                      <td className="px-5 py-3">
                        {!isSelf && !isSuperAdmin ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggle(admin._id, admin.name, admin.isActive)}
                              disabled={toggleMutation.status === 'pending'}
                              className={'p-1.5 rounded transition-colors ' +
                                (admin.isActive
                                  ? 'text-green-500 hover:text-amber-500 hover:bg-amber-50'
                                  : 'text-gray-400 hover:text-green-500 hover:bg-green-50')
                              }
                              title={admin.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {admin.isActive
                                ? <ToggleRight size={18} />
                                : <ToggleLeft size={18} />
                              }
                            </button>
                            <button
                              onClick={() => handleDelete(admin._id, admin.name)}
                              disabled={deleteMutation.status === 'pending'}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">
                            {isSelf ? 'Your account' : 'Protected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(roleConfig).map(([key, config]) => {
            const Icon  = config.icon
            const count = admins.filter((a: Admin) => a.role === key).length
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + config.className}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{count}</p>
                  <p className="text-xs text-gray-500">{config.label}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {showForm && (
        <AdminForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            queryClient.invalidateQueries({ queryKey: ['admins'] })
          }}
        />
      )}
    </div>
  )
}

export default AdminsPage