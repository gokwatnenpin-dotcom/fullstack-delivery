import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const migration = await fs.readFile(path.join(directory, 'migrations/001_initial.sql'), 'utf8');

try {
  await pool.query(migration);
  console.log('Database migration completed.');
} finally {
  await pool.end();
}
