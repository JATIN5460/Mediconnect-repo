const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, doctorId, date, startDate, endDate, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;
    if (search) query.patientName = { $regex: search, $options: 'i' };

    if (date) {
      const d = new Date(date);
      query.appointmentDate = {
        $gte: new Date(new Date(d).setHours(0,0,0,0)),
        $lte: new Date(new Date(d).setHours(23,59,59,999))
      };
    } else if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('doctor', 'name specialization department')
        .populate('createdBy', 'name')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ appointmentDate: -1 }),
      Appointment.countDocuments(query)
    ]);

    return sendPaginated(res, appointments, page, limit, total);
  } catch (err) { next(err); }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization phone')
      .populate('createdBy', 'name');
    if (!appointment) return sendError(res, 'Appointment not found', 404);
    return sendSuccess(res, { appointment });
  } catch (err) { next(err); }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot } = req.validatedBody;

    // Check for slot conflicts
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['scheduled', 'confirmed'] }
    });
    if (conflict) return sendError(res, 'This time slot is already booked', 409);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return sendError(res, 'Doctor not found', 404);
    if (!doctor.isActive) return sendError(res, 'Doctor is not active', 400);

    const appointment = await Appointment.create({
      ...req.validatedBody,
      doctor: doctorId,
      createdBy: req.admin._id
    });

    await Doctor.findByIdAndUpdate(doctorId, { $inc: { totalAppointments: 1 } });

    const populated = await appointment.populate('doctor', 'name specialization');
    return sendSuccess(res, { appointment: populated }, 'Appointment created', 201);
  } catch (err) { next(err); }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('doctor', 'name specialization');
    if (!appointment) return sendError(res, 'Appointment not found', 404);
    return sendSuccess(res, { appointment }, 'Appointment updated');
  } catch (err) { next(err); }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 'Appointment not found', 404);
    if (['cancelled', 'completed'].includes(appointment.status)) {
      return sendError(res, 'Appointment cannot be cancelled', 400);
    }
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.admin.name;
    appointment.cancelReason = reason;
    await appointment.save();
    return sendSuccess(res, { appointment }, 'Appointment cancelled');
  } catch (err) { next(err); }
};

exports.getTodayAppointments = async (req, res, next) => {
  try {
    const today = new Date();
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: new Date(today.setHours(0,0,0,0)),
        $lte: new Date(today.setHours(23,59,59,999))
      }
    }).populate('doctor', 'name specialization').sort({ timeSlot: 1 });
    return sendSuccess(res, { appointments, count: appointments.length });
  } catch (err) { next(err); }
};

// ── Status transitions ────────────────────────────────────────────────────────
// Valid transitions: scheduled→confirmed→in-progress→completed, any→no-show
const TRANSITIONS = {
  scheduled:    ['confirmed', 'cancelled', 'no-show'],
  confirmed:    ['in-progress', 'cancelled', 'no-show'],
  'in-progress': ['completed', 'no-show'],
  completed:    [],
  cancelled:    [],
  'no-show':    []
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return sendError(res, 'status is required in body', 400);

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 'Appointment not found', 404);

    const allowed = TRANSITIONS[appointment.status] || [];
    if (!allowed.includes(status)) {
      return sendError(res,
        `Cannot transition from "${appointment.status}" to "${status}". Allowed: [${allowed.join(', ')}]`, 400);
    }

    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancelledBy = req.admin.name;
      appointment.cancelReason = req.body.reason || 'No reason provided';
    }
    await appointment.save();
    return sendSuccess(res, { appointment }, `Status updated to "${status}"`);
  } catch (err) { next(err); }
};

exports.markNoShow = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 'Appointment not found', 404);
    if (!['scheduled','confirmed'].includes(appointment.status)) {
      return sendError(res, 'Only scheduled or confirmed appointments can be marked no-show', 400);
    }
    appointment.status = 'no-show';
    await appointment.save();
    return sendSuccess(res, { appointment }, 'Marked as no-show');
  } catch (err) { next(err); }
};
