const express = require('express');
const router = express.Router();
const dc = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate, doctorSchema } = require('../utils/validators');
const auditLog = require('../middleware/auditLogger');

router.use(protect);

router.get('/departments',       dc.getDepartments);
router.get('/',                  dc.getAllDoctors);
router.get('/:id',               dc.getDoctorById);
router.get('/:id/schedule',      dc.getDoctorSchedule);
router.get('/:id/appointments',  dc.getDoctorAppointments);
router.get('/:id/slots',         dc.getAvailableSlots);   // ?date=YYYY-MM-DD

router.post('/',    restrictTo('super_admin','admin'), validate(doctorSchema), auditLog('CREATE_DOCTOR','Doctor'), dc.createDoctor);
router.put('/:id',  restrictTo('super_admin','admin'), auditLog('UPDATE_DOCTOR','Doctor'), dc.updateDoctor);
router.delete('/:id', restrictTo('super_admin'), auditLog('DELETE_DOCTOR','Doctor'), dc.deleteDoctor);

module.exports = router;
