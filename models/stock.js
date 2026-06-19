const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockSchema = new Schema({
  khichadi: { type: String },
  pav_bhaji: { type: String },
  lot: { type: String },
  veg_pizza: { type: String },
  cheese_pizza: { type: String },
  thali: { type: String },
  pesto: { type: String },
  chat: { type: String },
  lemonade: { type: String },
  tea: { type: String },
  coffee: { type: String },
  easternDate: { type: String, required: true },
  easternTime: { type: String, required: true },
}, { strict: false });

module.exports = mongoose.model("StockOrder", StockSchema);
