import jwt from "jsonwebtoken";

const authShop = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token
    if (
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check token existence
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again.",
      });
    }

    // 3. Verify token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check role
    if (token_decode.user.role !== "shop") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a shop owner.",
      });
    }

    // 5. Attach to request 
    req.userId = token_decode.user.id;
    req.userRole = token_decode.user.role;
    req.shopId = token_decode.user.id;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid Token. Login Again.",
    });
  }
};

export default authShop;