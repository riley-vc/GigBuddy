import express from 'express';
import Gig from '../models/Gig.js';

const router = express.Router();

// GET /api/gigs — list gigs (optionally filter by status or organizerId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.organizerId) filter.organizerId = req.query.organizerId;

    const gigs = await Gig.find(filter).sort({ date: 1 });
    res.json({ success: true, data: gigs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/gigs/:id — single gig detail
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });
    res.json({ success: true, data: gig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gigs — create a new gig
router.post('/', async (req, res) => {
  try {
    const {
      organizerId,
      title,
      description,
      venueName,
      date,
      soundcheckTime,
      setTime,
      endTime,
      budget,
      genres,
      instruments,
      backlineProvided,
    } = req.body;

    const gig = new Gig({
      organizerId,
      title,
      description,
      venueName,
      date,
      soundcheckTime,
      setTime,
      endTime,
      budget,
      genres,
      instruments,
      backlineProvided,
    });

    await gig.save();
    res.status(201).json({ success: true, data: gig });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/gigs/:id — update editable gig fields (only when status === 'open')
router.patch('/:id', async (req, res) => {
  try {
    const allowed = [
      'title', 'description', 'venueName', 'date',
      'soundcheckTime', 'setTime', 'endTime',
      'budget', 'genres', 'instruments', 'backlineProvided',
    ];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });
    res.json({ success: true, data: gig });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/gigs/:id/status — update gig status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });
    res.json({ success: true, data: gig });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
