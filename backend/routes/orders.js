const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Message = require('../models/Message');
const { auth, admin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth helper to associate order with user if logged in
const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'he_cafe_super_secret_token_key_987654321');
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    next();
  }
};

// @route   POST api/orders
// @desc    Create a new order (standard or custom)
// @access  Public/Optional Auth
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      type,
      items,
      customDetails,
      subtotal,
      delivery,
      tax,
      total
    } = req.body;

    // Generate unique order ID
    let isUnique = false;
    let orderId = '';
    while (!isUnique) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      orderId = `ORD-${randNum}`;
      const existing = await Order.findOne({ orderId });
      if (!existing) isUnique = true;
    }

    const newOrder = new Order({
      orderId,
      customer: req.user ? req.user._id : undefined,
      customerName,
      email,
      phone,
      address,
      type,
      items,
      customDetails,
      subtotal,
      delivery,
      tax,
      total,
      status: 'Pending'
    });

    const order = await newOrder.save();

    // Create initial welcome message for chat
    const initialMessage = new Message({
      orderId: order.orderId,
      sender: 'admin',
      text: type === 'Custom' 
        ? 'Welcome to HE Cafe! We have received your custom order details. Our baking admin will review and reply shortly.'
        : 'Welcome to HE Cafe! We have received your store order. We will verify and process it soon.'
    });
    await initialMessage.save();

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// @route   GET api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   GET api/orders/my-orders
// @desc    Get logged in customer's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user orders' });
  }
});

// @route   GET api/orders/:orderId
// @desc    Get order details by orderId (Public or Auth)
// @access  Public
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Push system update chat message
    const systemMsg = new Message({
      orderId: order.orderId,
      sender: 'admin',
      text: `[System Update]: Order status updated to: ${status}`
    });
    await systemMsg.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

module.exports = router;
