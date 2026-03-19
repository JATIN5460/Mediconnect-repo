const Settings = require('../models/Settings');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Get clinic settings (singleton – always ID of first doc)
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    return sendSuccess(res, { settings });
  } catch (err) { next(err); }
};

// Update settings
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return sendSuccess(res, { settings }, 'Settings updated');
  } catch (err) { next(err); }
};
