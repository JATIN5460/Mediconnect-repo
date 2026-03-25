const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  action: { type: String, required: true },  // e.g. 'CREATE_DOCTOR', 'DELETE_APPOINTMENT'
  resource: { type: String },                 // e.g. 'Doctor', 'Appointment'
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failure'], default: 'success' }
}, { timestamps: true });

auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
