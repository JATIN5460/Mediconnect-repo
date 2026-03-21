export interface Schedule {
  day: string
  startTime: string
  endTime: string
  slotDuration: number
}

export interface Doctor {
  _id: string
  name: string
  specialization: string
  department: string
  email: string
  phone: string
  licenseNumber: string
  experience: number
  consultationFee: number
  schedule: Schedule[]
  isActive: boolean
  totalAppointments: number
  createdAt: string
}

export interface DoctorFormData {
  name: string
  specialization: string
  department: string
  email: string
  phone: string
  licenseNumber: string
  experience: number
  consultationFee: number
}

export interface SlotResponse {
  allSlots: string[]
  bookedSlots: string[]
  availableSlots: string[]
  day: string
  duration: number
}