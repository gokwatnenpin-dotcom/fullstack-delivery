import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendDirectory, '.env') });
const databaseUrl = (process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/modern_healthcare').trim().replace(/\s+/g, '');

const { Pool } = pg;

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com') || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);
