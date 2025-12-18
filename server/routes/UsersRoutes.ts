import express from 'express';
import { registerUser, loginUser, updateUser } from '../controllers/UsersController.js';

// Creating an instance of Express router
const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);

export { router as UsersRoutes };

