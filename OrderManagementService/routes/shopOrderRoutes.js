import express from "express";
import authShop from "../middleware/authShop.js";
import { updateOrderStatusByShopOwner, ordersByShop, updateShopOrderStatus } from "../controllers/shopOrderController.js";

const router = express.Router();

// get all orders for a shop
router.get("/shop/orders", authShop, ordersByShop);

// update order status
//router.put("/shop/orders/:orderId/status", authShop, updateOrderStatusByShopOwner);

router.put("/shop/orders/:orderId/status", authShop, updateShopOrderStatus);
export default router;