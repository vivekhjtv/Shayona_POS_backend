const express = require('express');
const router = express.Router();
const db = require('../config/database');

router
  .get('/', async (req, res) => {
    try {
      const orders = await db.getOrderForms();
      console.log(orders);
      res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post('/', async (req, res) => {
    try {
      const newStoreItem = await db.addNewOrderForms(req.body);
      res.status(201).json(newStoreItem);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .put('/:id', async (req, res) => {
    const orderId = req.params.id;
    const updatedOrder = req.body;
    console.log(orderId);
    try {
      const result = await db.updateOrderForm(orderId, updatedOrder);
      if (!result) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(200).json(result);
    } catch (err) {
      console.error('Error updating order:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .delete('/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
      const deletedOrder = await db.deleteOrderForm(orderId);
      if (!deletedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
      console.error('Error deleting order:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
