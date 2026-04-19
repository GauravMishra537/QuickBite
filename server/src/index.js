const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { initSocket } = require('./config/socket');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet({
  contentSecurityPolicy: false,
}));

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

const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/bookings', bookingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// ---------------------
// Production: Serve React Client
// ---------------------
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));

  // All non-API routes → React app (SPA client-side routing)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  // Dev-only 404 for API routes
  app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
  });
}

// ---------------------
// Global Error Handler
// ---------------------
app.use(errorHandler);

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 QuickBite server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Socket.IO attached`);
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
