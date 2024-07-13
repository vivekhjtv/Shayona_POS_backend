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
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Connect to database before starting server
const db = require('./config/database');
db.initialize(process.env.DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');

    // Set up routes
    app.use('/api/items', itemRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/store-order', storeRoutes);
    app.use('/api/store', storesRoutes);
    app.use('/api/stock', stockRoutes);
    app.use('/api/orderForm', orderFormRoutes);

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    // Consider exiting the application here or implementing more robust error handling
  });

module.exports = app; // Optional, if you need to export the app instance for testing
