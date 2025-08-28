import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getProfile
} from '../controllers/authController.js';

const router = Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.post('/logout', optionalAuth, logout);
router.post('/change-password', authenticateToken, changePassword);
router.put('/profile', authenticateToken, updateProfile);
router.get('/profile', authenticateToken, getProfile);

export default router;