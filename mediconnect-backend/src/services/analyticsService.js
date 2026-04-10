const Appointment = require('../models/Appointment')
const Doctor      = require('../models/Doctor')

const getDashboardStats = async (clinicId) => {
  const now       = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const todayEnd   = new Date(now.setHours(23, 59, 59, 999))
  const filter     = clinicId ? { clinicId } : {}

  const [
    totalDoctors, activeDoctors, totalAppointments,
    todayAppointments, pendingAppointments,
    completedAppointments, cancelledAppointments,
  ] = await Promise.all([
    Doctor.countDocuments(filter),
    Doctor.countDocuments({ ...filter, isActive: true }),
    Appointment.countDocuments(filter),
    Appointment.countDocuments({ ...filter, appointmentDate: { $gte: todayStart, $lte: todayEnd } }),
    Appointment.countDocuments({ ...filter, status: 'scheduled' }),
    Appointment.countDocuments({ ...filter, status: 'completed' }),
    Appointment.countDocuments({ ...filter, status: 'cancelled' }),
  ])

  const cancellationRate = totalAppointments > 0
    ? ((cancelledAppointments / totalAppointments) * 100).toFixed(2)
    : 0

  return {
    doctors:      { total: totalDoctors, active: activeDoctors },
    appointments: {
      total:            totalAppointments,
      today:            todayAppointments,
      pending:          pendingAppointments,
      completed:        completedAppointments,
      cancelled:        cancelledAppointments,
      cancellationRate: parseFloat(cancellationRate),
    },
  }
}

const getMonthlyTrend = async (year, month, clinicId) => {
  const start  = new Date(year, month - 1, 1)
  const end    = new Date(year, month, 0, 23, 59, 59)
  const filter = clinicId ? { clinicId } : {}

  const data = await Appointment.aggregate([
    { $match: { ...filter, appointmentDate: { $gte: start, $lte: end } } },
    {
      $group: {
        _id:       { $dayOfMonth: '$appointmentDate' },
        count:     { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return data.map(d => ({ day: d._id, total: d.count, completed: d.completed, cancelled: d.cancelled }))
}

const getTopDoctors = async (limit = 5, clinicId) => {
  const filter = clinicId ? { clinicId } : {}
  return Appointment.aggregate([
    { $match: { ...filter, status: 'completed' } },
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
    { $unwind: '$doctor' },
    { $project: { name: '$doctor.name', specialization: '$doctor.specialization', appointments: '$count' } },
  ])
}

const getStatusBreakdown = async (clinicId) => {
  const filter = clinicId ? { clinicId } : {}
  return Appointment.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ])
}

module.exports = { getDashboardStats, getMonthlyTrend, getTopDoctors, getStatusBreakdown }