require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const produceRoutes = require('./routes/produce');
const orderRoutes = require('./routes/order');
const analyticsRoutes = require('./routes/analytics');
const messageRoutes = require('./routes/message');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless development testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mounting Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);

// Base Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgroBridge Backend API is active and healthy!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`AgroBridge Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
});

module.exports = app;
