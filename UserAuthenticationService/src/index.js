import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware (Fix V08): Helmet sets secure HTTP headers and removes X-Powered-By
app.use(helmet());

// CORS Configuration (Fix V08): Restrict cross-origin access to trusted origins only
const allowedOrigins = [
    'http://localhost:3000', // React Frontend local development
    'http://localhost:5173', // Vite Frontend
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL  // Cloud deployed Frontend URL
];


//Before -allow all origins 
//app.use(cors());
//app.use(express.json());

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('The CORS policy for this site does not allow access from the specified origin.'));
            }
        },
        credentials: true
    })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Service is running",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5002; 
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        logger.info('Connected to MongoDB successfully.');
        try {
            await mongoose.connection.collection('users').dropIndex('nic_1');
            logger.info('Dropped legacy index nic_1');
        } catch (e) {
            logger.error('Error occurred while dropping index:', e.message);
        }
        app.listen(PORT, () => {
            logger.info(`User Authentication Service is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1); 
    });
