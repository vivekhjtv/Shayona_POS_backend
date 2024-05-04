const mongoose = require('mongoose');
const Item = require('../models/item');
const Order = require('../models/order');

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

  addNewItem: (data) => {
    const newItem = new Item(data);
    return newItem.save();
  },
  // add order
  addDoneOrders: (data) => {
    const orderItem = new Order(data);
    return orderItem.save();
  },
  //delete order form items table.
  deleteItem: (orderId) => {
    console.log(' database - ' + orderId);
    return Item.deleteOne({ _id: orderId });
  },
};

module.exports = db;
