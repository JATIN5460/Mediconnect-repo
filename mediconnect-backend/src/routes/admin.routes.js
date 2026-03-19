const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLog = require('../middleware/auditLogger');

router.use(protect, restrictTo('super_admin'));

router.get('/',            ac.getAllAdmins);
router.get('/:id',         ac.getAdminById);
router.put('/:id',         auditLog('UPDATE_ADMIN', 'Admin'), ac.updateAdmin);
router.patch('/:id/toggle', auditLog('TOGGLE_ADMIN_STATUS', 'Admin'), ac.toggleAdminStatus);
router.delete('/:id',      auditLog('DELETE_ADMIN', 'Admin'), ac.deleteAdmin);

module.exports = router;
