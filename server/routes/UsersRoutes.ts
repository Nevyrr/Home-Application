import express from 'express';
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  updateUser,
  forgotPassword,
  resetPassword,
  listUsers,
  updateUserAccess,
  deleteUserAccount,
  refreshToken,
  verifyAuth,
  logout,
} from '../controllers/UsersController.js';
import { validate } from '../utils/validation.js';
import { adminUserRoleSchema, forgotPasswordSchema, registerSchema, loginSchema, resetPasswordSchema, updateUserSchema } from '../utils/validation.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import auth from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/access.js';
import { z } from 'zod';

// Creating an instance of Express router
const router = express.Router();

// Public routes
router.post('/', validate(registerSchema), asyncHandler(registerUser));
router.post('/login', validate(loginSchema), asyncHandler(loginUser));
router.post('/google', validate(z.object({ credential: z.string().min(1) })), asyncHandler(loginWithGoogle));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post('/refresh', validate(z.object({ refreshToken: z.string() })), asyncHandler(refreshToken));

// Protected routes
router.get('/', auth, requireAdmin, asyncHandler(listUsers));
router.get('/verify', auth, asyncHandler(verifyAuth));
router.post('/logout', auth, asyncHandler(logout));
router.patch('/:id/access', auth, requireAdmin, validate(adminUserRoleSchema), asyncHandler(updateUserAccess));
router.delete('/:id', auth, requireAdmin, asyncHandler(deleteUserAccount));
router.put('/:id', auth, validate(updateUserSchema), asyncHandler(updateUser));

export { router as UsersRoutes };

