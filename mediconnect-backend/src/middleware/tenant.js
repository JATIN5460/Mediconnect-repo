const { sendError } = require('../utils/apiResponse')

/**
 * Tenant middleware
 * Reads clinicId from the logged-in admin and attaches it to req
 * All controllers use req.clinicId to filter data
 */
const tenantMiddleware = (req, res, next) => {
  if (!req.admin) {
    return sendError(res, 'Authentication required', 401)
  }

  // super_admin has no clinicId — they can access everything
  if (req.admin.role === 'super_admin') {
    req.clinicId = req.query.clinicId || null
    return next()
  }

  // All other roles must belong to a clinic
  if (!req.admin.clinicId) {
    return sendError(res, 'Admin is not associated with any clinic', 403)
  }

  req.clinicId = req.admin.clinicId
  next()
}

module.exports = tenantMiddleware