import express from 'express';
import SessionSlot from '../models/SessionSlot.js';
import Contract from '../models/Contract.js';
import Gig from '../models/Gig.js';

const router = express.Router();

// GET /api/session-slots — filter by gigId, teamId, or musicianId
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.gigId) filter.gigId = req.query.gigId;
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.musicianId) filter.musicianId = req.query.musicianId;

    const slots = await SessionSlot.find(filter)
      .populate('musicianId', 'name avatar')
      .populate('gigId', 'title date venueName');

    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// A musician can only be in one place on a given calendar day — checked
// against their other session slots AND any confirmed contract (solo point
// of contact, or a paid band member via payoutSplits) for that day.
async function findBookingConflict(musicianId, gigDate, excludeGigId) {
  const targetDay = new Date(gigDate).toDateString();

  const otherSlots = await SessionSlot.find({ musicianId, gigId: { $ne: excludeGigId } })
    .populate('gigId', 'date title');
  const slotHit = otherSlots.find(
    (s) => s.gigId && new Date(s.gigId.date).toDateString() === targetDay
  );
  if (slotHit) {
    return `Already booked as a session player for "${slotHit.gigId.title}" that day`;
  }

  const contracts = await Contract.find({
    status: { $in: ['fully_signed', 'funded'] },
    gigId: { $ne: excludeGigId },
    $or: [{ musicianId }, { 'payoutSplits.musicianId': musicianId }],
  });
  const contractHit = contracts.find((c) => {
    const d = new Date(c.date); // Contract.date is a formatted string, not a Date type
    return !isNaN(d) && d.toDateString() === targetDay;
  });
  if (contractHit) {
    return `Already booked for "${contractHit.gigTitle}" that day`;
  }

  return null;
}

// POST /api/session-slots — assign a musician (core member or outside sub)
// into a specific gig's lineup, without touching the band's permanent roster
router.post('/', async (req, res) => {
  try {
    const { gigId, teamId, musicianId, instrument, isSubstitute, payoutShare } = req.body;

    if (!gigId || !teamId || !musicianId || !instrument) {
      return res.status(400).json({
        success: false,
        error: 'gigId, teamId, musicianId, and instrument are required',
      });
    }

    const gig = await Gig.findById(gigId).select('date');
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });

    const conflict = await findBookingConflict(musicianId, gig.date, gigId);
    if (conflict) {
      return res.status(409).json({ success: false, error: conflict });
    }

    const slot = new SessionSlot({ gigId, teamId, musicianId, instrument, isSubstitute, payoutShare });
    await slot.save();
    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'This musician already has a slot on this gig' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/session-slots/:id — pull someone from a gig's lineup
router.delete('/:id', async (req, res) => {
  try {
    const slot = await SessionSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, error: 'Session slot not found' });
    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
