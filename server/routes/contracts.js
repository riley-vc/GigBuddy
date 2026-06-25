import express from 'express';
import Contract from '../models/Contract.js';
import Application from '../models/Application.js';
import Gig from '../models/Gig.js';

const router = express.Router();

// GET /api/contracts — list contracts (filter by gigId, musicianId, or organizerId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.gigId) filter.gigId = req.query.gigId;
    if (req.query.musicianId) filter.musicianId = req.query.musicianId;
    if (req.query.organizerId) filter.organizerId = req.query.organizerId;

    const contracts = await Contract.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: contracts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/contracts/:id — single contract
router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });
    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/contracts — organizer approves an application and drafts a contract
router.post('/', async (req, res) => {
  try {
    const {
      gigId,
      applicationId,
      musicianId,
      organizerId,
      gigTitle,
      venueName,
      date,
      compensation,
      organizerSignature,
    } = req.body;

    // Update the application status to 'approved'
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: 'approved' });
    }

    // Mark gig as filled
    if (gigId) {
      await Gig.findByIdAndUpdate(gigId, { status: 'filled' });
    }

    const contract = new Contract({
      gigId,
      applicationId,
      musicianId,
      organizerId,
      gigTitle,
      venueName,
      date,
      compensation,
      organizerSignature: organizerSignature || '',
      status: organizerSignature ? 'fully_signed' : 'pending_signatures',
      signedAt: organizerSignature ? new Date().toLocaleDateString() : '',
    });

    await contract.save();
    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/sign — add a signature (organizer or musician)
router.patch('/:id/sign', async (req, res) => {
  try {
    const { role, signature } = req.body;

    const updateFields = {};
    if (role === 'organizer') {
      updateFields.organizerSignature = signature;
    } else {
      updateFields.musicianSignature = signature;
    }

    // Check if this signing makes it fully signed
    const existing = await Contract.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Contract not found' });

    const willBeFullySigned =
      (role === 'organizer' && existing.musicianSignature) ||
      (role === 'musician' && existing.organizerSignature);

    if (willBeFullySigned) {
      updateFields.status = 'fully_signed';
      updateFields.signedAt = new Date().toLocaleDateString();
    }

    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
