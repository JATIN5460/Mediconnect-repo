const express = require('express');
const router = express.Router();
const pc = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const auditLog = require('../middleware/auditLogger');

router.use(protect,tenant);

router.get('/',    pc.getAllPatients);
router.get('/:id', pc.getPatientById);
router.get('/:id/appointments', pc.getPatientAppointmentHistory);

router.post('/',    auditLog('CREATE_PATIENT','Patient'), pc.createPatient);
router.put('/:id',  restrictTo('super_admin','admin'), auditLog('UPDATE_PATIENT','Patient'), pc.updatePatient);
router.delete('/:id', restrictTo('super_admin'), auditLog('DELETE_PATIENT','Patient'), pc.deletePatient);

module.exports = router;
