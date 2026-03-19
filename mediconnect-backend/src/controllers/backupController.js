const backupService = require('../services/backupService');
const path = require('path');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.createBackup = async (req, res, next) => {
  try {
    const result = await backupService.createBackup();
    return sendSuccess(res, result, 'Backup created successfully', 201);
  } catch (err) { next(err); }
};

exports.listBackups = async (req, res, next) => {
  try {
    const backups = backupService.listBackups();
    return sendSuccess(res, { backups, count: backups.length });
  } catch (err) { next(err); }
};

exports.downloadBackup = async (req, res, next) => {
  try {
    const { filename } = req.params;
    // Sanitize filename – no directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return sendError(res, 'Invalid filename', 400);
    }
    const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
    const filePath = path.join(BACKUP_DIR, filename);
    res.download(filePath, filename, (err) => {
      if (err) next(err);
    });
  } catch (err) { next(err); }
};

exports.deleteBackup = async (req, res, next) => {
  try {
    backupService.deleteBackup(req.params.filename);
    return sendSuccess(res, {}, 'Backup deleted');
  } catch (err) { next(err); }
};
