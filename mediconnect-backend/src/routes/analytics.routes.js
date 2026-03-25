const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard',        analyticsController.getDashboard);
router.get('/trend/monthly',    analyticsController.getMonthlyTrend);
router.get('/top-doctors',      analyticsController.getTopDoctors);
router.get('/status-breakdown', analyticsController.getStatusBreakdown);

module.exports = router;
