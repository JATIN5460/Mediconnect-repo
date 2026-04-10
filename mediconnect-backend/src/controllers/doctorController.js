const Doctor      = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse')

exports.getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, department, isActive } = req.query
    const query = { clinicId: req.clinicId }

    if (search)            query.$text    = { $search: search }
    if (department)        query.department = department
    if (isActive !== undefined) query.isActive = isActive === 'true'

    const [doctors, total] = await Promise.all([
      Doctor.find(query).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      Doctor.countDocuments(query),
    ])

    return sendPaginated(res, doctors, page, limit, total)
  } catch (err) { next(err) }
}

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, clinicId: req.clinicId })
    if (!doctor) return sendError(res, 'Doctor not found', 404)
    return sendSuccess(res, { doctor })
  } catch (err) { next(err) }
}

exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create({ ...req.validatedBody, clinicId: req.clinicId })
    return sendSuccess(res, { doctor }, 'Doctor created', 201)
  } catch (err) { next(err) }
}

exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.clinicId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!doctor) return sendError(res, 'Doctor not found', 404)
    return sendSuccess(res, { doctor }, 'Doctor updated')
  } catch (err) { next(err) }
}

exports.deleteDoctor = async (req, res, next) => {
  try {
    const hasActive = await Appointment.exists({
      doctor:   req.params.id,
      clinicId: req.clinicId,
      status:   { $in: ['scheduled', 'confirmed'] },
    })
    if (hasActive) return sendError(res, 'Cannot delete doctor with active appointments', 400)

    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId })
    if (!doctor) return sendError(res, 'Doctor not found', 404)
    return sendSuccess(res, {}, 'Doctor deleted')
  } catch (err) { next(err) }
}

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Doctor.distinct('department', { clinicId: req.clinicId })
    return sendSuccess(res, { departments })
  } catch (err) { next(err) }
}

exports.getDoctorSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne(
      { _id: req.params.id, clinicId: req.clinicId },
    ).select('name schedule')
    if (!doctor) return sendError(res, 'Doctor not found', 404)
    return sendSuccess(res, { schedule: doctor.schedule })
  } catch (err) { next(err) }
}

exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const { date, status } = req.query
    const query = { doctor: req.params.id, clinicId: req.clinicId }

    if (date) {
      const d = new Date(date)
      query.appointmentDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      }
    }
    if (status) query.status = status

    const appointments = await Appointment.find(query).sort({ appointmentDate: 1 })
    return sendSuccess(res, { appointments })
  } catch (err) { next(err) }
}

const { getAvailableSlots } = require('../utils/slotHelper')

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query
    if (!date) return sendError(res, 'Query param ?date=YYYY-MM-DD is required', 400)

    const doctor = await Doctor.findOne({ _id: req.params.id, clinicId: req.clinicId })
    if (!doctor)          return sendError(res, 'Doctor not found', 404)
    if (!doctor.isActive) return sendError(res, 'Doctor is not currently active', 400)

    const slots = await getAvailableSlots(doctor, date)
    return sendSuccess(res, { doctor: { id: doctor._id, name: doctor.name }, date, ...slots })
  } catch (err) { next(err) }
}