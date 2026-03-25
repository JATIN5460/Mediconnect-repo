/**
 * exportHelper.js
 * Export appointments / doctors / patients to XLSX or CSV
 */

const XLSX = require('xlsx');

/**
 * Convert an array of objects to an XLSX buffer
 * @param {Object[]} data - array of flat objects
 * @param {string}   sheetName
 * @returns {Buffer}
 */
const toXLSX = (data, sheetName = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Convert array of objects to CSV string
 */
const toCSV = (data) => {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Flatten appointment documents for export
 */
const flattenAppointments = (appointments) =>
  appointments.map((a) => ({
    ID:              a._id.toString(),
    Patient:         a.patientName,
    Phone:           a.patientPhone,
    Doctor:          a.doctor?.name || '',
    Specialization:  a.doctor?.specialization || '',
    Department:      a.doctor?.department || '',
    Date:            a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-IN') : '',
    Time:            a.timeSlot,
    Status:          a.status,
    Type:            a.type,
    Reason:          a.reason || '',
    'Created At':    new Date(a.createdAt).toLocaleString('en-IN'),
  }));

/**
 * Flatten doctor documents for export
 */
const flattenDoctors = (doctors) =>
  doctors.map((d) => ({
    ID:              d._id.toString(),
    Name:            d.name,
    Specialization:  d.specialization,
    Department:      d.department,
    Email:           d.email,
    Phone:           d.phone,
    'License No':    d.licenseNumber,
    'Experience (yrs)': d.experience,
    'Consultation Fee': d.consultationFee,
    Active:          d.isActive ? 'Yes' : 'No',
    'Total Appointments': d.totalAppointments,
    'Created At':    new Date(d.createdAt).toLocaleString('en-IN'),
  }));

/**
 * Flatten patient documents for export
 */
const flattenPatients = (patients) =>
  patients.map((p) => ({
    ID:           p._id.toString(),
    Name:         p.name,
    Phone:        p.phone,
    Email:        p.email || '',
    'Date of Birth': p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-IN') : '',
    Gender:       p.gender || '',
    'Blood Group': p.bloodGroup || '',
    City:         p.address?.city || '',
    State:        p.address?.state || '',
    Allergies:    (p.allergies || []).join('; '),
    Active:       p.isActive ? 'Yes' : 'No',
    'Created At': new Date(p.createdAt).toLocaleString('en-IN'),
  }));

module.exports = { toXLSX, toCSV, flattenAppointments, flattenDoctors, flattenPatients };
