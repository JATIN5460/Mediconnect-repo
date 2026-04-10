const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
  clinicId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, required: true },
  email:       String,
  dateOfBirth: Date,
  gender:      { type: String, enum: ['male','female','other'] },
  bloodGroup:  { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  address: {
    street: String, city: String, state: String, zip: String,
  },
  emergencyContact: {
    name: String, relation: String, phone: String,
  },
  medicalHistory: [{
    condition: String, diagnosedDate: Date, notes: String,
  }],
  allergies: [String],
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

patientSchema.index({ clinicId: 1 })
patientSchema.index({ clinicId: 1, phone: 1 })

module.exports = mongoose.model('Patient', patientSchema)