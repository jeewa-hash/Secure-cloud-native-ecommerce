import express from "express";
import authUser from "../middleware/authUser.js";
import requireDeliveryRole from "../middleware/requireDeliveryRole.js";
import {
  getMyShipments,
  getMyShipmentById,
  markShipmentPickedUp,
  markShipmentInTransit,
  markShipmentDelivered,
  markShipmentFailed,
  markReturnInTransit,
  markReturnedToShop,
} from "../controllers/shipmentController.js";

const router = express.Router();

router.get("/shipments/my", authUser, requireDeliveryRole, getMyShipments);
router.get("/shipments/:id", authUser, requireDeliveryRole, getMyShipmentById);

router.patch("/shipments/:id/pickup", authUser, requireDeliveryRole, markShipmentPickedUp);
router.patch("/shipments/:id/in-transit", authUser, requireDeliveryRole, markShipmentInTransit);
router.patch("/shipments/:id/deliver", authUser, requireDeliveryRole, markShipmentDelivered);
router.patch("/shipments/:id/fail", authUser, requireDeliveryRole, markShipmentFailed);
router.patch("/shipments/:id/return", authUser, requireDeliveryRole, markReturnInTransit);
router.patch("/shipments/:id/returned", authUser, requireDeliveryRole, markReturnedToShop);

export default router;