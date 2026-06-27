import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ─── Helper: strip password from user object ──────────────────────────────────
function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ─── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    if (!['organizer', 'musician'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be organizer or musician.' });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email is already in use.' });
    }

    // Create user (plain-text password — Phase 1 simplicity)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    });

    return res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

export default router;
