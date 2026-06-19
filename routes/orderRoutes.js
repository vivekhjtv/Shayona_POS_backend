const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.use('/api/orders/', (req, res, next) => {
  next();
});

// /api/orders
router
  .route('/')
  .get(async (req, res) => {
    try {
      const { page = 1, limit = 10, item = 'All', date } = req.query;
      const result = await db.getOrdersPaginated(page, limit, item, date || null);
      res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post(async (req, res) => {
    try {
      console.log('Received store order data:', req.body);
      const newItem = await db.addDoneOrders(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
