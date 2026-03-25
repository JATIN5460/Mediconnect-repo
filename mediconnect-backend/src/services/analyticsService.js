const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');

// Overview dashboard stats
const getDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const [
    totalDoctors,
    activeDoctors,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments
  ] = await Promise.all([
    Doctor.countDocuments(),
    Doctor.countDocuments({ isActive: true }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ appointmentDate: { $gte: todayStart, $lte: todayEnd } }),
    Appointment.countDocuments({ status: 'scheduled' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' })
  ]);

  const cancellationRate = totalAppointments > 0
    ? ((cancelledAppointments / totalAppointments) * 100).toFixed(2)
    : 0;

  return {
    doctors: { total: totalDoctors, active: activeDoctors },
    appointments: {
      total: totalAppointments,
      today: todayAppointments,
      pending: pendingAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      cancellationRate: parseFloat(cancellationRate)
    }
  };
};

// Appointments per day for a given month
const getMonthlyTrend = async (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const data = await Appointment.aggregate([
    { $match: { appointmentDate: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dayOfMonth: '$appointmentDate' },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return data.map(d => ({ day: d._id, total: d.count, completed: d.completed, cancelled: d.cancelled }));
};

// Top doctors by appointment count
const getTopDoctors = async (limit = 5) => {
  return Appointment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor'
      }
    },
    { $unwind: '$doctor' },
    {
      $project: {
        name: '$doctor.name',
        specialization: '$doctor.specialization',
        department: '$doctor.department',
        appointments: '$count'
      }
    }
  ]);
};

// Appointments grouped by status
const getStatusBreakdown = async () => {
  return Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);
};

module.exports = { getDashboardStats, getMonthlyTrend, getTopDoctors, getStatusBreakdown };
