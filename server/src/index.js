const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet());

// ---------------------
// CORS Configuration
// ---------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------
// Body Parsing
// ---------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------
// Cookie Parser
// ---------------------
app.use(cookieParser());

// ---------------------
// HTTP Request Logging
// ---------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ---------------------
// Static Files
// ---------------------
app.use('/uploads', express.static('uploads'));

// ---------------------
// Health Check
// ---------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickBite API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------
// API Routes
// ---------------------
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Future routes (to be added in subsequent commits)
const restaurantRoutes = require('./routes/restaurantRoutes');
const cloudKitchenRoutes = require('./routes/cloudKitchenRoutes');
const menuRoutes = require('./routes/menuRoutes');
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cloud-kitchens', cloudKitchenRoutes);
app.use('/api/menu', menuRoutes);

const groceryRoutes = require('./routes/groceryRoutes');
const donationRoutes = require('./routes/donationRoutes');
app.use('/api/grocery', groceryRoutes);
app.use('/api/donations', donationRoutes);

// app.use('/api/orders', orderRoutes);
// app.use('/api/deliveries', deliveryRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/admin', adminRoutes);

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ---------------------
// Global Error Handler
// ---------------------
app.use(errorHandler);

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 QuickBite server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`💥 Uncaught Exception: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
