const mongoose = require('mongoose');

const FlyerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  emoji: { type: String, required: true },
  gradient: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  isBroadcast: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flyer', FlyerSchema);
