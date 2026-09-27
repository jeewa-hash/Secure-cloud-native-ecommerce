import express from 'express';
import { getUserById, getShops, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/shops', getShops);
router.get('/:id', getUserById);
// Secure profile update endpoint with JWT authentication middleware (Fix V02: BOLA/IDOR)
router.put('/:id', protect, updateUserProfile);

export default router;

