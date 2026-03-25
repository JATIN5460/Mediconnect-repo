const fs       = require('fs')
const path     = require('path')
const mongoose = require('mongoose')
const logger   = require('../utils/logger')

const BACKUP_DIR = process.env.BACKUP_DIR || './backups'

const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

/**
 * Create a full JSON backup of all MongoDB collections
 */
const createBackup = async () => {
  ensureBackupDir()

  const db          = mongoose.connection.db
  const collections = await db.listCollections().toArray()
  const backup      = {}
  const stats       = {}

  for (const col of collections) {
    const docs           = await db.collection(col.name).find({}).toArray()
    backup[col.name]     = docs
    stats[col.name]      = docs.length
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename  = 'backup_' + timestamp + '.json'
  const filepath  = path.join(BACKUP_DIR, filename)

  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2))

  const fileSize = fs.statSync(filepath).size

  logger.info('Backup created: ' + filename + ' (' + fileSize + ' bytes)')
  logger.info('Collections backed up: ' + JSON.stringify(stats))

  return {
    path:      filepath,
    filename,
    size:      fileSize,
    timestamp,
    collections: stats,
  }
}

/**
 * Restore all collections from a JSON backup file
 */
const restoreBackup = async (filename) => {
  const filepath = path.join(BACKUP_DIR, filename)

  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found: ' + filename)
  }

  const raw    = fs.readFileSync(filepath, 'utf-8')
  const backup = JSON.parse(raw)
  const db     = mongoose.connection.db
  const results = {}

  for (const [colName, docs] of Object.entries(backup)) {
    if (!docs || !docs.length) {
      results[colName] = 0
      continue
    }
    await db.collection(colName).deleteMany({})
    const res = await db.collection(colName).insertMany(docs)
    results[colName] = res.insertedCount
  }

  logger.info('Database restored from: ' + filename)
  return results
}

/**
 * List all backup files sorted by newest first
 */
const listBackups = () => {
  ensureBackupDir()

  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f))
      return {
        filename:  f,
        size:      stat.size,
        createdAt: stat.mtime,
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Delete a specific backup file
 */
const deleteBackup = (filename) => {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename')
  }

  const filepath = path.join(BACKUP_DIR, filename)

  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found: ' + filename)
  }

  fs.unlinkSync(filepath)
  logger.info('Backup deleted: ' + filename)
}

/**
 * Get info about a single backup file
 */
const getBackupInfo = (filename) => {
  const filepath = path.join(BACKUP_DIR, filename)

  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found: ' + filename)
  }

  const stat = fs.statSync(filepath)
  return {
    filename,
    size:      stat.size,
    createdAt: stat.mtime,
    path:      filepath,
  }
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup,
  getBackupInfo,
}