const express = require('express');
const router = express.Router();
const db = require('../config/database');

router
  .get('/', async (req, res) => {
    try {
      const orders = await db.getAllStock();
      res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post('/', async (req, res) => {
    try {
      const newStoreItem = await db.addStock(req.body);
      res.status(201).json(newStoreItem);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .put('/:item', async (req, res) => {
    const { item } = req.params;
    const { count } = req.body;

    try {
      const updateFields = { [item]: count };
      const updatedStock = await db.updateStockCount(updateFields);
      res.status(200).json(updatedStock);
    } catch (err) {
      console.error('Error updating stock count:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
router.route('/:orderId').delete(async (req, res) => {
  try {
    const deletedItem = await db.deleteStockOrder(req.params.orderId);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.status(200).json({ message: 'Stock deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
