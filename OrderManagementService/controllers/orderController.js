import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import axios from "axios";

const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL;
const SHIPPING_FEES = Object.freeze({
  standard: 109,
  express: 250,
});

// Read current product data from the trusted Shop service. Checkout must not
// fall back to client-influenced cart prices when this service is unavailable.
async function fetchProduct(productId) {
  try {
    // SHOP_SERVICE_URL already includes /api/products; append only the product ID.
    const response = await axios.get(`${SHOP_SERVICE_URL}/${productId}`);
    return response.data || null;
  } catch (error) {
    console.error("Product fetch failed:", error.message);
    return null;
  }
}

// CHECKOUT ORDER
export const checkoutOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { address, zipCode, phone, paymentMethod = "cod", deliveryType, instructions = "" } = req.body;

    // Security fix (V04): reject client-supplied financial values. The client may
    // choose a delivery type, but the fee and all order totals are server-calculated.
    const clientFinancialFields = ["price", "prices", "subtotal", "shippingFee", "deliveryFee", "total"];
    if (clientFinancialFields.some((field) => Object.hasOwn(req.body, field))) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Prices and shipping fees are calculated by the server.",
      });
    }

    if (!Object.prototype.hasOwnProperty.call(SHIPPING_FEES, deliveryType)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid delivery type." });
    }

    const shippingFee = SHIPPING_FEES[deliveryType];

    // Validate required fields
    const requiredFields = ["address", "zipCode", "phone", "deliveryType"];
    const missingFields = requiredFields.filter(f => !req.body[f]);
    if (missingFields.length) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.userId }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // Group items by shop
    const itemsByShop = {};
    cart.items.forEach(item => {
      const shopId = item.shop._id;
      if (!itemsByShop[shopId]) itemsByShop[shopId] = [];
      itemsByShop[shopId].push(item);
    });

    const createdOrders = [];

    for (const [shopId, items] of Object.entries(itemsByShop)) {
      const validatedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const productData = await fetchProduct(item.product);
        if (!productData) {
          await session.abortTransaction();
          return res.status(503).json({
            success: false,
            message: "Product pricing is temporarily unavailable. Please try again.",
          });
        }

        // Security fix (V04): never use the cart's stored price as a fallback;
        // stale or tampered cart data must not determine the charged amount.
        const price = productData.price;
        if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
          await session.abortTransaction();
          return res.status(503).json({
            success: false,
            message: "Trusted product pricing is invalid. Please try again later.",
          });
        }
        if (productData.isAvailable === false) {
          await session.abortTransaction();
          return res.status(409).json({
            success: false,
            message: "A product in your cart is no longer available.",
          });
        }
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
          await session.abortTransaction();
          return res.status(400).json({ success: false, message: "Cart contains an invalid quantity." });
        }

        validatedItems.push({
          product: item.product,
          name: productData.name,
          price,
          image: productData.image,
          quantity: item.quantity,
        });
        subtotal += price * item.quantity;
      }

      const total = subtotal + shippingFee;

      const order = new Order({
        user: req.userId,
        shop: {
          _id: shopId,
          name: items[0].shop.name,
          logo: items[0].shop.logo,
        },
        items: validatedItems,
        address,
        zipCode,
        phone,
        paymentMethod,
        paymentStatus: "pending",
        deliveryType,
        instructions,
        shippingFee,
        subtotal,
        total,
        status: "pending",
        timeline: [{ status: "pending" }],
      });

      await order.save({ session });
      createdOrders.push(order);
    }

    // Clear cart after checkout
    await Cart.deleteOne({ _id: cart._id }).session(session);

    await session.commitTransaction();
    res.status(201).json({ success: true, orders: createdOrders });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ==========================================================
// GET USER ORDERS
// ==========================================================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort("-createdAt")
      .lean();

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================================
// GET SHOP ORDERS
// ==========================================================
export const getShopOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "shop._id": req.shopId })
      .sort("-createdAt")
      .lean();

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================================
// UPDATE ORDER STATUS (SHOP OWNER)
// ==========================================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending","accepted","preparing","ready","picked-up","delivered","completed","declined"];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, $push: { timeline: { status } } },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
