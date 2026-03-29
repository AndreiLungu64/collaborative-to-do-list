/**
 * @module config/db
 * @description PostgreSQL connection pool using `pg`.
 * Connects to the remote shared database instance.
 */
const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Keep a small pool — this is a shared student DB
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected DB pool error', { error: err.message });
});

/**
 * Execute a parameterized query against the database.
 * @param {string} text - SQL query string with $1, $2 placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
