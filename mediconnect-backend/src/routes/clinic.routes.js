const express  = require('express')
const router   = express.Router()
const cc       = require('../controllers/clinicController')
const { protect, restrictTo } = require('../middleware/auth')
const tenant   = require('../middleware/tenant')

// Super admin routes — manage all clinics
router.use('/admin', protect, restrictTo('super_admin'))
router.get('/admin',            cc.getAllClinics)
router.post('/admin',           cc.createClinic)
router.get('/admin/:id',        cc.getClinicById)
router.put('/admin/:id',        cc.updateClinic)
router.patch('/admin/:id/toggle', cc.toggleClinicStatus)

// Clinic owner route — get their own clinic info
router.get('/me', protect, tenant, cc.getMyClinic)

module.exports = router