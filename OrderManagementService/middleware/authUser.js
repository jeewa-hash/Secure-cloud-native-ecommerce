import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.user?.id || decoded.id;
    req.userRole = decoded.user?.role || decoded.role;
    req.user = decoded.user || decoded;

    if (!req.userId || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    next();
  } catch (error) {
    console.error("authUser middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid token. Login again.",
    });
  }
};

export default authUser;