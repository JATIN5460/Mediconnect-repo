export interface Patient {
  _id: string
  name: string
  phone: string
  email: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  bloodGroup: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  emergencyContact: {
    name: string
    relation: string
    phone: string
  }
  medicalHistory: {
    condition: string
    diagnosedDate: string
    notes: string
  }[]
  allergies: string[]
  isActive: boolean
  createdAt: string
}