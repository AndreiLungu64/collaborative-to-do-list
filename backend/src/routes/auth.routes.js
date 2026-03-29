/**
 * @module routes/auth.routes
 * @description Auth routes with input validation rules.
 */
const { Router } = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username-ul trebuie să aibă între 3 și 50 de caractere.'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalid.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Parola trebuie să aibă cel puțin 6 caractere.'),
  ],
  AuthController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalid.'),
    body('password').notEmpty().withMessage('Parola este obligatorie.'),
  ],
  AuthController.login
);

// GET /api/auth/me — Protected
router.get('/me', auth, AuthController.getProfile);

module.exports = router;
