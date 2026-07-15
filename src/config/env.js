require('dotenv').config();

const isProduction = (process.env.NODE_ENV || 'development') === 'production';
const isTest = (process.env.NODE_ENV || 'development') === 'test';

const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

if (isProduction) {
  requiredEnvVars.push('CLIENT_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET');
}

const missing = [...new Set(requiredEnvVars)].filter((key) => !process.env[key]);

if (missing.length > 0 && !isTest) {
  const message = `Missing required environment variables: ${missing.join(', ')}`;
  if (isProduction) {
    console.error(`FATAL: ${message}`);
    process.exit(1);
  }
  console.warn(`Warning: ${message}`);
}

if (isProduction) {
  const access = process.env.JWT_ACCESS_SECRET || '';
  const refresh = process.env.JWT_REFRESH_SECRET || '';
  if (access.length < 32 || refresh.length < 32) {
    console.error('FATAL: JWT secrets must be at least 32 characters in production');
    process.exit(1);
  }
}

const parseOrigins = () => {
  const primary = process.env.CLIENT_URL || 'http://localhost:5173';
  const extras = (process.env.CLIENT_URLS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([primary.replace(/\/$/, ''), ...extras.map((u) => u.replace(/\/$/, ''))])];
};

const cookieSecure =
  process.env.COOKIE_SECURE === 'true' || (isProduction && process.env.COOKIE_SECURE !== 'false');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    // Leave unset for cross-site deployments (Vercel + Render). Only set for same-site apex domains.
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: cookieSecure,
    // Cross-origin SPA needs SameSite=None + Secure
    sameSite: cookieSecure ? 'none' : 'lax',
  },
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, ''),
  clientOrigins: parseOrigins(),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'FinPilot AI <noreply@finpilot.ai>',
  },
};
