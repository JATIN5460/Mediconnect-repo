const express = require('express');
const router = express.Router();
const sc = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/',    sc.getSettings);
router.put('/',    restrictTo('super_admin'), sc.updateSettings);

module.exports = router;
