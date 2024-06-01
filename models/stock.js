const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockSchema = new Schema({
  khichadi: { type: String, required: true },
  pav_bhaji: { type: String, required: true },
  lot: { type: String, required: true },
  veg_pizza: { type: String, required: true },
  cheese_pizza: { type: String, required: true },
  thali: { type: String, required: true },
  easternDate: { type: String, required: true },
  easternTime: { type: String, required: true },
});

module.exports = mongoose.model('StockOrder', StockSchema);
