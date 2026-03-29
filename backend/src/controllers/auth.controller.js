/**
 * @module controllers/auth.controller
 * @description Handles HTTP request/response for auth endpoints.
 * Thin layer — delegates all logic to AuthService.
 */
const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const UserModel = require('../models/user.model');

const AuthController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
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
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
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
  async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/users — List all users (for assignee picker)
   */
  async listUsers(req, res, next) {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
