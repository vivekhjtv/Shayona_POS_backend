const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  image: { type: String, default: 'default_item.jpeg' },     // fallback local filename
  imageUrl: { type: String, default: '' },                   // Cloudinary URL (preferred)
  sortOrder: { type: Number, default: 0 },
});

module.exports = mongoose.model('Product', ProductSchema);
