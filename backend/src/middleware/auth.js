/**
 * @module middleware/auth
 * @description JWT authentication middleware.
 * Extracts token from Authorization header, verifies it,
 * and attaches decoded user to req.user.
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nu ești autentificat. Trimite un token JWT valid.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid sau expirat.' });
  }
};

module.exports = auth;
