import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional(),
  EMAIL_SERVICE: z.string().default('gmail'),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  SESSION_SECRET: z.string(),
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
});

const configResult = configSchema.safeParse(process.env);

if (!configResult.success) {
  console.error('Invalid configuration:', configResult.error.format());
  process.exit(1);
}

export const config = configResult.data;

export default config;