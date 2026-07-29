const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer.
 * If EMAIL_USER/EMAIL_PASS are not set, silently no-ops so the app runs
 * without an SMTP configuration (useful in dev).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [Email disabled] Would send to ${to}: ${subject}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = sendEmail;
