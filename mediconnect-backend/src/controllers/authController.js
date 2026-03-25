const authService = require('../services/authService');
const Admin = require('../models/Admin');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const { admin, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return sendSuccess(res, { admin, accessToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.validatedBody;
    const admin = await Admin.create({ name, email, password, role });
    return sendSuccess(res, { admin }, 'Admin registered', 201);
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return sendError(res, 'No refresh token', 401);
    const tokens = await authService.refreshAccessToken(token);
    return sendSuccess(res, tokens, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.admin._id);
    res.clearCookie('refreshToken');
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  return sendSuccess(res, { admin: req.admin });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id).select('+password');
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 400);
    admin.password = newPassword;
    await admin.save();
    return sendSuccess(res, {}, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};
