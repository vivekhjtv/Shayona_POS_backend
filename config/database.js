const mongoose = require('mongoose');
const Item = require('../models/item');
const Order = require('../models/order');
const StoreOrder = require('../models/storeOrder');
const Stock = require('../models/stock');
const Store = require('../models/stores');
const OrderForm = require('../models/orderForm');

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
};

module.exports = db;
