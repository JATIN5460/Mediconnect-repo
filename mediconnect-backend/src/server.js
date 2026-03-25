require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const cron = require('node-cron');
const backupService = require('./services/backupService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info('MediConnect Admin API running on port ' + PORT);
    logger.info('Environment: ' + process.env.NODE_ENV);
  });

  // ─── Scheduled backup ───────────────────────────────────────────────────
  const backupCron = process.env.BACKUP_CRON || '0 2 * * *'; // default: 2 AM daily
  cron.schedule(backupCron, async () => {
    logger.info('Running scheduled backup...');
    try {
      const result = await backupService.createBackup();
      logger.info('Scheduled backup completed: ' + result.path);
    } catch (err) {
      logger.error('Scheduled backup failed: ' + err.message);
    }
  });

  // ─── Graceful shutdown ──────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(signal + ' received. Shutting down gracefully...');
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000); // Force kill after 10s
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION: ' + err.message);
    shutdown('unhandledRejection');
  });
};

startServer();
