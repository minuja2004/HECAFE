const express = require('express');
const router = express.Router();
const Flyer = require('../models/Flyer');
const { auth, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `flyer-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only!'));
  }
});

// @route   POST api/flyers/upload
// @desc    Upload an image for flyer
// @access  Private/Admin
router.post('/upload', auth, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: fileUrl });
});

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
