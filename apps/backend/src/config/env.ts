import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // CRITICAL: Render provides the PORT. If you hardcode 4000, deploy fails.
  PORT: parseInt(process.env.PORT || '4000', 10),
  
  NODE_ENV: process.env.NODE_ENV || 'development',

  // === DATABASE ===
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/aegisplane',

  
  // === FRONTEND CONFIG ===
  // This must match your Vercel URL exactly (no trailing slash)
  APP_ORIGIN: process.env.APP_ORIGIN || 'https://aegis-plane-h50x3pzaf-shyam-mak2005s-projects.vercel.app',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // === SECURITY ===
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-secret-access',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-secret-refresh',
  JWT_ACCESS_TTL: '15m',
  JWT_REFRESH_TTL: '30d',
  BCRYPT_SALT_ROUNDS: 12,

  // === COOKIES ===
  // In production (Render), these MUST be true and domain must match Vercel
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',

  // === PLATFORM ADMIN ===
  PLATFORM_ADMIN_EMAIL: process.env.PLATFORM_ADMIN_EMAIL || 'admin@aegisplane.dev',
  PLATFORM_ADMIN_PASSWORD: process.env.PLATFORM_ADMIN_PASSWORD || 'ChangeMeNow123!',

  // === LOGGING ===
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // === SMTP ===
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@aegisplane.dev',
  SMTP_HOST: process.env.SMTP_HOST || 'mailhog',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '1025', 10),
};

export const isProduction = env.NODE_ENV === 'production';
