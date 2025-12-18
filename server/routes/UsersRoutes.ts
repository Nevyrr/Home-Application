import express from 'express';
import { registerUser, loginUser, updateUser, refreshToken, verifyAuth, logout } from '../controllers/UsersController.js';
import { validate } from '../utils/validation.js';
import { registerSchema, loginSchema, updateUserSchema } from '../utils/validation.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import auth from '../middlewares/auth.js';
import { z } from 'zod';

// Creating an instance of Express router
const router = express.Router();

// Public routes
router.post('/', validate(registerSchema), asyncHandler(registerUser));
router.post('/login', validate(loginSchema), asyncHandler(loginUser));
router.post('/refresh', validate(z.object({ refreshToken: z.string() })), asyncHandler(refreshToken));

// Protected routes
router.get('/verify', auth, asyncHandler(verifyAuth));
router.post('/logout', auth, asyncHandler(logout));
router.put('/:id', auth, validate(updateUserSchema), asyncHandler(updateUser));

export { router as UsersRoutes };

