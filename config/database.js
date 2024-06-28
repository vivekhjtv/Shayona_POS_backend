const mongoose = require('mongoose');
const Item = require('../models/item');
const Order = require('../models/order');
const StoreOrder = require('../models/storeOrder');
const Stock = require('../models/stock');
const Store = require('../models/stores');

const db = {
  initialize: async (url) => {
    try {
      await mongoose.connect(url);
      console.log('Successfully connected to the database');
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
};

module.exports = db;
