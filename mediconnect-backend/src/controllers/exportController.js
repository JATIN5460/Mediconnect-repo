const Appointment = require('../models/Appointment');
const Doctor      = require('../models/Doctor');
const Patient     = require('../models/Patient');
const { toXLSX, toCSV, flattenAppointments, flattenDoctors, flattenPatients } = require('../utils/exportHelper');

/**
 * Build query from common date-range params
 */
const dateRangeQuery = (startDate, endDate, field = 'createdAt') => {
  const q = {};
  if (startDate || endDate) {
    q[field] = {};
    if (startDate) q[field].$gte = new Date(startDate);
    if (endDate)   q[field].$lte = new Date(endDate);
  }
  return q;
};

/**
 * Generic send helper – responds with XLSX or CSV based on ?format=
 */
const sendExport = (res, data, flatten, filename, format = 'xlsx') => {
  const flat = flatten(data);
  if (format === 'csv') {
    const { toCSV } = require('../utils/exportHelper');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(toCSV(flat));
  }
  const buffer = toXLSX(flat, filename);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
  return res.send(buffer);
};

exports.exportAppointments = async (req, res, next) => {
  try {
    const { startDate, endDate, status, doctorId, format = 'xlsx' } = req.query;
    const query = dateRangeQuery(startDate, endDate, 'appointmentDate');
    if (status)   query.status = status;
    if (doctorId) query.doctor = doctorId;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization department')
      .sort({ appointmentDate: -1 })
      .lean();

    sendExport(res, appointments, flattenAppointments, 'appointments', format);
  } catch (err) { next(err); }
};

exports.exportDoctors = async (req, res, next) => {
  try {
    const { format = 'xlsx', isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const doctors = await Doctor.find(query).sort({ name: 1 }).lean();
    sendExport(res, doctors, flattenDoctors, 'doctors', format);
  } catch (err) { next(err); }
};

exports.exportPatients = async (req, res, next) => {
  try {
    const { format = 'xlsx', startDate, endDate } = req.query;
    const query = dateRangeQuery(startDate, endDate, 'createdAt');

    const patients = await Patient.find(query).sort({ name: 1 }).lean();
    sendExport(res, patients, flattenPatients, 'patients', format);
  } catch (err) { next(err); }
};
