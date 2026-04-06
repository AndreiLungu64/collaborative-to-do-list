/**
 * @module config/db
 * @description PostgreSQL connection pool using `pg`.
 * Connects to the remote shared database instance.
 */
import { Pool, QueryResult } from 'pg';
import { DATABASE_URL } from './env';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Keep a small pool — this is a shared student DB
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected DB pool error', { error: err.message });
});

/**
 * Execute a parameterized query against the database.
 * @param text - SQL query string with $1, $2 placeholders
 * @param params - Parameter values
 */
const query = (text: string, params?: unknown[]): Promise<QueryResult> =>
  pool.query(text, params);

export { query, pool };
