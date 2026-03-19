const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Not authorized – no token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('+role +isActive');

    if (!admin) return sendError(res, 'Admin not found', 401);
    if (!admin.isActive) return sendError(res, 'Account is deactivated', 401);

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);
    if (error.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401);
    return sendError(res, 'Authentication failed', 500);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return sendError(res, 'Insufficient permissions', 403);
  }
  next();
};

module.exports = { protect, restrictTo };
