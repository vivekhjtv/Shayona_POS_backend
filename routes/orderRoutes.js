const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.use('/api/orders/', (req, res, next) => {
  next();
});

// /api/orders
router.route('/').post(async (req, res) => {
  try {
    // console.log(req.body);
    const newItem = await db.addDoneOrders(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error adding new items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
