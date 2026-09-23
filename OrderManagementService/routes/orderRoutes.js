import express from "express";
import authUser from "../middleware/auth.js";

import { checkoutOrder, getOrders } from "../controllers/orderController.js";
import { orderSuccessInterceptor } from "@notification-app/shared";


const router = express.Router();


router.post("/checkout", authUser, orderSuccessInterceptor, checkoutOrder);
router.get("/history", authUser, getOrders);




export default router;

