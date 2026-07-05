const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: ['Regular', 'Custom'], default: 'Regular' },
  items: [{
    productId: { type: String },
    name: { type: String, required: true },
    emoji: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String },
    flavour: { type: String }
  }],
  customDetails: {
    cakeType: { type: String },
    size: { type: String },
    flavour: { type: String },
    frosting: { type: String },
    message: { type: String },
    deliveryDate: { type: String },
    specialRequests: { type: String }
  },
  subtotal: { type: Number, required: true },
  delivery: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'], default: 'Pending' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
