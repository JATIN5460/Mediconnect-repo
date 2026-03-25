require('dotenv').config();
const path          = require('path');
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const compression   = require('compression');

const { globalLimiter }          = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger                     = require('./utils/logger');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const adminRoutes       = require('./routes/admin.routes');
const doctorRoutes      = require('./routes/doctor.routes');
const patientRoutes     = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const analyticsRoutes   = require('./routes/analytics.routes');
const backupRoutes      = require('./routes/backup.routes');
const settingsRoutes    = require('./routes/settings.routes');
const auditRoutes       = require('./routes/audit.routes');
const exportRoutes      = require('./routes/export.routes');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
// Disable CSP for .html files so the API tester works without restrictions
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) return next();
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:    ["'self'"],
        scriptSrc:     ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc:      ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:       ["'self'", 'https://fonts.gstatic.com'],
        connectSrc:    ["'self'"],
        imgSrc:        ["'self'", 'data:'],
      },
    },
  })(req, res, next);
});

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5000',
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));
app.use(mongoSanitize());
app.use(compression());

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
const morganStream = { write: (msg) => logger.http(msg.trim()) };
app.use(morgan('combined', { stream: morganStream }));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', globalLimiter);

// ─── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));
// Serve test-api.html and any other static files from project root
app.use(express.static(path.join(__dirname, '..')));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status: 'ok', service: 'MediConnect Admin API',
  version: '1.0.0', timestamp: new Date().toISOString()
}));

// ─── API ──────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/admins',       adminRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/backup',       backupRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/audit',        auditRoutes);
app.use('/api/export',       exportRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;