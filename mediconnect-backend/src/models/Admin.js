const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const adminSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type:    String,
    enum:    ['super_admin', 'clinic_owner', 'admin', 'viewer'],
    default: 'admin',
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Clinic',
    default: null,
  },
  isActive:     { type: Boolean, default: true },
  lastLogin:    Date,
  refreshToken: { type: String, select: false },
}, { timestamps: true })

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

adminSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

adminSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshToken
  return obj
}

module.exports = mongoose.model('Admin', adminSchema)