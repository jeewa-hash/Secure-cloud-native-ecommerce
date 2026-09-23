import express from "express";
import authUser from "../middleware/authUser.js";
import requireDeliveryRole from "../middleware/requireDeliveryRole.js";
import {
  createDeliveryProfile,
  getMyDeliveryProfile,
  updateMyDeliveryProfile,
  updateAvailabilityStatus,
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post(
  "/delivery-persons",
  authUser,
  requireDeliveryRole,
  createDeliveryProfile
);

router.get(
  "/delivery-profile",
  authUser,
  requireDeliveryRole,
  getMyDeliveryProfile
);

router.put(
  "/delivery-profile",
  authUser,
  requireDeliveryRole,
  updateMyDeliveryProfile
);

router.patch(
  "/delivery-profile/availability",
  authUser,
  requireDeliveryRole,
  updateAvailabilityStatus
);

export default router;