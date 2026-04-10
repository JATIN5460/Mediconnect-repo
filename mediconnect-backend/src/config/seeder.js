require('dotenv').config()
const mongoose = require('mongoose')
const Admin    = require('../models/Admin')
const Doctor   = require('../models/Doctor')
const Clinic   = require('../models/Clinic')
const Settings = require('../models/Settings')

const FULL_SCHEDULE = [
  { day: 'Monday',    startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Tuesday',   startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Thursday',  startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Friday',    startTime: '09:00', endTime: '17:00', slotDuration: 30 },
  { day: 'Saturday',  startTime: '09:00', endTime: '13:00', slotDuration: 30 },
]

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Super admin — no clinicId
  const existingSuper = await Admin.findOne({ email: 'admin@mediconnect.com' })
  if (!existingSuper) {
    await Admin.create({
      name:     'Super Admin',
      email:    'admin@mediconnect.com',
      password: 'Admin@1234',
      role:     'super_admin',
      clinicId: null,
    })
    console.log('Super admin created: admin@mediconnect.com / Admin@1234')
  }

  // Demo clinic
  let clinic = await Clinic.findOne({ slug: 'mediconnect-kathua' })
  if (!clinic) {
    clinic = await Clinic.create({
      name:    'MediConnect Kathua',
      slug:    'mediconnect-kathua',
      email:   'kathua@mediconnect.com',
      phone:   '+91-9876543210',
      address: '123 Health Street, Kathua, J&K',
    })
    console.log('Demo clinic created: MediConnect Kathua')
  }

  // Clinic owner
  const existingOwner = await Admin.findOne({ email: 'owner@kathua.mediconnect.com' })
  if (!existingOwner) {
    await Admin.create({
      name:     'Clinic Owner',
      email:    'owner@kathua.mediconnect.com',
      password: 'Owner@1234',
      role:     'clinic_owner',
      clinicId: clinic._id,
    })
    console.log('Clinic owner created: owner@kathua.mediconnect.com / Owner@1234')
  }

  // Doctors for demo clinic - idempotent seeding
  const doctorsData = [
    {
      name:            'Dr. Arjun Sharma',
      specialization:  'Cardiology',
      department:      'Cardiology',
      email:           'arjun.sharma@kathua.com',
      phone:           '9876543001',
      licenseNumber:   'MCI-2001-001',
      experience:      15,
      consultationFee: 800,
      isActive:        true,
      schedule:        FULL_SCHEDULE,
    },
    {
      name:            'Dr. Priya Mehta',
      specialization:  'Dermatology',
      department:      'Dermatology',
      email:           'priya.mehta@kathua.com',
      phone:           '9876543002',
      licenseNumber:   'MCI-2005-002',
      experience:      10,
      consultationFee: 600,
      isActive:        true,
      schedule:        FULL_SCHEDULE,
    },
    {
      name:            'Dr. Rahul Verma',
      specialization:  'Orthopedics',
      department:      'Orthopedics',
      email:           'rahul.verma@kathua.com',
      phone:           '9876543003',
      licenseNumber:   'MCI-2008-003',
      experience:      12,
      consultationFee: 700,
      isActive:        true,
      schedule:        FULL_SCHEDULE,
    },
  ]

  for (const docData of doctorsData) {
    const existingDoctor = await Doctor.findOne({ 
      licenseNumber: docData.licenseNumber 
    })
    if (!existingDoctor) {
      await Doctor.create({ 
        ...docData, 
        clinicId: clinic._id 
      })
      console.log(`✅ Doctor created: ${docData.name}`)
    } else {
      console.log(`⏭️  Doctor exists: ${docData.name}`)
    }
  }

  console.log('\nSeeding complete!')
  console.log('Super Admin:   admin@mediconnect.com    / Admin@1234')
  console.log('Clinic Owner:  owner@kathua.mediconnect.com / Owner@1234')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })