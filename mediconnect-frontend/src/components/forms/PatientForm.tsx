import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createPatientApi, updatePatientApi } from '../../api/patient.api'
import { Patient } from '../../types/patient.types'

const schema = z.object({
  name:       z.string().min(2, 'Name required'),
  phone:      z.string().min(10, 'Valid phone required'),
  email:      z.string().email().optional().or(z.literal('')),
  gender:     z.enum(['male', 'female', 'other']).optional(),
  bloodGroup: z.string().optional(),
  city:       z.string().optional(),
  allergies:  z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  patient: Patient | null
  onClose: () => void
  onSuccess: () => void
}

const PatientForm = ({ patient, onClose, onSuccess }: Props) => {
  const isEdit = !!patient

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: patient ? {
      name:       patient.name,
      phone:      patient.phone,
      email:      patient.email || '',
      gender:     patient.gender,
      bloodGroup: patient.bloodGroup || '',
      city:       patient.address?.city || '',
      allergies:  patient.allergies?.join(', ') || '',
    } : {},
  })

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name:       data.name,
        phone:      data.phone,
        email:      data.email,
        gender:     data.gender,
        bloodGroup: data.bloodGroup,
        address:    { city: data.city },
        allergies:  data.allergies
          ? data.allergies.split(',').map(a => a.trim()).filter(Boolean)
          : [],
      }
      if (isEdit) {
        await updatePatientApi(patient._id, payload)
        toast.success('Patient updated')
      } else {
        await createPatientApi(payload)
        toast.success('Patient registered')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Patient' : 'Register Patient'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input {...register('name')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
              <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood group</label>
              <select {...register('bloodGroup')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input {...register('city')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies <span className="text-gray-400 font-normal">(comma separated)</span>
              </label>
              <input {...register('allergies')} placeholder="Penicillin, Aspirin" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientForm