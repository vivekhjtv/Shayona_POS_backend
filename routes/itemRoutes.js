const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.use('/api/items/', (req, res, next) => {
  next();
});

// /api/items
router
  .route('/')
  .get(async (req, res) => {
    try {
      const items = await db.getAllItems();
      res.status(200).json(items);
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post(async (req, res) => {
    try {
      console.log(req.body);
      const newItem = await db.addNewItem(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      console.error('Error adding new items:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.route('/:itemId').delete(async (req, res) => {
  try {
    const deletedItem = await db.deleteItem(req.params.itemId);
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
