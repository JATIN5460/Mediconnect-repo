const express = require('express');
const router = express.Router();
const ec = require('../controllers/exportController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('super_admin', 'admin'));

router.get('/appointments', ec.exportAppointments);
router.get('/doctors',      ec.exportDoctors);
router.get('/patients',     ec.exportPatients);

module.exports = router;
