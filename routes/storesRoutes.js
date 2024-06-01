const express = require('express');
const router = express.Router();
const db = require('../config/database');

router
  .get('/', async (req, res) => {
    try {
      const orders = await db.getAllStoreFinalOrders();
      res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post('/', async (req, res) => {
    try {
      // console.log('routes --- ', req.body);
      // console.log('Received store order data:', req.body);
      const newStoreItem = await db.addStoreFinalOrder(req.body);

      res.status(201).json(newStoreItem);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
