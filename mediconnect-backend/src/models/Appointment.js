const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName:   { type: String, required: true, trim: true },
  patientPhone:  { type: String, required: true },
  patientEmail:  String,
  doctor:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot:      { type: String, required: true },  // "10:30"
  duration:      { type: Number, default: 30 },      // minutes
  status: {
    type: String,
    enum: ['scheduled','confirmed','in-progress','completed','cancelled','no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consultation','follow-up','emergency','routine'],
    default: 'consultation'
  },
  reason:        String,
  notes:         String,
  prescription: {
    medicines: [{
      name: String, dosage: String, frequency: String, duration: String
    }],
    advice:      String,
    followUpDate: Date
  },
  cancelledBy:      String,
  cancelReason:     String,
  reminderSent:     { type: Boolean, default: false },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

appointmentSchema.index({ appointmentDate: 1, doctor: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ patientName: 'text' });

module.exports = mongoose.model('Appointment', appointmentSchema);
