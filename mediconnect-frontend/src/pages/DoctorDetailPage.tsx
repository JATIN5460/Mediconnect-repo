import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Topbar from '../components/layout/Topbar'
import { getDoctorByIdApi, updateDoctorApi } from '../api/doctor.api'

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday'
]

interface DaySchedule {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
  slotDuration: number
}

const DoctorDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map(day => ({
      day,
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
    }))
  )

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctorByIdApi(id!),
    onSuccess: (res: any) => {
      const doctor = res.data?.doctor
      if (doctor?.schedule?.length) {
        setSchedule(
          DAYS.map(day => {
            const existing = doctor.schedule.find(
              (s: any) => s.day.toLowerCase() === day.toLowerCase()
            )
            return {
              day,
              enabled:      !!existing,
              startTime:    existing?.startTime    || '09:00',
              endTime:      existing?.endTime      || '17:00',
              slotDuration: existing?.slotDuration || 30,
            }
          })
        )
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: (scheduleData: any) => updateDoctorApi(id!, scheduleData),
    onSuccess: () => {
      toast.success('Schedule updated successfully')
      queryClient.invalidateQueries({ queryKey: ['doctor', id] })
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Update failed')
    },
  })

  const handleToggleDay = (day: string) => {
    setSchedule(prev =>
      prev.map(s => s.day === day ? { ...s, enabled: !s.enabled } : s)
    )
  }

  const handleChange = (
    day: string,
    field: 'startTime' | 'endTime' | 'slotDuration',
    value: string | number
  ) => {
    setSchedule(prev =>
      prev.map(s => s.day === day ? { ...s, [field]: value } : s)
    )
  }

  const handleSave = () => {
    const activeSchedule = schedule
      .filter(s => s.enabled)
      .map(s => ({
        day:          s.day,
        startTime:    s.startTime,
        endTime:      s.endTime,
        slotDuration: Number(s.slotDuration),
      }))

    updateMutation.mutate({ schedule: activeSchedule })
  }

  const doctor = data?.data?.doctor

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Doctor Detail" />
        <div className="flex-1 p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Doctor Detail" />
      <div className="flex-1 p-6 overflow-y-auto">

        <button
          onClick={() => navigate('/doctors')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Doctors
        </button>

        {doctor && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                {doctor.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{doctor.name}</h2>
                <p className="text-sm text-gray-500">{doctor.specialization} · {doctor.department}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doctor.email} · {doctor.phone}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-800">Weekly Schedule</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Toggle days on/off and set working hours
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={updateMutation.status === 'pending'}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={15} />
              {updateMutation.status === 'pending' ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          <div className="space-y-3">
            {schedule.map((s) => (
              <div
                key={s.day}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  s.enabled
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 w-32 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(s.day)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                      s.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        s.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${
                    s.enabled ? 'text-blue-700' : 'text-gray-400'
                  }`}>
                    {s.day}
                  </span>
                </div>

                {s.enabled ? (
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 whitespace-nowrap">Start</label>
                      <input
                        type="time"
                        value={s.startTime}
                        onChange={(e) => handleChange(s.day, 'startTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 whitespace-nowrap">End</label>
                      <input
                        type="time"
                        value={s.endTime}
                        onChange={(e) => handleChange(s.day, 'endTime', e.target.value)}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 whitespace-nowrap">Slot</label>
                      <select
                        value={s.slotDuration}
                        onChange={(e) => handleChange(s.day, 'slotDuration', Number(e.target.value))}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 ml-auto">
                      {(() => {
                        const start = s.startTime.split(':').map(Number)
                        const end   = s.endTime.split(':').map(Number)
                        const startMins = start[0] * 60 + start[1]
                        const endMins   = end[0]   * 60 + end[1]
                        const slots = Math.floor((endMins - startMins) / s.slotDuration)
                        return slots > 0 ? slots + ' slots' : '0 slots'
                      })()}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Day off</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Active days: <span className="font-medium text-gray-700">
                {schedule.filter(s => s.enabled).map(s => s.day).join(', ') || 'None'}
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DoctorDetailPage