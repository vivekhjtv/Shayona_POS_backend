require('dotenv').config(); // ← MUST be first
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const storeRoutes = require('./routes/storeRoutes');
const storesRoutes = require('./routes/storesRoutes');
const stockRoutes = require('./routes/stockRoutes');
const orderFormRoutes = require('./routes/orderFormRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const port = process.env.PORT || 8000;

// Body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS — allow all origins so it works on Render, Vercel, and local dev
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, server-to-server)
      // and any browser origin
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(cookieParser());

// Health check — useful for Render uptime pings
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Register all API routes
const db = require('./config/database');
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/store-order', storeRoutes);
app.use('/api/store', storesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orderForm', orderFormRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Global error handler — catches any unhandled errors in routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB
db.initialize(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Start server (Vercel/Render serverless ignores app.listen in production but it's safe to keep)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  // On Render (non-serverless), we DO need to listen
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
