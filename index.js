require('dotenv').config();  // ← MUST be first so all process.env.* are available when modules load
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

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS configuration — must list explicit origins when credentials: true
app.use(
  cors({
    origin: [
      'https://shayona-orders.vercel.app',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(cookieParser());

// Register routes immediately at the top level (required for Vercel serverless)
// On Vercel, routes MUST be registered before the first request hits.
// Placing them inside db.initialize().then() caused a race condition.
const db = require('./config/database');
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/store-order', storeRoutes);
app.use('/api/store', storesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orderForm', orderFormRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Connect to database (non-blocking — does not delay route registration)
db.initialize(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Start the server only in local development (Vercel serverless ignores app.listen)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
