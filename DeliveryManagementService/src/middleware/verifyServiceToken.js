const verifyServiceToken = (req, res, next) => {
    const token = req.headers["x-service-token"];
  
    if (!token || token !== process.env.SERVICE_TO_SERVICE_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized internal service request.",
      });
    }
  
    next();
  };
  
  export default verifyServiceToken;