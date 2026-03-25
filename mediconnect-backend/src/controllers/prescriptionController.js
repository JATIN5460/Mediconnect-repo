const Appointment = require('../models/Appointment');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/appointments/:id/prescription
 * Fetch the prescription for an appointment
 */
exports.getPrescription = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .select('patientName doctor appointmentDate prescription status')
      .populate('doctor', 'name specialization');
    if (!appt) return sendError(res, 'Appointment not found', 404);
    if (!appt.prescription || !appt.prescription.medicines?.length) {
      return sendError(res, 'No prescription found for this appointment', 404);
    }
    return sendSuccess(res, { prescription: appt.prescription, appointment: appt });
  } catch (err) { next(err); }
};

/**
 * POST /api/appointments/:id/prescription
 * Create or update the prescription.
 * Only allowed when appointment is in-progress or completed.
 */
exports.savePrescription = async (req, res, next) => {
  try {
    const { medicines, advice, followUpDate } = req.body;

    if (!medicines || !Array.isArray(medicines) || !medicines.length) {
      return sendError(res, 'At least one medicine is required', 400);
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return sendError(res, 'Appointment not found', 404);

    const allowedStatuses = ['in-progress', 'completed'];
    if (!allowedStatuses.includes(appt.status)) {
      return sendError(res, `Prescription can only be added for appointments with status: ${allowedStatuses.join(' or ')}`, 400);
    }

    appt.prescription = { medicines, advice, followUpDate: followUpDate || null };
    // Auto-complete if in-progress
    if (appt.status === 'in-progress') appt.status = 'completed';
    await appt.save();

    return sendSuccess(res, { prescription: appt.prescription, status: appt.status }, 'Prescription saved');
  } catch (err) { next(err); }
};

/**
 * DELETE /api/appointments/:id/prescription
 */
exports.deletePrescription = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return sendError(res, 'Appointment not found', 404);
    appt.prescription = { medicines: [], advice: '', followUpDate: null };
    await appt.save();
    return sendSuccess(res, {}, 'Prescription removed');
  } catch (err) { next(err); }
};
