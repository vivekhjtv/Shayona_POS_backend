const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const ItemsListSchema = new Schema({
  items: [ItemSchema],
  date: { type: String, required: true },
  time: { type: String, required: true },
});

module.exports = mongoose.model('ItemsList', ItemsListSchema);
