/**
 * @module models/user.model
 * @description Data access layer for the users table.
 * All SQL lives here — controllers never touch raw queries.
 */
import * as db from '../config/db';
import { User } from '../types';

const UserModel = {
  /**
   * Find a user by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by username.
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by ID.
   */
  async findById(id: number): Promise<User | null> {
    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ username, email, password }: { username: string; email: string; password: string }): Promise<User> {
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
   */
  async findAll(): Promise<User[]> {
    const result = await db.query(
      'SELECT id, username, email FROM users ORDER BY username'
    );
    return result.rows;
  },
};

export default UserModel;
