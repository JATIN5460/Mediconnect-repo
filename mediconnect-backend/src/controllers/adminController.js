const Admin = require('../models/Admin');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

exports.getAllAdmins = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [admins, total] = await Promise.all([
      Admin.find()
        .select('-password -refreshToken')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Admin.countDocuments()
    ]);
    return sendPaginated(res, admins, total, page, limit);
  } catch (err) { next(err); }
};

exports.getAdminById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password -refreshToken');
    if (!admin) return sendError(res, 'Admin not found', 404);
    return sendSuccess(res, { admin });
  } catch (err) { next(err); }
};

exports.updateAdmin = async (req, res, next) => {
  try {
    // Prevent password update via this route
    delete req.body.password;
    delete req.body.refreshToken;

    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).select('-password -refreshToken');
    if (!admin) return sendError(res, 'Admin not found', 404);
    return sendSuccess(res, { admin }, 'Admin updated');
  } catch (err) { next(err); }
};

exports.toggleAdminStatus = async (req, res, next) => {
  try {
    // Prevent super_admin from deactivating themselves
    if (req.params.id === req.admin._id.toString()) {
      return sendError(res, 'You cannot deactivate your own account', 400);
    }
    const admin = await Admin.findById(req.params.id);
    if (!admin) return sendError(res, 'Admin not found', 404);
    admin.isActive = !admin.isActive;
    await admin.save({ validateBeforeSave: false });
    return sendSuccess(res, { isActive: admin.isActive },
      `Admin ${admin.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
};

exports.deleteAdmin = async (req, res, next) => {
  try {
    if (req.params.id === req.admin._id.toString()) {
      return sendError(res, 'You cannot delete your own account', 400);
    }
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return sendError(res, 'Admin not found', 404);
    return sendSuccess(res, {}, 'Admin deleted');
  } catch (err) { next(err); }
};
