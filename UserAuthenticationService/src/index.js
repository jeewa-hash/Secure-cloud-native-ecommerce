import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
