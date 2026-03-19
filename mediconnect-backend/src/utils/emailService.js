const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"MediConnect Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    throw err;
  }
};

const appointmentReminderTemplate = (patientName, doctorName, date, time) => `
  <h2>Appointment Reminder – MediConnect</h2>
  <p>Dear <strong>${patientName}</strong>,</p>
  <p>This is a reminder for your appointment with <strong>Dr. ${doctorName}</strong>
     on <strong>${date}</strong> at <strong>${time}</strong>.</p>
  <p>Please arrive 10 minutes early.</p>
  <br><p>MediConnect Team</p>
`;

const passwordResetTemplate = (name, resetURL) => `
  <h2>Password Reset – MediConnect</h2>
  <p>Hello <strong>${name}</strong>,</p>
  <p>Click the link below to reset your password. This link expires in 10 minutes.</p>
  <a href="${resetURL}" style="padding:10px 20px;background:#2563eb;color:#fff;border-radius:4px;text-decoration:none;">
    Reset Password
  </a>
  <p>If you did not request this, ignore this email.</p>
`;

module.exports = { sendEmail, appointmentReminderTemplate, passwordResetTemplate };
