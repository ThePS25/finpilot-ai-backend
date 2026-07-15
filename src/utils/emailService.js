const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');
const { BadRequestError } = require('./AppError');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.email.host || !env.email.user) {
    logger.warn('Email service not configured. Auth emails will be logged only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
  });

  return transporter;
};

const requireSmtpInProduction = () => {
  if (env.env === 'production' && (!env.email.host || !env.email.user)) {
    throw new BadRequestError(
      'Email service is not configured. Password reset and verification emails cannot be sent.'
    );
  }
};

const sendMail = async (mailOptions, logFallback) => {
  const transport = getTransporter();
  if (transport) {
    await transport.sendMail(mailOptions);
    return true;
  }
  if (logFallback) logger.info(logFallback);
  return false;
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  requireSmtpInProduction();
  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;

  await sendMail(
    {
      from: env.email.from,
      to: email,
      subject: 'FinPilot AI - Password Reset Request',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">FinPilot AI</h2>
        <p>Hi ${userName},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    },
    `[DEV] Password reset link for ${email}: ${resetUrl}`
  );
};

const sendEmailVerification = async (email, token, userName) => {
  requireSmtpInProduction();
  const verifyUrl = `${env.clientUrl}/verify-email?token=${token}`;

  await sendMail(
    {
      from: env.email.from,
      to: email,
      subject: 'FinPilot AI - Verify your email',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">FinPilot AI</h2>
        <p>Hi ${userName},</p>
        <p>Please verify your email address to secure your account:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
    },
    `[DEV] Email verification link for ${email}: ${verifyUrl}`
  );
};

module.exports = { sendPasswordResetEmail, sendEmailVerification, getTransporter };
