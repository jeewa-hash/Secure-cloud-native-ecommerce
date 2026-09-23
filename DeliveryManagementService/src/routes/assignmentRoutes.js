import express from "express";
import verifyServiceToken from "../middleware/verifyServiceToken.js";
import { assignOrderInternally } from "../controllers/assignmentController.js";

const router = express.Router();

router.post(
  "/internal/assign-order",
  verifyServiceToken,
  assignOrderInternally
);

export default router;