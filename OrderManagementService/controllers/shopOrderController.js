import Order from "../models/Order.js";
import { getAllowedNextStatuses } from "../utils/orderStatusFlow.js";
import { requestDeliveryAssignment } from "../services/deliveryClient.js";


//Chaw
// GET SHOP ORDERS

export const ordersByShop = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { "shop._id": req.shopId };

    // optional filter by status
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE ORDER STATUS (SHOP OWNER ONLY)

export const updateOrderStatusByShopOwner = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "picked-up",
      "delivered",
      "completed",
      "declined",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find order that belongs to the logged-in shop owner
    const order = await Order.findOne({
      _id: orderId,
      "shop._id": req.shopId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this shop",
      });
    }

    order.status = status;
    order.timeline.push({ status, updatedAt: new Date() });

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateShopOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowedNextStatuses = getAllowedNextStatuses(order.status);

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from '${order.status}' to '${status}'.`,
      });
    }

    // Special rule: if moving to "ready", delivery assignment must succeed first
    if (status === "ready") {
      const deliveryAssignment = await requestDeliveryAssignment(order);

      if (!deliveryAssignment?.assigned) {
        return res.status(400).json({
          success: false,
          message:
            deliveryAssignment?.message ||
            "Delivery assignment failed. Order status not updated.",
          deliveryAssignment,
        });
      }

      order.status = "ready";
      order.deliveryAssignmentStatus = "ASSIGNED";
      order.timeline = [
        ...(order.timeline || []),
        {
          status: "ready",
          note: "Order status changed to ready",
          at: new Date(),
        },
        {
          status: "delivery-assigned",
          note: "Delivery person assigned successfully",
          at: new Date(),
        },
      ];

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Order marked as ready and delivery person assigned.",
        order,
        deliveryAssignment,
      });
    }

    // normal updates for other statuses
    order.status = status;
    order.timeline = [
      ...(order.timeline || []),
      {
        status,
        note: `Order status changed to ${status}`,
        at: new Date(),
      },
    ];

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update shop order status error:", error);
    console.error("Request body:", req.body);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};