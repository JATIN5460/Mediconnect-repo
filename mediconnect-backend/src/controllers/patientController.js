const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, bloodGroup, isActive } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Patient.countDocuments(query)
    ]);
    return sendPaginated(res, patients, total, page, limit);
  } catch (err) { next(err); }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return sendError(res, 'Patient not found', 404);
    return sendSuccess(res, { patient });
  } catch (err) { next(err); }
};

exports.createPatient = async (req, res, next) => {
  try {
    const exists = await Patient.findOne({ phone: req.body.phone });
    if (exists) return sendError(res, 'A patient with this phone number already exists', 409);
    const patient = await Patient.create(req.body);
    return sendSuccess(res, { patient }, 'Patient registered', 201);
  } catch (err) { next(err); }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!patient) return sendError(res, 'Patient not found', 404);
    return sendSuccess(res, { patient }, 'Patient updated');
  } catch (err) { next(err); }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const hasActive = await Appointment.exists({
      patientName: (await Patient.findById(req.params.id))?.name,
      status: { $in: ['scheduled','confirmed'] }
    });
    if (hasActive) return sendError(res, 'Cannot delete patient with active appointments', 400);
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return sendError(res, 'Patient not found', 404);
    return sendSuccess(res, {}, 'Patient deleted');
  } catch (err) { next(err); }
};

exports.getPatientAppointmentHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return sendError(res, 'Patient not found', 404);
    const appointments = await Appointment.find({ patientName: patient.name })
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: -1 });
    return sendSuccess(res, { appointments, count: appointments.length });
  } catch (err) { next(err); }
};
