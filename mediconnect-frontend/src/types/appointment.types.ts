export interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

export interface Appointment {
  _id: string
  patientName: string
  patientPhone: string
  doctor: {
    _id: string
    name: string
    specialization: string
    department: string
  }
  appointmentDate: string
  timeSlot: string
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine'
  reason: string
  notes: string
  createdAt: string
}