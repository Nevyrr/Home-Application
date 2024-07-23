import express, { Router } from 'express'
import { registerUser, loginUser } from '../controllers/UsersController.js'

// Creating an instance of Express router
const router: Router = express.Router()

// Register user route
router.post('/', registerUser)

// Login user route
router.post('/login', loginUser)

export { router as UsersRoutes }