import Cart from "../models/Cart.js";
import axios from "axios";

const sameProduct = (a, b) => a.toString() === b.toString();


// Fetch product from Shop Service
// ------------------------------
async function fetchProduct(productId) {
  try {
    // 👇 Use environment variable for service URL
    const shopServiceUrl = process.env.SHOP_SERVICE_URL || 'http://localhost:4040/api';
    const response = await axios.get(`${shopServiceUrl}/products/${productId}`);

    return response.data || null;

  } catch (error) {
    console.error("❌ Product fetch failed:", error.message);
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);

    return null;
  }
}

// ------------------------------
// ADD TO CART
// ------------------------------
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const product = await fetchProduct(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find((item) =>
      sameProduct(item.product, productId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        shop: {
          _id: product.shopId,
          name: product.shopName,
          logo: product.shopLogo,
        },
      });
    }

    await cart.save();

    const cartData = await Cart.findOne({ user: userId }).lean();

    res.json({ success: true, cart: cartData });

  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ------------------------------
// GET CART
// ------------------------------
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ user: userId }).lean();

    res.json({
      success: true,
      cart: cart || { items: [] },
    });

  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ------------------------------
// UPDATE QUANTITY
// ------------------------------
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const index = cart.items.findIndex(
      (item) =>
        item.product &&
        item.product.toString() === productId.toString()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity === 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }

    await cart.save();

    const updated = await Cart.findOne({ user: userId }).lean();

    res.json({ success: true, cart: updated });

  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ------------------------------
// REMOVE ITEM
// ------------------------------
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(item.product && item.product.toString() === productId.toString())
    );

    await cart.save();

    const updated = await Cart.findOne({ user: userId }).lean();

    res.json({ success: true, cart: updated });

  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ------------------------------
// CLEAR CART
// ------------------------------
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];

    await cart.save();

    const updated = await Cart.findOne({ user: userId }).lean();

    res.json({
      success: true,
      message: "Cart cleared",
      cart: updated,
    });

  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};