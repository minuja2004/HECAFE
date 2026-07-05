const express = require('express');
const router = express.Router();
const Flyer = require('../models/Flyer');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/flyers
// @desc    Get all active flyers for public store
// @access  Public
router.get('/', async (req, res) => {
  try {
    const flyers = await Flyer.find({ status: 'Active' });
    res.json(flyers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching flyers' });
  }
});

// @route   GET api/flyers/admin
// @desc    Get all flyers for admin management
// @access  Private/Admin
router.get('/admin', auth, admin, async (req, res) => {
  try {
    const flyers = await Flyer.find().sort({ createdAt: -1 });
    res.json(flyers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching flyers for admin' });
  }
});

// @route   POST api/flyers
// @desc    Create a new flyer
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
  try {
    const { title, subtitle, emoji, gradient, status } = req.body;

    const newFlyer = new Flyer({
      title,
      subtitle,
      emoji,
      gradient,
      status
    });

    const flyer = await newFlyer.save();
    res.status(201).json(flyer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating flyer' });
  }
});

// @route   PUT api/flyers/:id
// @desc    Update flyer details
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { title, subtitle, emoji, gradient, status } = req.body;

    let flyer = await Flyer.findById(req.params.id);
    if (!flyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }

    flyer.title = title || flyer.title;
    flyer.subtitle = subtitle || flyer.subtitle;
    flyer.emoji = emoji || flyer.emoji;
    flyer.gradient = gradient || flyer.gradient;
    flyer.status = status || flyer.status;

    await flyer.save();
    res.json(flyer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating flyer' });
  }
});

// @route   DELETE api/flyers/:id
// @desc    Delete a flyer
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const flyer = await Flyer.findById(req.params.id);
    if (!flyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }

    await Flyer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flyer removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting flyer' });
  }
});

// @route   POST api/flyers/broadcast/:id
// @desc    Set broadcast flyer
// @access  Private/Admin
router.post('/broadcast/:id', auth, admin, async (req, res) => {
  try {
    // Turn off all other broadcasts
    await Flyer.updateMany({}, { isBroadcast: false });

    // Set this one as broadcast
    const flyer = await Flyer.findById(req.params.id);
    if (!flyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }

    flyer.isBroadcast = true;
    await flyer.save();

    res.json(flyer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error setting broadcast' });
  }
});

module.exports = router;
