import express from 'express'
import { registerUser, loginUser, updateUser } from '../controllers/UsersController.js'

// Creating an instance of Express router
const router = express.Router();

// Register user route
router.post('/', registerUser);

// Login user route
router.post('/login', loginUser);

// Login user route
router.put('/:id', updateUser);

export { router as UsersRoutes }