/**
 * @module config/env
 * @description Centralized environment variable access with validation.
 * Fails fast if required vars are missing — no silent runtime errors.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`[FATAL] Missing required env variable: ${v}`);
    process.exit(1);
  }
}

export const DATABASE_URL: string = process.env.DATABASE_URL!;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const PORT: number = parseInt(process.env.PORT || '5000', 10);
export const NODE_ENV: string = process.env.NODE_ENV || 'development';
