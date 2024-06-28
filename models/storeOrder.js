const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StoreOrderSchema = new Schema({
  samosa: { type: String, required: true },
  puff: { type: String, required: true },
  dabeli: { type: String, required: true },
  lilwa: { type: String, required: true },
  patties: { type: String, required: true },
  veg_pizza: { type: String, required: true },
  cheese_pizza: { type: String, required: true },
  khichadi: { type: String, required: true },
  papadi_no_lot: { type: String, required: true },
  pav_bhaji: { type: String, required: true },
  easternDate: { type: String, required: true },
  easternTime: { type: String, required: true },
  store: { type: String, required: true },
});

module.exports = mongoose.model('StoreOrder', StoreOrderSchema);
