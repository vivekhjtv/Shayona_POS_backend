const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Stock = require('../models/stock');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, key, price, image, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields (name, price)' });
    }

    // Auto-generate key from name if not provided
    const productKey = (key || name)
      .toLowerCase()
      .trim()
      .replace(/[_\s-]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const newProduct = await db.addNewProduct({
      name,
      key: productKey,
      price: Number(price),
      image: image || 'default_item.jpeg',
      imageUrl: imageUrl || '',
    });

    // Automatically initialize stock to '0' in the latest StockOrder document
    const latestStock = await Stock.findOne().sort({ _id: -1 });
    if (latestStock) {
      const updateFields = { [productKey]: '0' };
      await Stock.findByIdAndUpdate(latestStock._id, { $set: updateFields });
      console.log(`Stock count for new item "${productKey}" initialized to 0`);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Item key or name already exists' });
    }
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, key, price, image, imageUrl } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (key) {
      updateData.key = key
        .toLowerCase()
        .trim()
        .replace(/[_\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    }
    if (price !== undefined) updateData.price = Number(price);
    if (image) updateData.image = image;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedProduct = await db.updateProduct(req.params.id, updateData);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await db.deleteProduct(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
