const Patient     = require('../models/Patient')
const Appointment = require('../models/Appointment')
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse')

exports.getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const query = { clinicId: req.clinicId }
    if (search) query.$text = { $search: search }

    const [patients, total] = await Promise.all([
      Patient.find(query).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      Patient.countDocuments(query),
    ])
    return sendPaginated(res, patients, total, page, limit)
  } catch (err) { next(err) }
}

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId })
    if (!patient) return sendError(res, 'Patient not found', 404)
    return sendSuccess(res, { patient })
  } catch (err) { next(err) }
}

exports.createPatient = async (req, res, next) => {
  try {
    const exists = await Patient.findOne({ phone: req.body.phone, clinicId: req.clinicId })
    if (exists) return sendError(res, 'Patient with this phone already exists', 409)
    const patient = await Patient.create({ ...req.body, clinicId: req.clinicId })
    return sendSuccess(res, { patient }, 'Patient registered', 201)
  } catch (err) { next(err) }
}

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!patient) return sendError(res, 'Patient not found', 404)
    return sendSuccess(res, { patient }, 'Patient updated')
  } catch (err) { next(err) }
}

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId })
    if (!patient) return sendError(res, 'Patient not found', 404)
    await patient.deleteOne()
    return sendSuccess(res, {}, 'Patient deleted')
  } catch (err) { next(err) }
}

exports.getPatientAppointmentHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId })
    if (!patient) return sendError(res, 'Patient not found', 404)
    const appointments = await Appointment.find({ patientName: patient.name, clinicId: req.clinicId })
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: -1 })
    return sendSuccess(res, { appointments, count: appointments.length })
  } catch (err) { next(err) }
}