// src/config/env.ts
import 'dotenv/config';

const rawOrigins =
  process.env.CORS_ORIGINS ||
  'http://localhost:3000,https://apexglobalearnings.com';

export const env = {
  PORT: process.env.PORT || '4000',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CORS_ORIGINS: rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  SMTP_HOST: process.env.SMTP_HOST!,
SMTP_PORT: process.env.SMTP_PORT || "587",
SMTP_USER: process.env.SMTP_USER!,
SMTP_PASS: process.env.SMTP_PASS!,
SMTP_FROM:
  process.env.SMTP_FROM || "ApexGlobalEarnings <no-reply@apexglobalearnings.com>",
CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

};
