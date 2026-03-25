const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  clinicName:   { type: String, default: 'MediConnect Clinic' },
  address:      String,
  phone:        String,
  email:        String,
  logo:         String,
  workingHours: {
    start: { type: String, default: '08:00' },
    end:   { type: String, default: '20:00' }
  },
  workingDays: {
    type: [String],
    default: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  },
  appointmentSlotDuration: { type: Number, default: 30 },
  currency:     { type: String, default: 'INR' },
  timezone:     { type: String, default: 'Asia/Kolkata' },
  emailNotifications: { type: Boolean, default: true },
  autoReminderHours:  { type: Number, default: 24 },
  maxAppointmentsPerDay: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
