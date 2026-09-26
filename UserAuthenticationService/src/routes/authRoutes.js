import express from 'express';
import { register, login, createAdmin } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/users',authenticateToken,requireAdmin,createAdmin);

export default router;
