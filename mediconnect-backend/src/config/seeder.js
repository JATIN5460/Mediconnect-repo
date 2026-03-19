require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Settings = require('../models/Settings');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Super admin
  const existingAdmin = await Admin.findOne({ email: 'admin@mediconnect.com' });
  if (!existingAdmin) {
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@mediconnect.com',
      password: 'Admin@1234',
      role: 'super_admin'
    });
    console.log('✓ Super admin created: admin@mediconnect.com / Admin@1234');
  } else {
    console.log('✓ Super admin already exists');
  }

  // Clinic settings
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      clinicName: 'MediConnect Clinic',
      address: '123 Health Street, Medical District',
      phone: '+91-9876543210',
      email: 'clinic@mediconnect.com'
    });
    console.log('✓ Default settings created');
  }

  // Sample doctors
  const doctorCount = await Doctor.countDocuments();
  if (doctorCount === 0) {
    await Doctor.insertMany([
      {
        name: 'Dr. Arjun Sharma', specialization: 'Cardiology', department: 'Cardiology',
        email: 'arjun.sharma@mediconnect.com', phone: '9876543001',
        licenseNumber: 'MCI-2001-001', experience: 15, consultationFee: 800,
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '13:00' }
        ]
      },
      {
        name: 'Dr. Priya Mehta', specialization: 'Dermatology', department: 'Dermatology',
        email: 'priya.mehta@mediconnect.com', phone: '9876543002',
        licenseNumber: 'MCI-2005-002', experience: 10, consultationFee: 600,
        schedule: [
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
        ]
      },
      {
        name: 'Dr. Rahul Verma', specialization: 'Orthopedics', department: 'Orthopedics',
        email: 'rahul.verma@mediconnect.com', phone: '9876543003',
        licenseNumber: 'MCI-2008-003', experience: 12, consultationFee: 700,
        schedule: [
          { day: 'Monday', startTime: '08:00', endTime: '16:00' },
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00' }
        ]
      }
    ]);
    console.log('✓ 3 sample doctors created');
  }

  console.log('\nSeeding complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
