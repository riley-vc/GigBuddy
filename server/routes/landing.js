import express from 'express';
import WaitlistSignup from '../models/WaitlistSignup.js';
import LandingStats from '../models/LandingStats.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/landing/view — fired once per page load
router.post('/view', async (req, res) => {
  try {
    await LandingStats.findOneAndUpdate(
      { key: 'landing' },
      { $inc: { views: 1 } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/landing/cta-click — fired on every "Get Early Access" click,
// regardless of whether the email form gets completed
router.post('/cta-click', async (req, res) => {
  try {
    await LandingStats.findOneAndUpdate(
      { key: 'landing' },
      { $inc: { ctaClicks: 1 } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/landing/signup — { name?, email }
router.post('/signup', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email is required' });
    }
    try {
      await WaitlistSignup.create({ name: name?.trim(), email: email.toLowerCase().trim() });
    } catch (err) {
      if (err.code !== 11000) throw err; // duplicate email — treat as success, no info leak
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/landing/stats — aggregate counts only, no raw emails exposed
router.get('/stats', async (req, res) => {
  try {
    const stats = await LandingStats.findOneAndUpdate(
      { key: 'landing' },
      { $setOnInsert: { key: 'landing' } },
      { upsert: true, new: true }
    );
    const signups = await WaitlistSignup.countDocuments();
    const views = stats.views;
    const ctaClicks = stats.ctaClicks;

    res.json({
      success: true,
      data: {
        views,
        ctaClicks,
        signups,
        clickThroughRate: views > 0 ? +((ctaClicks / views) * 100).toFixed(2) : 0,
        signupConversionRate: ctaClicks > 0 ? +((signups / ctaClicks) * 100).toFixed(2) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
