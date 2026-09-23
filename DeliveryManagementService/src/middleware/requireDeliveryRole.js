const requireDeliveryRole = (req, res, next) => {
    if (req.userRole !== "delivery") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Delivery role required.",
      });
    }
  
    next();
  };
  
  export default requireDeliveryRole;