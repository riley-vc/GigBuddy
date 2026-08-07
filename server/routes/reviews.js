import express from 'express';
import Review from '../models/Review.js';
import Contract from '../models/Contract.js';
import { recordReview } from '../utils/rating.js';

const router = express.Router();

// GET /api/reviews — list reviews (filter by contractId or rateeId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.contractId) filter.contractId = req.query.contractId;
    if (req.query.rateeId) filter.rateeId = req.query.rateeId;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews — rate the other party on a completed contract
router.post('/', async (req, res) => {
  try {
    const { contractId, raterId, raterRole, rateeId, stars, comment } = req.body;
    if (!contractId || !raterId || !raterRole || !rateeId || !stars) {
      return res.status(400).json({ success: false, error: 'contractId, raterId, raterRole, rateeId, and stars are required' });
    }
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, error: 'stars must be between 1 and 5' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });
    if (contract.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'You can only rate a gig after the contract is fully completed' });
    }

    const existing = await Review.findOne({ contractId, raterId });
    if (existing) {
      return res.status(409).json({ success: false, error: 'You already rated this gig' });
    }

    const review = await Review.create({ contractId, raterId, raterRole, rateeId, stars, comment: comment || '' });
    await recordReview(rateeId, stars);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'You already rated this gig' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
