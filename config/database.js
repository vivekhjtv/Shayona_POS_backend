const mongoose = require('mongoose');
const Item = require('../models/item');
const Order = require('../models/order');
const StoreOrder = require('../models/storeOrder');
const Stock = require('../models/stock');
const Store = require('../models/stores');
const OrderForm = require('../models/orderForm');
const Product = require('../models/product');

const seedDefaultProducts = async () => {
  try {
    const invalidProducts = await Product.find({ key: { $exists: false } });
    if (invalidProducts.length > 0) {
      console.log('Cleaning up legacy products without key field...');
      await Product.deleteMany({});
    }

    const count = await Product.countDocuments();
    if (count === 0) {
      const defaults = [
        { name: 'Khichadi', key: 'khichadi', price: 5.0, image: 'khichadi.jpeg', sortOrder: 0 },
        { name: 'Pav Bhaji', key: 'pav_bhaji', price: 6.0, image: 'pav_bhaji.jpeg', sortOrder: 1 },
        { name: 'Papdi lot', key: 'lot', price: 3.0, image: 'Khichu-3.jpg', sortOrder: 2 },
        { name: 'Samosa Chat', key: 'chat', price: 5.0, image: 'chat.jpeg', sortOrder: 3 },
        { name: 'Cheese Pizza', key: 'cheese_pizza', price: 6.0, image: 'cheese_pizza.jpeg', sortOrder: 4 },
        { name: 'Veg Pizza', key: 'veg_pizza', price: 7.0, image: 'veg_pizza.webp', sortOrder: 5 },
        { name: 'Pesto Pizza', key: 'pesto', price: 8.0, image: 'pesto.jpeg', sortOrder: 6 },
        { name: 'Extra Pav', key: 'extra_pav', price: 1.0, image: 'extra_pav.jpeg', sortOrder: 7 },
        { name: 'Special Thali', key: 'thali', price: 10.0, image: 'thali.jpeg', sortOrder: 8 },
        { name: 'Lemonade', key: 'lemonade', price: 3.5, image: 'lemonade.jpeg', sortOrder: 9 },
        { name: 'Tea', key: 'tea', price: 2.5, image: 'tea.jpeg', sortOrder: 10 },
        { name: 'Coffee', key: 'coffee', price: 2.5, image: 'coffee.jpeg', sortOrder: 11 },
      ];
      await Product.insertMany(defaults);
      console.log('Successfully seeded default menu items!');
      
      // Also initialize stock count to '0' for seeded items if a StockOrder exists
      const latestStock = await Stock.findOne().sort({ _id: -1 });
      if (latestStock) {
        const updateFields = {};
        defaults.forEach(item => {
          if (latestStock[item.key] === undefined) {
            updateFields[item.key] = '0';
          }
        });
        if (Object.keys(updateFields).length > 0) {
          await Stock.findByIdAndUpdate(latestStock._id, { $set: updateFields });
          console.log('Seeded items stock counts initialized in StockOrder!');
        }
      }
    }
  } catch (err) {
    console.error('Error seeding default products:', err);
  }
};

const db = {
  initialize: async (url) => {
    try {
      await mongoose.connect(url);
      console.log('Successfully connected to the database');
      await seedDefaultProducts();

      // Legacy migration: ensure all products have a sortOrder
      const productsWithoutOrder = await Product.find({ sortOrder: { $exists: false } });
      if (productsWithoutOrder.length > 0) {
        console.log(`Initializing sortOrder for ${productsWithoutOrder.length} products...`);
        for (let i = 0; i < productsWithoutOrder.length; i++) {
          await Product.findByIdAndUpdate(productsWithoutOrder[i]._id, { $set: { sortOrder: i } });
        }
      }
    } catch (err) {
      console.error('Error connecting to the database:', err);
    }
  },

  // items
  getAllItems: () => {
    return Item.find();
  },
  // get orders
  getAllOrders: () => {
    return Order.find();
  },
  getOrdersPaginated: async (page = 1, limit = 10, item = 'All', date = null) => {
    const query = {};
    
    const getItemDbNames = (itemName) => {
      const normalized = itemName.toLowerCase().replace(/[_\s-]+/g, ' ');
      switch (normalized) {
        case 'khichadi':
          return ['khichadi', 'Khichadi'];
        case 'pav bhaji':
          return ['pav_bhaji', 'Pav Bhaji'];
        case 'papadi no lot':
        case 'papadi lot':
        case 'papdi lot':
        case 'lot':
          return ['lot', 'papadi_no_lot', 'papadi lot', 'Papadi lot', 'Papadi no lot', 'Papadi Lot'];
        case 'samosa':
          return ['samosa', 'samosa_chat', 'chat', 'Samosa'];
        case 'puff':
          return ['puff', 'Puff'];
        case 'dabeli':
          return ['dabeli', 'Dabeli'];
        default:
          return [itemName, itemName.toLowerCase()];
      }
    };

    if (item && item !== 'All') {
      const matchNames = getItemDbNames(item);
      query['orders.name'] = { $in: matchNames };
    }
    if (date) {
      query['date'] = date;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, totalOrders] = await Promise.all([
      Order.find(query).skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    let totalQuantity = 0;
    if (item && item !== 'All') {
      const matchNames = getItemDbNames(item);
      const aggResult = await Order.aggregate([
        { $match: query },
        { $unwind: '$orders' },
        { $match: { 'orders.name': { $in: matchNames } } },
        { $group: { _id: null, total: { $sum: '$orders.quantity' } } }
      ]);
      if (aggResult.length > 0) {
        totalQuantity = aggResult[0].total;
      }
    }

    return {
      orders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
      totalOrders,
      totalQuantity
    };
  },
  getAllStock: () => {
    return Stock.find().sort({ createdAt: -1 }); // Assuming 'createdAt' is a timestamp field
  },
  getAllStoreOrders: () => {
    return StoreOrder.find();
  },
  getAllStoreFinalOrders: () => {
    return Store.find();
  },
  addStoreFinalOrder: (data) => {
    // console.log('db --- ', data);
    const newStoreItem = new Store(data);
    return newStoreItem.save();
  },
  addNewItem: (data) => {
    const newItem = new Item(data);
    return newItem.save();
  },
  addNewStoreOrder: (data) => {
    console.log('Store order db---', data);
    const newStoreItem = new StoreOrder(data);
    return newStoreItem.save();
  },
  addStock: (data) => {
    const newStock = new Stock(data);
    return newStock.save();
  },
  // Update stock count for specific items
  updateStockCount: (updateFields) => {
    return Stock.findOneAndUpdate({}, { $set: updateFields }, { new: true });
  },

  // add order
  addDoneOrders: (data) => {
    const orderItem = new Order(data);
    return orderItem.save();
  },
  //delete order from items table.
  deleteItem: (orderId) => {
    return Item.deleteOne({ _id: orderId });
  },
  deleteStockOrder: (orderId) => {
    return Stock.deleteOne({ _id: orderId });
  },
  deleteStore: (orderId) => {
    return StoreOrder.deleteOne({ _id: orderId });
  },

  // form order api
  addNewOrderForms: (data) => {
    const newItem = new OrderForm(data);
    return newItem.save();
  },
  getOrderForms: () => {
    return OrderForm.find();
  },
  updateOrderForm: async (orderId, updatedOrder) => {
    try {
      // Validate if orderId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID');
      }
      console.log(orderId);
      console.log(updatedOrder);
      // Update the order form in the database
      const updatedItem = await OrderForm.findByIdAndUpdate(
        orderId,
        updatedOrder,
        { new: true }
      );

      if (!updatedItem) {
        throw new Error('Order not found');
      }

      return updatedItem;
    } catch (error) {
      throw new Error(`Error updating order form: ${error.message}`);
    }
  },
  deleteOrderForm: async (orderId) => {
    try {
      const deletedOrder = await OrderForm.findByIdAndDelete(orderId);
      return deletedOrder;
    } catch (error) {
      throw new Error(`Error deleting order form: ${error.message}`);
    }
  },
  getAllProducts: () => {
    return Product.find().sort({ sortOrder: 1, name: 1 });
  },
  addNewProduct: async (data) => {
    if (data.sortOrder === undefined) {
      const lastProduct = await Product.findOne().sort({ sortOrder: -1 });
      data.sortOrder = lastProduct ? (lastProduct.sortOrder || 0) + 1 : 0;
    }
    const newProduct = new Product(data);
    await newProduct.save();
    return newProduct;
  },
  updateProduct: (id, data) => {
    return Product.findByIdAndUpdate(id, data, { new: true });
  },
  deleteProduct: (id) => {
    return Product.findByIdAndDelete(id);
  },
  reorderProducts: async (orderedIds) => {
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { sortOrder: index } },
      },
    }));
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }
  },
};

module.exports = db;
