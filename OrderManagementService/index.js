import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import shopOrderRoutes from "./routes/shopOrderRoutes.js";
import { swaggerUi, specs } from './swagger.config.js';

const app = express();

// Trust AWS ALB proxy
app.set('trust proxy', true);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://localhost:4000',
  'http://order-frontend-bucket-123.s3-website.eu-north-1.amazonaws.com',
  'http://orderservice-alb-1335748857.eu-north-1.elb.amazonaws.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    }
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', ...swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", shopOrderRoutes); 

// Test route
app.get('/', (req, res) => {
  res.send('Order Management Backend is WORKING✅');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('Mongo URI is missing!');
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Database connected successfully');
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });