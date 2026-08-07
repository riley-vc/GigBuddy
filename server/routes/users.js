import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users — list users (filter by role). Premium accounts sort first
// (stable sort preserves the existing name-alphabetical order within each tier).
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    // Never expose passwords
    const users = await User.find(filter, '-password').sort({ name: 1 });
    users.sort((a, b) => (b.isPremium === true) - (a.isPremium === true));
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id — single user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:id — edit own profile (name, bio, location, instruments, genres)
router.patch('/:id', async (req, res) => {
  try {
    const editable = ['name', 'bio', 'location', 'instruments', 'genres'];
    const updates = {};
    for (const key of editable) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true, projection: '-password' }
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:id/premium — demo upgrade/downgrade toggle (no real
// billing in this app — mirrors the existing "Simulate Pay" demo-button pattern)
router.patch('/:id/premium', async (req, res) => {
  try {
    const { isPremium } = req.body;
    if (typeof isPremium !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isPremium (boolean) is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isPremium, premiumSince: isPremium ? new Date() : null },
      { new: true, runValidators: true, projection: '-password' }
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
