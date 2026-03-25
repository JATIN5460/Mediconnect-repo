/**
 * slotHelper.js
 * Generates all possible time slots for a doctor on a given date,
 * then removes already-booked ones.
 */

const Appointment = require('../models/Appointment');

/**
 * Convert "HH:MM" to total minutes since midnight
 */
const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convert minutes since midnight back to "HH:MM"
 */
const toTimeStr = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Get day name from a Date object (matches Doctor schedule enum)
 */
const getDayName = (date) => {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return days[new Date(date).getDay()];
};

/**
 * Generate all slots for a doctor's schedule entry
 */
const generateSlots = (startTime, endTime, duration) => {
  const slots = [];
  let current = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (current + duration <= end) {
    slots.push(toTimeStr(current));
    current += duration;
  }
  return slots;
};

/**
 * Get available (unbooked) slots for a doctor on a specific date
 * @param {Object} doctor  - Doctor mongoose document
 * @param {string} dateStr - ISO date string "YYYY-MM-DD"
 * @returns {{ allSlots: string[], bookedSlots: string[], availableSlots: string[] }}
 */
const getAvailableSlots = async (doctor, dateStr) => {
  const dayName = getDayName(dateStr);
  const schedule = doctor.schedule.find(
    (s) => s.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!schedule) {
    return { allSlots: [], bookedSlots: [], availableSlots: [], message: `Doctor does not work on ${dayName}` };
  }

  const duration = schedule.slotDuration || 30;
  const allSlots = generateSlots(schedule.startTime, schedule.endTime, duration);

  // Find booked slots for this doctor on this date
  const targetDate = new Date(dateStr);
  const bookedAppointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: {
      $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
      $lte: new Date(targetDate.setHours(23, 59, 59, 999)),
    },
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
  }).select('timeSlot');

  const bookedSlots = bookedAppointments.map((a) => a.timeSlot);
  const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

  return { allSlots, bookedSlots, availableSlots, day: dayName, duration };
};

module.exports = { getAvailableSlots, generateSlots, getDayName, toMinutes, toTimeStr };
