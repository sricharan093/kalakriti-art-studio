import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_art_studio_jwt_token_key_change_in_production_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server authentication error' });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. ${role} role required.` });
    }
    next();
  };
};

export const requireCustomer = requireRole('CUSTOMER');
export const requireAdmin = requireRole('ADMIN');

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) {
      return next();
    }
    const secret = process.env.JWT_SECRET || 'super_secret_art_studio_jwt_token_key_change_in_production_2026';
    try {
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // ignore invalid token for optional auth
    }
    next();
  } catch (error) {
    next();
  }
};

