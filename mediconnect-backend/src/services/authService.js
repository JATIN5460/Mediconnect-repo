const jwt  = require('jsonwebtoken')
const Admin = require('../models/Admin')

const generateTokens = (id) => {
  const accessToken = jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
  const refreshToken = jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  )
  return { accessToken, refreshToken }
}

const login = async (email, password) => {
  const admin = await Admin.findOne({ email })
    .select('+password +refreshToken')
    .populate('clinicId', 'name slug isActive')

  if (!admin)           throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 })
  if (!admin.isActive)  throw Object.assign(new Error('Account deactivated'), { statusCode: 401 })

  // Check clinic is active (except super_admin)
  if (admin.role !== 'super_admin' && admin.clinicId && !admin.clinicId.isActive) {
    throw Object.assign(new Error('Clinic account is suspended'), { statusCode: 403 })
  }

  const isMatch = await admin.comparePassword(password)
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 })

  const { accessToken, refreshToken } = generateTokens(admin._id)
  admin.refreshToken = refreshToken
  admin.lastLogin    = new Date()
  await admin.save({ validateBeforeSave: false })

  return { admin, accessToken, refreshToken }
}

const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  const admin   = await Admin.findById(decoded.id).select('+refreshToken')

  if (!admin || admin.refreshToken !== refreshToken) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 })
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin._id)
  admin.refreshToken = newRefreshToken
  await admin.save({ validateBeforeSave: false })

  return { accessToken, refreshToken: newRefreshToken }
}

const logout = async (adminId) => {
  await Admin.findByIdAndUpdate(adminId, { refreshToken: null })
}

module.exports = { login, refreshAccessToken, logout, generateTokens }