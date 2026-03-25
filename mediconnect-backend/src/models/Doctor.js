const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true
  },
  startTime: { type: String, required: true },  // "09:00"
  endTime:   { type: String, required: true },   // "17:00"
  slotDuration: { type: Number, default: 30 }    // minutes
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  specialization:  { type: String, required: true },
  department:      { type: String, required: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  phone:           { type: String, required: true },
  licenseNumber:   { type: String, required: true, unique: true },
  qualifications:  [String],
  experience:      { type: Number, default: 0 },
  bio:             String,
  consultationFee: { type: Number, default: 0 },
  schedule:        [scheduleSchema],
  isActive:        { type: Boolean, default: true },
  totalAppointments: { type: Number, default: 0 },
  rating:          { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

doctorSchema.index({ name: 'text', specialization: 'text', department: 'text' });
doctorSchema.index({ department: 1 });
doctorSchema.index({ isActive: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
