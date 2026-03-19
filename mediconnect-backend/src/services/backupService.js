const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const logger = require('../utils/logger');

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
};

// Create a mongodump and zip it
const createBackup = () => new Promise((resolve, reject) => {
  ensureBackupDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpDir = path.join(BACKUP_DIR, 'dump_' + timestamp);
  const zipPath = path.join(BACKUP_DIR, 'backup_' + timestamp + '.zip');
  const mongoUri = process.env.MONGO_URI;

  const dumpCmd = 'mongodump --uri="' + mongoUri + '" --out=' + dumpDir;

  exec(dumpCmd, (err) => {
    if (err) {
      logger.error('mongodump failed: ' + err.message);
      return reject(err);
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Clean up unzipped dump
      fs.rmSync(dumpDir, { recursive: true, force: true });
      logger.info('Backup created: ' + zipPath + ' (' + archive.pointer() + ' bytes)');
      resolve({ path: zipPath, size: archive.pointer(), timestamp });
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(dumpDir, false);
    archive.finalize();
  });
});

// List all backups
const listBackups = () => {
  ensureBackupDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.zip'))
    .map(f => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, size: stat.size, createdAt: stat.mtime };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

// Delete a specific backup file
const deleteBackup = (filename) => {
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) throw new Error('Backup file not found');
  fs.unlinkSync(filePath);
  logger.info('Backup deleted: ' + filename);
};

module.exports = { createBackup, listBackups, deleteBackup };
