import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import { getSettingsApi, updateSettingsApi } from '../api/settings.api'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const SettingsPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn:  getSettingsApi,
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (data?.data?.settings) {
      const s = data.data.settings
      reset({
        clinicName:              s.clinicName,
        address:                 s.address,
        phone:                   s.phone,
        email:                   s.email,
        workingHoursStart:       s.workingHours?.start,
        workingHoursEnd:         s.workingHours?.end,
        appointmentSlotDuration: s.appointmentSlotDuration,
        currency:                s.currency,
        timezone:                s.timezone,
        autoReminderHours:       s.autoReminderHours,
        maxAppointmentsPerDay:   s.maxAppointmentsPerDay,
        emailNotifications:      s.emailNotifications,
      })
    }
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => {
      toast.success('Settings saved')
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save'),
  })

  const onSubmit = (formData: any) => {
    mutation.mutate({
      clinicName:  formData.clinicName,
      address:     formData.address,
      phone:       formData.phone,
      email:       formData.email,
      workingHours: {
        start: formData.workingHoursStart,
        end:   formData.workingHoursEnd,
      },
      appointmentSlotDuration: Number(formData.appointmentSlotDuration),
      currency:                formData.currency,
      timezone:                formData.timezone,
      autoReminderHours:       Number(formData.autoReminderHours),
      maxAppointmentsPerDay:   Number(formData.maxAppointmentsPerDay),
      emailNotifications:      formData.emailNotifications,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Settings" />
        <div className="flex-1 p-6">
          <div className="max-w-2xl space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Settings" />
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">

          {/* Clinic Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Clinic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic name</label>
              <input {...register('clinicName')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input {...register('address')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Working Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                <input {...register('workingHoursStart')} type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                <input {...register('workingHoursEnd')} type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot duration (mins)</label>
                <select {...register('appointmentSlotDuration')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max appointments/day</label>
                <input {...register('maxAppointmentsPerDay')} type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* System */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">System</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select {...register('currency')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="INR">INR — ₹</option>
                  <option value="USD">USD — $</option>
                  <option value="EUR">EUR — €</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select {...register('timezone')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Email notifications</p>
                <p className="text-xs text-gray-400">Send appointment reminders via email</p>
              </div>
              <input {...register('emailNotifications')} type="checkbox" className="w-4 h-4 accent-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto reminder (hours before)
              </label>
              <input {...register('autoReminderHours')} type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default SettingsPage