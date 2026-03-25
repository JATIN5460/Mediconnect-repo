# MediConnect Admin – Backend API

**Web-Based Administration & Management System**  
Node.js · Express · MongoDB · JWT Auth

---

## Architecture Overview

```
mediconnect-admin/
├── src/
│   ├── app.js                    # Express app (middleware + routes)
│   ├── server.js                 # Entry point, DB connect, cron jobs
│   ├── config/
│   │   ├── db.js                 # Mongoose connection
│   │   └── seeder.js             # Seed admin + sample data
│   ├── models/
│   │   ├── Admin.js              # Admin users (roles: super_admin, admin, viewer)
│   │   ├── Doctor.js             # Doctor profiles + weekly schedule
│   │   ├── Patient.js            # Patient records + medical history
│   │   ├── Appointment.js        # Appointments + prescriptions
│   │   ├── Settings.js           # Clinic-wide settings (singleton)
│   │   └── AuditLog.js           # All admin actions tracked
│   ├── controllers/
│   │   ├── authController.js     # Login, register, refresh, logout
│   │   ├── doctorController.js   # CRUD + schedule + appointments
│   │   ├── patientController.js  # CRUD + appointment history
│   │   ├── appointmentController.js  # CRUD + today + cancel
│   │   ├── analyticsController.js    # Dashboard, trends, top doctors
│   │   ├── backupController.js       # Create, list, download, delete
│   │   ├── settingsController.js     # Get/update clinic settings
│   │   └── auditController.js        # View + purge audit logs
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── patient.routes.js
│   │   ├── appointment.routes.js
│   │   ├── analytics.routes.js
│   │   ├── backup.routes.js
│   │   ├── settings.routes.js
│   │   └── audit.routes.js
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + role restrictTo
│   │   ├── errorHandler.js       # Global error + 404 handler
│   │   ├── rateLimiter.js        # Global + auth-specific limiters
│   │   └── auditLogger.js        # Fire-and-forget action logging
│   ├── services/
│   │   ├── authService.js        # Token generation, refresh, logout
│   │   ├── analyticsService.js   # Aggregation queries
│   │   └── backupService.js      # mongodump + zip + cleanup
│   └── utils/
│       ├── apiResponse.js        # sendSuccess / sendError / sendPaginated
│       ├── logger.js             # Winston logger
│       ├── validators.js         # Joi schemas for request validation
│       ├── emailService.js       # Nodemailer + email templates
│       ├── analyticsHelper.js    # Reusable aggregation helpers
│       └── backupRestore.js      # JSON-based backup utility
└── tests/
    ├── auth.test.js
    └── appointment.test.js
```

---

## API Endpoints

### Auth  `POST /api/auth/`
| Method | Path                    | Access        | Description               |
|--------|-------------------------|---------------|---------------------------|
| POST   | `/login`                | Public        | Login, get JWT tokens     |
| POST   | `/register`             | super_admin   | Create admin account      |
| POST   | `/refresh`              | Public        | Refresh access token      |
| POST   | `/logout`               | Protected     | Logout, clear cookie      |
| GET    | `/me`                   | Protected     | Get current admin profile |
| PATCH  | `/change-password`      | Protected     | Change password           |

### Doctors  `GET|POST|PUT|DELETE /api/doctors/`
| Method | Path                    | Access           | Description              |
|--------|-------------------------|------------------|--------------------------|
| GET    | `/`                     | All admins       | List with filters + page |
| GET    | `/departments`          | All admins       | Distinct departments     |
| GET    | `/:id`                  | All admins       | Doctor details           |
| GET    | `/:id/schedule`         | All admins       | Weekly schedule          |
| GET    | `/:id/appointments`     | All admins       | Doctor's appointments    |
| POST   | `/`                     | admin+           | Create doctor            |
| PUT    | `/:id`                  | admin+           | Update doctor            |
| DELETE | `/:id`                  | super_admin      | Delete doctor            |

### Patients  `/api/patients/`
| Method | Path                    | Access           | Description              |
|--------|-------------------------|------------------|--------------------------|
| GET    | `/`                     | All admins       | List with search/filters |
| GET    | `/:id`                  | All admins       | Patient details          |
| GET    | `/:id/appointments`     | All admins       | Patient history          |
| POST   | `/`                     | All admins       | Register patient         |
| PUT    | `/:id`                  | admin+           | Update patient           |
| DELETE | `/:id`                  | super_admin      | Delete patient           |

### Appointments  `/api/appointments/`
| Method | Path                    | Access           | Description              |
|--------|-------------------------|------------------|--------------------------|
| GET    | `/today`                | All admins       | Today's appointments     |
| GET    | `/`                     | All admins       | List with filters        |
| GET    | `/:id`                  | All admins       | Appointment details      |
| POST   | `/`                     | All admins       | Book appointment         |
| PUT    | `/:id`                  | admin+           | Update appointment       |
| PATCH  | `/:id/cancel`           | All admins       | Cancel appointment       |

### Analytics  `/api/analytics/`
| Method | Path                    | Access       | Description               |
|--------|-------------------------|--------------|---------------------------|
| GET    | `/dashboard`            | Protected    | Summary counts            |
| GET    | `/trend/monthly`        | Protected    | Daily trend for a month   |
| GET    | `/top-doctors`          | Protected    | By completed appointments |
| GET    | `/status-breakdown`     | Protected    | Pie chart data            |

### Backup  `/api/backup/`  _(super_admin only)_
| Method | Path                       | Description               |
|--------|----------------------------|---------------------------|
| GET    | `/`                        | List all backups          |
| POST   | `/`                        | Create mongodump zip      |
| GET    | `/:filename/download`      | Download backup file      |
| DELETE | `/:filename`               | Delete backup             |

### Settings  `/api/settings/`
| Method | Path | Access      | Description         |
|--------|------|-------------|---------------------|
| GET    | `/`  | Protected   | Get clinic settings |
| PUT    | `/`  | super_admin | Update settings     |

### Audit Logs  `/api/audit/`  _(super_admin only)_
| Method | Path | Description               |
|--------|------|---------------------------|
| GET    | `/`  | Query audit trail         |
| DELETE | `/`  | Purge logs older than N days |

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, etc.

# 3. Seed initial data (super admin + sample doctors)
npm run seed

# 4. Start development server
npm run dev

# 5. Production
npm start
```

---

## Security Features

- **JWT** access (7d) + refresh token (30d) via httpOnly cookie
- **bcrypt** password hashing (12 rounds)
- **Helmet** HTTP security headers
- **express-mongo-sanitize** NoSQL injection prevention  
- **Rate limiting**: 100 req/15min global, 10 req/15min on `/auth/login`
- **Role-based access**: `super_admin` > `admin` > `viewer`
- **Audit trail**: every write operation logged with admin ID, IP, action

---

## Environment Variables

| Variable                  | Default        | Description                    |
|---------------------------|----------------|--------------------------------|
| `PORT`                    | 5000           | Server port                    |
| `NODE_ENV`                | development    | Environment                    |
| `MONGO_URI`               | —              | MongoDB connection string       |
| `JWT_SECRET`              | —              | Access token secret             |
| `JWT_EXPIRES_IN`          | 7d             | Access token expiry             |
| `JWT_REFRESH_SECRET`      | —              | Refresh token secret            |
| `JWT_REFRESH_EXPIRES_IN`  | 30d            | Refresh token expiry            |
| `EMAIL_HOST`              | smtp.gmail.com | SMTP host                      |
| `EMAIL_PORT`              | 587            | SMTP port                      |
| `EMAIL_USER`              | —              | SMTP user                      |
| `EMAIL_PASS`              | —              | App password                   |
| `BACKUP_DIR`              | ./backups      | Backup storage path            |
| `BACKUP_CRON`             | 0 2 * * *      | Cron schedule for auto-backup  |
| `ALLOWED_ORIGINS`         | localhost:3000 | Comma-separated CORS origins   |
| `RATE_LIMIT_MAX`          | 100            | Max requests per window        |

---

## New Endpoints (v1.1)

### Slot Availability
```
GET /api/doctors/:id/slots?date=2025-03-20
```
Returns `allSlots`, `bookedSlots`, `availableSlots` arrays for a doctor on a given date, based on their schedule and existing appointments.

### Appointment Status Transitions
```
PATCH /api/appointments/:id/status   { "status": "confirmed" }
PATCH /api/appointments/:id/no-show
```
Enforced state machine:
`scheduled → confirmed → in-progress → completed`
Any active state `→ no-show` or `→ cancelled`

### Prescriptions
```
GET    /api/appointments/:id/prescription
POST   /api/appointments/:id/prescription   { medicines: [...], advice, followUpDate }
DELETE /api/appointments/:id/prescription
```
Saving a prescription on an `in-progress` appointment auto-transitions it to `completed`.

### Admin Management  `/api/admins/`  _(super_admin only)_
```
GET    /api/admins
GET    /api/admins/:id
PUT    /api/admins/:id
PATCH  /api/admins/:id/toggle   (activate/deactivate)
DELETE /api/admins/:id
```

### Data Export  `/api/export/`  _(admin+)_
```
GET /api/export/appointments?format=xlsx&startDate=&endDate=&status=&doctorId=
GET /api/export/doctors?format=csv&isActive=true
GET /api/export/patients?format=xlsx&startDate=&endDate=
```
Supported formats: `xlsx` (default), `csv`

---

## Slot Helper Logic

```
Doctor schedule: Monday 09:00–17:00, 30-min slots
→ allSlots:       [09:00, 09:30, 10:00 ... 16:30]  (16 slots)
→ bookedSlots:    [10:00, 11:30]                    (from DB)
→ availableSlots: [09:00, 09:30, 10:30 ... 16:30]  (14 remaining)
```

## Test Coverage

```
tests/
├── auth.test.js          – health, 404, login validation, protected routes
├── doctors.test.js       – unauthenticated guard tests
├── appointments.test.js  – unauthenticated guards + transition logic
├── slotHelper.test.js    – unit tests: toMinutes, toTimeStr, getDayName, generateSlots
└── exportHelper.test.js  – unit tests: flatten helpers, CSV generation
```

Run: `npm test`
