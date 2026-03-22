import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { getDoctorsApi } from '../../api/doctor.api'
import { getDoctorSlotsApi } from '../../api/doctor.api'
import { createAppointmentApi } from '../../api/appointment.api'

const schema = z.object({
  patientName:  z.string().min(2, 'Patient name required'),
  patientPhone: z.string().min(10, 'Valid phone required'),
  reason:       z.string().optional(),
  type:         z.enum(['consultation', 'follow-up', 'emergency', 'routine']),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const AppointmentForm = ({ onClose, onSuccess }: Props) => {
  const [step, setStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'consultation' },
  })

  // Step 1 — fetch doctors
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: () => getDoctorsApi({ limit: 100 }),
    enabled: step === 1,
  })

  // Step 2 — fetch slots
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedDoctor?._id, selectedDate],
    queryFn: () => getDoctorSlotsApi(selectedDoctor._id, selectedDate),
    enabled: !!selectedDoctor && !!selectedDate && step === 2,
  })

  const doctors = doctorsData?.data || []
  const availableSlots: string[] = slotsData?.data?.availableSlots || []

  const onSubmit = async (data: FormData) => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error('Please complete all steps')
      return
    }
    try {
      await createAppointmentApi({
        ...data,
        doctorId:        selectedDoctor._id,
        appointmentDate: selectedDate,
        timeSlot:        selectedSlot,
      })
      toast.success('Appointment booked successfully')
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold">Book Appointment</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {['Select Doctor', 'Pick Slot', 'Patient Info'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step > i + 1 ? 'bg-green-500 text-white'
                : step === i + 1 ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-gray-100" />}
            </div>
          ))}
        </div>

        <div className="p-6">

          {/* ── Step 1: Select Doctor ── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">Choose a doctor for the appointment</p>
              {doctors.filter((d: any) => d.isActive).map((doctor: any) => (
                <button
                  key={doctor._id}
                  type="button"
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedDoctor?._id === doctor._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {doctor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{doctor.name}</p>
                      <p className="text-xs text-gray-400">{doctor.specialization} · ₹{doctor.consultationFee}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: Pick Date and Slot ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select date
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot('') }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available slots
                  </label>
                  {slotsLoading ? (
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No slots available for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                            selectedSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Patient Info ── */}
          {step === 3 && (
            <form id="appointment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 text-sm mb-4">
                <p className="font-medium text-blue-800">{selectedDoctor?.name}</p>
                <p className="text-blue-600 text-xs mt-0.5">
                  {selectedDate} at {selectedSlot}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient name</label>
                <input
                  {...register('patientName')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient phone</label>
                <input
                  {...register('patientPhone')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.patientPhone && <p className="text-red-500 text-xs mt-1">{errors.patientPhone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </form>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !selectedDoctor) { toast.error('Please select a doctor'); return }
                  if (step === 2 && !selectedDate)   { toast.error('Please select a date'); return }
                  if (step === 2 && !selectedSlot)   { toast.error('Please select a time slot'); return }
                  setStep(s => s + 1)
                }}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                form="appointment-form"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentForm