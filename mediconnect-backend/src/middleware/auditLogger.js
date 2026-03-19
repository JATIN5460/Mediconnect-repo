const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const auditLog = (action, resource) => async (req, res, next) => {
  // Wrap res.json to capture status after the response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Fire-and-forget audit entry
    AuditLog.create({
      admin: req.admin ? req.admin._id : null,
      action,
      resource,
      resourceId: req.params.id || (body && body.data && body.data._id),
      details: { body: req.body, query: req.query, params: req.params },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: res.statusCode < 400 ? 'success' : 'failure'
    }).catch(err => logger.error('Audit log error: ' + err.message));

    return originalJson(body);
  };
  next();
};

module.exports = auditLog;
