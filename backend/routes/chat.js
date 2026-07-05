const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to check if user is admin
const getSenderType = async (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return 'customer';
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'he_cafe_super_secret_token_key_987654321');
    const user = await User.findById(decoded.id);
    if (user && user.role === 'admin') {
      return 'admin';
    }
  } catch (err) {
    // ignore
  }
  return 'customer';
};

// @route   GET api/chat/:orderId
// @desc    Get all messages for an order ID
// @access  Public
router.get('/:orderId', async (req, res) => {
  try {
    const messages = await Message.find({ orderId: req.params.orderId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// @route   POST api/chat/:orderId
// @desc    Send a message for an order ID
// @access  Public (inferred sender type based on authorization)
router.post('/:orderId', async (req, res) => {
  try {
    const { text } = req.body;
    const orderId = req.params.orderId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const sender = await getSenderType(req);

    const newMessage = new Message({
      orderId,
      sender,
      text
    });

    await newMessage.save();

    // Auto-reply simulator (only if customer sends a message)
    if (sender === 'customer') {
      setTimeout(async () => {
        let replyText = 'Thank you for the message! Our kitchen admin will check and reply shortly.';
        const lowerText = text.toLowerCase();
        if (lowerText.includes('bday') || lowerText.includes('birthday')) {
          replyText = 'Got it! We have noted the birthday text instructions.';
        } else if (lowerText.includes('address') || lowerText.includes('location')) {
          replyText = 'Sure, we will update the delivery dispatch rider with your location details.';
        }

        const autoReply = new Message({
          orderId,
          sender: 'admin',
          text: `[Auto-Reply]: ${replyText}`
        });
        await autoReply.save();
      }, 1500);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;
