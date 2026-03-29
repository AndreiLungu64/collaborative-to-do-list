/**
 * @module services/auth.service
 * @description Business logic for authentication: registration, login, token generation.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { JWT_SECRET } = require('../config/env');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';

const AuthService = {
  /**
   * Register a new user.
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<{ user: Object, token: string }>}
   * @throws {Error} If email/username already taken
   */
  async register({ username, email, password }) {
    // Check for existing user
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      const err = new Error('Acest email este deja folosit.');
      err.statusCode = 409;
      throw err;
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      const err = new Error('Acest username este deja folosit.');
      err.statusCode = 409;
      throw err;
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return { user, token };
  },

  /**
   * Authenticate a user.
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ user: Object, token: string }>}
   * @throws {Error} If credentials are invalid
   */
  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error('Email sau parolă incorectă.');
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const err = new Error('Email sau parolă incorectă.');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
    };
  },
};

module.exports = AuthService;
