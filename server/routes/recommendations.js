import express from 'express';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import Application from '../models/Application.js';

const router = express.Router();

const RESULT_CAP = 5;
const PREMIUM_BOOST = 2;

// Count of overlapping strings between two arrays (case-sensitive match,
// same convention as everywhere else genres/instruments are compared).
function overlapCount(a = [], b = []) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x)).length;
}

function overlapTags(a = [], b = []) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

function scoreGigAgainstMusician(gig, musician) {
  const instrumentOverlap = overlapTags(gig.instruments, musician.instruments);
  const genreOverlap = overlapTags(gig.genres, musician.genres);
  return {
    score: instrumentOverlap.length + genreOverlap.length,
    matchedOn: [...instrumentOverlap, ...genreOverlap],
  };
}

// GET /api/recommendations
//   ?userId=X&role=musician  — open gigs recommended to a musician
//   ?userId=X&role=organizer — musicians recommended across all of this organizer's open gigs
//   ?gigId=X                 — musicians recommended for one specific gig (post-publish flow)
router.get('/', async (req, res) => {
  try {
    const { userId, role, gigId } = req.query;

    // ── Musicians recommended for one specific gig ──────────────────────────
    if (gigId) {
      const gig = await Gig.findById(gigId);
      if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });

      const musicians = await User.find({ role: 'musician' }, '-password');
      const results = musicians
        .map((m) => {
          const { score, matchedOn } = scoreGigAgainstMusician(gig, m);
          return { type: 'musician', item: m, score: score + (m.isPremium ? PREMIUM_BOOST : 0), matchedOn };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, RESULT_CAP);

      return res.json({ success: true, data: results });
    }

    if (!userId || !role) {
      return res.status(400).json({ success: false, error: 'userId and role (or gigId) are required' });
    }

    // ── Open gigs recommended to a musician ─────────────────────────────────
    if (role === 'musician') {
      const musician = await User.findById(userId);
      if (!musician) return res.status(404).json({ success: false, error: 'User not found' });

      const appliedGigIds = new Set(
        (await Application.find({ musicianId: userId }).select('gigId')).map((a) => a.gigId.toString())
      );
      const openGigs = await Gig.find({ status: 'open' });

      const results = openGigs
        .filter((g) => !appliedGigIds.has(g._id.toString()))
        .map((g) => {
          const { score, matchedOn } = scoreGigAgainstMusician(g, musician);
          return { type: 'gig', item: g, score, matchedOn };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, RESULT_CAP);

      return res.json({ success: true, data: results });
    }

    // ── Musicians recommended to an organizer, across all their open gigs ───
    if (role === 'organizer') {
      const openGigs = await Gig.find({ organizerId: userId, status: 'open' });
      const musicians = await User.find({ role: 'musician' }, '-password');

      const best = new Map(); // musicianId -> best-scoring result
      for (const gig of openGigs) {
        for (const m of musicians) {
          const { score: rawScore, matchedOn } = scoreGigAgainstMusician(gig, m);
          if (rawScore === 0) continue;
          const score = rawScore + (m.isPremium ? PREMIUM_BOOST : 0);
          const mid = m._id.toString();
          const existing = best.get(mid);
          if (!existing || score > existing.score) {
            best.set(mid, { type: 'musician', item: m, score, matchedOn, matchedGig: { _id: gig._id, title: gig.title } });
          }
        }
      }

      const results = [...best.values()].sort((a, b) => b.score - a.score).slice(0, RESULT_CAP);
      return res.json({ success: true, data: results });
    }

    return res.status(400).json({ success: false, error: "role must be 'musician' or 'organizer'" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
