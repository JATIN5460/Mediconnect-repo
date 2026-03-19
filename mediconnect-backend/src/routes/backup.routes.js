const express = require('express');
const router = express.Router();
const bc = require('../controllers/backupController');
const { protect, restrictTo } = require('../middleware/auth');
const auditLog = require('../middleware/auditLogger');

router.use(protect, restrictTo('super_admin'));

router.get('/',    bc.listBackups);
router.post('/',   auditLog('CREATE_BACKUP','Backup'), bc.createBackup);
router.get('/:filename/download', bc.downloadBackup);
router.delete('/:filename', auditLog('DELETE_BACKUP','Backup'), bc.deleteBackup);

module.exports = router;
