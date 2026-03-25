const Joi = require('joi');

// ─── Auth ──────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({ 'string.pattern.base': 'Password must have uppercase, lowercase, and a number' }),
  role: Joi.string().valid('super_admin', 'admin', 'viewer').default('admin')
});

// ─── Doctor ────────────────────────────────────────────
const doctorSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  specialization: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  licenseNumber: Joi.string().required(),
  department: Joi.string().required(),
  schedule: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday').required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    })
  ),
  isActive: Joi.boolean().default(true),
  consultationFee: Joi.number().min(0)
});

// ─── Appointment ───────────────────────────────────────
const appointmentSchema = Joi.object({
  patientName: Joi.string().required(),
  patientPhone: Joi.string().required(),
  doctorId: Joi.string().required(),
  appointmentDate: Joi.date().min('now').required(),
  timeSlot: Joi.string().required(),
  reason: Joi.string().max(500),
  status: Joi.string().valid('scheduled','confirmed','cancelled','completed').default('scheduled')
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.validatedBody = value;
  next();
};

module.exports = { loginSchema, registerAdminSchema, doctorSchema, appointmentSchema, validate };
