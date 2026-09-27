import express from "express";
import { getUserNotifications } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Secure notification retrieval with JWT authentication middleware (Fix V07: IDOR)
router.get("/:recipientId", protect, getUserNotifications);

export default router;