/**
 * @module services/auth.service
 * @description Business logic for authentication: registration, login, token generation.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';
import { JWT_SECRET } from '../config/env';
import { RegisterInput, LoginInput, AuthResult, AppError } from '../types';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';

const AuthService = {
  /**
   * Register a new user.
   */
  async register({ username, email, password }: RegisterInput): Promise<AuthResult> {
    // Check for existing user
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      const err = new Error('Acest email este deja folosit.') as AppError;
      err.statusCode = 409;
      throw err;
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      const err = new Error('Acest username este deja folosit.') as AppError;
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
   */
  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const err = new Error('Email sau parolă incorectă.') as AppError;
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid) {
      const err = new Error('Email sau parolă incorectă.') as AppError;
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

export default AuthService;
