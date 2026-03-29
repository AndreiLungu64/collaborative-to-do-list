/**
 * @module models/user.model
 * @description Data access layer for the users table.
 * All SQL lives here — controllers never touch raw queries.
 */
const db = require('../config/db');

const UserModel = {
  /**
   * Find a user by email address.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by username.
   * @param {string} username
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user.
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<Object>} Created user (without password)
   */
  async create({ username, email, password }) {
    const result = await db.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, password]
    );
    return result.rows[0];
  },

  /**
   * Get all users (for assignee picker). Returns only public fields.
   * @returns {Promise<Array>}
   */
  async findAll() {
    const result = await db.query(
      'SELECT id, username, email FROM users ORDER BY username'
    );
    return result.rows;
  },
};

module.exports = UserModel;
