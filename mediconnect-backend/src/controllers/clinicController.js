const Clinic = require('../models/Clinic')
const Admin  = require('../models/Admin')
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse')

// super_admin only — list all clinics
exports.getAllClinics = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const [clinics, total] = await Promise.all([
      Clinic.find().skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      Clinic.countDocuments(),
    ])
    return sendPaginated(res, clinics, total, page, limit)
  } catch (err) { next(err) }
}

exports.getClinicById = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
    if (!clinic) return sendError(res, 'Clinic not found', 404)
    return sendSuccess(res, { clinic })
  } catch (err) { next(err) }
}

// Register a new clinic + create its owner admin account
exports.createClinic = async (req, res, next) => {
  try {
    const {
      clinicName, clinicEmail, clinicPhone, clinicAddress,
      ownerName,  ownerEmail,  ownerPassword,
    } = req.body

    const slug = clinicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const existingClinic = await Clinic.findOne({ $or: [{ email: clinicEmail }, { slug }] })
    if (existingClinic) return sendError(res, 'Clinic with this email or name already exists', 409)

    const existingAdmin = await Admin.findOne({ email: ownerEmail })
    if (existingAdmin) return sendError(res, 'Admin with this email already exists', 409)

    const clinic = await Clinic.create({
      name:    clinicName,
      slug,
      email:   clinicEmail,
      phone:   clinicPhone,
      address: clinicAddress,
    })

    const owner = await Admin.create({
      name:     ownerName,
      email:    ownerEmail,
      password: ownerPassword,
      role:     'clinic_owner',
      clinicId: clinic._id,
    })

    return sendSuccess(res, { clinic, owner }, 'Clinic registered successfully', 201)
  } catch (err) { next(err) }
}

exports.updateClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
    if (!clinic) return sendError(res, 'Clinic not found', 404)
    return sendSuccess(res, { clinic }, 'Clinic updated')
  } catch (err) { next(err) }
}

exports.toggleClinicStatus = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
    if (!clinic) return sendError(res, 'Clinic not found', 404)
    clinic.isActive = !clinic.isActive
    await clinic.save()
    return sendSuccess(res, { isActive: clinic.isActive },
      'Clinic ' + (clinic.isActive ? 'activated' : 'suspended'))
  } catch (err) { next(err) }
}

// Get current clinic info (for clinic admins)
exports.getMyClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.clinicId)
    if (!clinic) return sendError(res, 'Clinic not found', 404)
    return sendSuccess(res, { clinic })
  } catch (err) { next(err) }
}