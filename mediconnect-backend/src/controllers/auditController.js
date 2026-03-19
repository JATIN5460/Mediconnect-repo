const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, resource, adminId, startDate, endDate } = req.query;
    const query = {};
    if (action)   query.action = action;
    if (resource) query.resource = resource;
    if (adminId)  query.admin = adminId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(endDate);
    }
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('admin', 'name email')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      AuditLog.countDocuments(query)
    ]);
    return sendPaginated(res, logs, total, page, limit);
  } catch (err) { next(err); }
};

exports.clearOldLogs = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
    return sendSuccess(res, { deleted: result.deletedCount }, `Deleted logs older than ${days} days`);
  } catch (err) { next(err); }
};
