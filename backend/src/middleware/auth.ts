/**
 * @module middleware/auth
 * @description JWT authentication middleware.
 * Extracts token from Authorization header, verifies it,
 * and attaches decoded user to req.user.
 */
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Nu ești autentificat. Trimite un token JWT valid.' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalid sau expirat.' });
  }
};

export default auth;
