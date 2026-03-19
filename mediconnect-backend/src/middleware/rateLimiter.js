const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/apiResponse');

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => sendError(res, 'Too many requests, please try again later', 429)
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => sendError(res, 'Too many login attempts, try again in 15 minutes', 429)
});

module.exports = { globalLimiter, authLimiter };
