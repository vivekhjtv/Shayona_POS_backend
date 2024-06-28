const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StoreOrderSchema = new Schema({
  samosa: { type: String, required: true },
  puff: { type: String, required: true },
  dabeli: { type: String, required: true },
  lilwa: { type: String, required: true },
  patties: { type: String, required: true },
  veg_pizza: { type: String, required: false },
  cheese_pizza: { type: String, required: false },
  khichadi: { type: String, required: false },
  papadi_no_lot: { type: String, required: false },
  pav_bhaji: { type: String, required: false },
  easternDate: { type: String, required: true },
  easternTime: { type: String, required: true },
  store: { type: String, required: true },
});

module.exports = mongoose.model('StoreOrder', StoreOrderSchema);
