const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
  day:          { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  startTime:    String,
  endTime:      String,
  slotDuration: { type: Number, default: 30 },
}, { _id: false })

const doctorSchema = new mongoose.Schema({
  clinicId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name:            { type: String, required: true, trim: true },
  specialization:  { type: String, required: true },
  department:      { type: String, required: true },
  email:           { type: String, required: true, lowercase: true },
  phone:           { type: String, required: true },
  licenseNumber:   { type: String, required: true },
  qualifications:  [String],
  experience:      { type: Number, default: 0 },
  bio:             String,
  consultationFee: { type: Number, default: 0 },
  schedule:        [scheduleSchema],
  isActive:        { type: Boolean, default: true },
  totalAppointments: { type: Number, default: 0 },
  rating:          { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true })

doctorSchema.index({ clinicId: 1 })
doctorSchema.index({ clinicId: 1, department: 1 })
doctorSchema.index({ clinicId: 1, isActive: 1 })

module.exports = mongoose.model('Doctor', doctorSchema)