const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderListSchema = new Schema({
  orders: [OrderSchema],
});

module.exports = mongoose.model('OrdersList', OrderListSchema);
