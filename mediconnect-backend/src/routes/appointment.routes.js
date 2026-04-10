const express = require('express');
const router = express.Router();
const ac  = require('../controllers/appointmentController');
const pc  = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const { validate, appointmentSchema } = require('../utils/validators');
const auditLog = require('../middleware/auditLogger');

router.use(protect,tenant);

// Appointment CRUD
router.get('/today',    ac.getTodayAppointments);
router.get('/',         ac.getAllAppointments);
router.get('/:id',      ac.getAppointmentById);
router.post('/',        validate(appointmentSchema), auditLog('CREATE_APPOINTMENT','Appointment'), ac.createAppointment);
router.put('/:id',      restrictTo('super_admin','admin'), auditLog('UPDATE_APPOINTMENT','Appointment'), ac.updateAppointment);
router.patch('/:id/cancel',  auditLog('CANCEL_APPOINTMENT','Appointment'), ac.cancelAppointment);
router.patch('/:id/status',  auditLog('UPDATE_STATUS','Appointment'), ac.updateStatus);
router.patch('/:id/no-show', auditLog('MARK_NOSHOW','Appointment'), ac.markNoShow);

// Prescription sub-resource
router.get('/:id/prescription',    pc.getPrescription);
router.post('/:id/prescription',   auditLog('SAVE_PRESCRIPTION','Appointment'), pc.savePrescription);
router.delete('/:id/prescription', restrictTo('super_admin','admin'), auditLog('DELETE_PRESCRIPTION','Appointment'), pc.deletePrescription);

module.exports = router;
