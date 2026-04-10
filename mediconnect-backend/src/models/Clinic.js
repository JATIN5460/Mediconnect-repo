const mongoose = require('mongoose')

const clinicSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  slug:       { type: String, required: true, unique: true, lowercase: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      String,
  address:    String,
  logo:       String,
  isActive:   { type: Boolean, default: true },
  plan: {
    type:     { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
    maxDoctors:      { type: Number, default: 5 },
    maxAppointments: { type: Number, default: 100 },
    expiresAt:       Date,
  },
  settings: {
    timezone:               { type: String, default: 'Asia/Kolkata' },
    currency:               { type: String, default: 'INR' },
    appointmentSlotDuration:{ type: Number, default: 30 },
    workingHours: {
      start: { type: String, default: '09:00' },
      end:   { type: String, default: '17:00' },
    },
  },
}, { timestamps: true })

module.exports = mongoose.model('Clinic', clinicSchema)
