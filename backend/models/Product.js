const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: String, enum: ['Made to Order', 'In Stock', 'Out of Stock'], default: 'In Stock' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
