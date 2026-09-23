import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Delivery Management Service is running"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "delivery-service"
  });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// API Routes
app.use("/delivery", deliveryRoutes);
app.use("/delivery", shipmentRoutes);
app.use("/delivery", assignmentRoutes);

// Database Connection & Server Start
const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info("Delivery Service DB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Delivery Management Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("DB Connection Error:", err.message);
  });