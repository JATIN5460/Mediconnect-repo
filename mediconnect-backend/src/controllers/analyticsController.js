const analyticsService = require('../services/analyticsService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    return sendSuccess(res, stats, 'Dashboard stats');
  } catch (err) { next(err); }
};

exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    if (month < 1 || month > 12) return sendError(res, 'Month must be 1-12', 400);
    const data = await analyticsService.getMonthlyTrend(year, month);
    return sendSuccess(res, { year, month, trend: data });
  } catch (err) { next(err); }
};

exports.getTopDoctors = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const doctors = await analyticsService.getTopDoctors(limit);
    return sendSuccess(res, { doctors });
  } catch (err) { next(err); }
};

exports.getStatusBreakdown = async (req, res, next) => {
  try {
    const breakdown = await analyticsService.getStatusBreakdown();
    return sendSuccess(res, { breakdown });
  } catch (err) { next(err); }
};
