import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// GET /api/applications — list applications (filter by gigId or musicianId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.gigId) filter.gigId = req.query.gigId;
    if (req.query.musicianId) filter.musicianId = req.query.musicianId;

    const applications = await Application.find(filter)
      .populate('gigId', 'title venue date budget status')
      .populate('musicianId', 'name email')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/applications — musician applies OR organizer invites
router.post('/', async (req, res) => {
  try {
    const { gigId, musicianId, message, initiatedBy = 'musician' } = req.body;

    // Check for duplicate application/invitation on the same gig+musician pair
    const existing = await Application.findOne({ gigId, musicianId });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Already applied to this gig' });
    }

    const application = new Application({ gigId, musicianId, message, initiatedBy });
    await application.save();
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/applications/:id/status — organizer accepts or rejects
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
