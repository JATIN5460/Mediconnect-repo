const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

/**
 * Aggregate appointments by status for a date range
 */
const getAppointmentStats = async (startDate, endDate) => {
  return Appointment.aggregate([
    {
      $match: {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
};

/**
 * Top N doctors by appointment count
 */
const getTopDoctors = async (limit = 5) => {
  return Appointment.aggregate([
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctorInfo',
      },
    },
    { $unwind: '$doctorInfo' },
    {
      $project: {
        name: '$doctorInfo.name',
        specialization: '$doctorInfo.specialization',
        count: 1,
      },
    },
  ]);
};

/**
 * Monthly appointments count for chart
 */
const getMonthlyTrend = async (year) => {
  return Appointment.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);
};

/**
 * Summary dashboard counts
 */
const getDashboardSummary = async () => {
  const [totalDoctors, totalPatients, todayAppointments, pendingAppointments] =
    await Promise.all([
      Doctor.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments({ date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Appointment.countDocuments({ status: 'pending' }),
    ]);

  return { totalDoctors, totalPatients, todayAppointments, pendingAppointments };
};

module.exports = { getAppointmentStats, getTopDoctors, getMonthlyTrend, getDashboardSummary };
