const express = require('express');
const router = express.Router();
const db = require('../config/database');

router
  .get('/', async (req, res) => {
    try {
      const orders = await db.getAllStoreOrders();
      res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post('/', async (req, res) => {
    try {
      // console.log('Received store order data:', req.body);
      const newStoreItem = await db.addNewStoreOrder(req.body);

      res.status(201).json(newStoreItem);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.route('/:itemId').delete(async (req, res) => {
    try {
      const deletedItem = await db.deleteStore(req.params.itemId);
      if (!deletedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
      console.error('Error deleting item:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
