const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate, loginSchema, registerAdminSchema } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login',   authLimiter, validate(loginSchema), authController.login);
router.post('/register', protect, restrictTo('super_admin'), validate(registerAdminSchema), authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout',  protect, authController.logout);
router.get('/me',       protect, authController.getMe);
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;
