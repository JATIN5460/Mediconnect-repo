const express = require('express');
const router = express.Router();
const ac = require('../controllers/auditController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('super_admin'));

router.get('/',   ac.getLogs);
router.delete('/', ac.clearOldLogs);

module.exports = router;
