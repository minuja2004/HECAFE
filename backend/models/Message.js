const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  sender: { type: String, enum: ['customer', 'admin'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
