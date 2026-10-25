import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getProfile,
  updateProfile,
  getAdministrators,
  createAdministrator
} from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.patch('/profile', authenticate, updateProfile);

// Administrator-only provisioning routes
router.get('/administrators', authenticate, requireAdmin, getAdministrators);
router.post('/administrators', authenticate, requireAdmin, createAdministrator);

export default router;
