/**
 * @module controllers/auth.controller
 * @description Handles HTTP request/response for auth endpoints.
 * Thin layer — delegates all logic to AuthService.
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AuthService from '../services/auth.service';
import UserModel from '../models/user.model';
import { AuthRequest } from '../types';

const AuthController = {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const { username, email, password } = req.body;
      const result = await AuthService.register({ username, email, password });

      res.status(201).json({
        message: 'Cont creat cu succes!',
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      res.status(200).json({
        message: 'Autentificare reușită!',
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me — Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const user = await UserModel.findById(authReq.user.id);
      if (!user) {
        res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users — List all users (for assignee picker)
   */
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};

export default AuthController;
