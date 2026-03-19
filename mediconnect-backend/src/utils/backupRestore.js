const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const BACKUP_DIR = path.join(process.cwd(), 'backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

/**
 * Export all collections to a JSON backup file
 */
const backupDatabase = async () => {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const backup = {};

  for (const col of collections) {
    const docs = await db.collection(col.name).find({}).toArray();
    backup[col.name] = docs;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
  logger.info(`Database backup created: ${filename}`);
  return { filename, filepath, collections: Object.keys(backup), timestamp };
};

/**
 * Restore collections from a JSON backup file
 * @param {string} filename - Name of the backup file
 */
const restoreDatabase = async (filename) => {
  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) throw new Error(`Backup file not found: ${filename}`);

  const backup = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  const db = mongoose.connection.db;
  const results = {};

  for (const [colName, docs] of Object.entries(backup)) {
    if (!docs.length) { results[colName] = 0; continue; }
    await db.collection(colName).deleteMany({});
    const res = await db.collection(colName).insertMany(docs);
    results[colName] = res.insertedCount;
  }

  logger.info(`Database restored from: ${filename}`);
  return results;
};

/**
 * List available backup files
 */
const listBackups = () => {
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, size: stat.size, createdAt: stat.birthtime };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

module.exports = { backupDatabase, restoreDatabase, listBackups };
