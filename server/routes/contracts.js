import express from 'express';
import Contract from '../models/Contract.js';
import Application from '../models/Application.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import { adjustRating, RATING_DELTAS } from '../utils/rating.js';

const router = express.Router();

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Live-computed late surcharge on the second installment — 5% of the base
// amount per week (or part-week) overdue. Not stored until actually charged,
// so it's always accurate no matter when it's checked.
function computeSecondInstallmentTotal(contract) {
  const base = contract.secondInstallmentAmount || 0;
  if (!contract.secondInstallmentDueAt) return { total: base, weeksLate: 0, surcharge: 0, isOverdue: false };
  const msLate = Date.now() - new Date(contract.secondInstallmentDueAt).getTime();
  if (msLate <= 0) return { total: base, weeksLate: 0, surcharge: 0, isOverdue: false };
  const weeksLate = Math.ceil(msLate / WEEK_MS);
  const surcharge = Math.round(base * 0.05 * weeksLate);
  return { total: base + surcharge, weeksLate, surcharge, isOverdue: true };
}

// Lazily applies the one-time organizer rating hit the moment a contract is
// found to be overdue — there's no cron in this app, so "goes overdue" is
// detected whenever the contract is next read, not on a schedule.
async function applyLatePenaltyIfDue(contract) {
  if (contract.status !== 'partially_released' || contract.concernRaised || contract.latePenaltyApplied) return;
  const { isOverdue } = computeSecondInstallmentTotal(contract);
  if (!isOverdue) return;
  contract.latePenaltyApplied = true;
  await contract.save();
  await adjustRating(contract.organizerId, RATING_DELTAS.LATE_PAYMENT);
}

// ── Double-booking prevention ────────────────────────────────────────────────
// A gig's "occupied" window runs from soundcheck to set end — that's when the
// artist is physically committed, not just the on-stage performance slot.
// Times that roll past midnight (end <= start) are treated as spanning into
// the next calendar day.
function gigWindow(gig) {
  const dateStr = new Date(gig.date).toISOString().split('T')[0];
  const start = new Date(`${dateStr}T${gig.soundcheckTime || '00:00'}:00`);
  let end = new Date(`${dateStr}T${gig.endTime || '23:59'}:00`);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function windowsOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

// Every non-cancelled Contract row represents an active or completed
// booking, so any hit against another gig's window is a real conflict.
// Checks the point-of-contact plus, for a band booking, every payout-split
// member (so one busy member blocks the whole booking).
async function findBookingConflict(gig, musicianIds) {
  const targetWindow = gigWindow(gig);
  const candidates = await Contract.find({
    gigId: { $ne: gig._id },
    status: { $ne: 'cancelled' },
    $or: [
      { musicianId: { $in: musicianIds } },
      { 'payoutSplits.musicianId': { $in: musicianIds } },
    ],
  }).populate('gigId', 'title date soundcheckTime endTime');

  for (const c of candidates) {
    if (!c.gigId) continue; // referenced gig was deleted
    if (!windowsOverlap(targetWindow, gigWindow(c.gigId))) continue;

    const idStrs = musicianIds.map((id) => id.toString());
    const conflictingMusicianId =
      idStrs.find((id) => id === c.musicianId?.toString()) ||
      idStrs.find((id) => c.payoutSplits.some((s) => s.musicianId.toString() === id));

    return { contract: c, conflictingMusicianId };
  }
  return null;
}

// GET /api/contracts — list contracts (filter by gigId, musicianId, organizerId, or teamId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.gigId) filter.gigId = req.query.gigId;
    if (req.query.organizerId) filter.organizerId = req.query.organizerId;
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.sessionBandId) filter.sessionBandId = req.query.sessionBandId;
    if (req.query.musicianId) {
      // Match contracts where this user is the point of contact OR a band
      // member with a payout split — they need to see it to approve their share
      filter.$or = [
        { musicianId: req.query.musicianId },
        { 'payoutSplits.musicianId': req.query.musicianId },
      ];
    }

    const contracts = await Contract.find(filter).sort({ createdAt: -1 }).lean();
    contracts.forEach((c) => {
      if (c.status === 'partially_released') Object.assign(c, computeSecondInstallmentTotal(c));
    });
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

    await applyLatePenaltyIfDue(contract);

    const data = contract.toObject();
    if (contract.status === 'partially_released') {
      Object.assign(data, computeSecondInstallmentTotal(contract));
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/contracts — organizer approves an application and drafts a contract
// For a band booking, pass teamId + participants: [{ musicianId }] — payoutMode
// defaults from the Team, and payoutSplits start empty (status: 'pending' rows
// added once the manager configures amounts via PATCH /:id/payout-splits).
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
      musicianSignature,
      teamId,
      sessionBandId,
      payoutMode,
      participants, // [{ musicianId }] — who's being paid out of this contract
      payoutSplits: preConfiguredSplits, // optional — pre-configured splits from a local draft (see BandPage / MoaContractModal)
    } = req.body;

    // Block double-booking before any side effects — a rejected booking
    // shouldn't mark the gig filled or the application approved.
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });

    const memberIds = participants?.length > 0 ? participants.map((p) => p.musicianId) : [musicianId];
    const conflict = await findBookingConflict(gig, memberIds);
    if (conflict) {
      const musician = await User.findById(conflict.conflictingMusicianId).select('name');
      return res.status(409).json({
        success: false,
        error: `${musician?.name || 'This artist'} is already booked for "${conflict.contract.gigTitle}" during an overlapping time slot.`,
      });
    }

    // Band/session-band booking: if the manager is the one signing (as
    // opposed to just drafting), every other member must have already
    // approved their share — mirrors the same check in PATCH /:id/sign,
    // needed here too since the manager's FIRST signature can go through
    // this route (contract doesn't exist yet to PATCH). Checks the
    // pre-configured splits if any were sent along; with none configured
    // yet there's nothing to have been approved, so it blocks too.
    if (musicianSignature && (teamId || sessionBandId) && participants?.length > 0) {
      const splitsToCheck = preConfiguredSplits?.length > 0 ? preConfiguredSplits : participants;
      const unresolved = splitsToCheck.filter((s) => (s.status || 'pending') !== 'approved');
      if (unresolved.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Waiting on ${unresolved.length} of ${splitsToCheck.length} member${splitsToCheck.length === 1 ? '' : 's'} to approve their share before this can be signed`,
        });
      }
    }

    // Update the application status to 'approved'
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: 'approved' });
    }

    // Mark gig as filled
    if (gigId) {
      await Gig.findByIdAndUpdate(gigId, { status: 'filled' });
    }

    const bothSigned = !!organizerSignature && !!musicianSignature;
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
      musicianSignature: musicianSignature || '',
      status: bothSigned ? 'fully_signed' : 'pending_signatures',
      signedAt: bothSigned ? new Date().toLocaleDateString() : '',
      ...((teamId || sessionBandId) && {
        ...(teamId ? { teamId } : { sessionBandId }),
        payoutMode: payoutMode || 'lump_sum',
        // If the manager already configured real numbers on the local draft
        // (before this first signature creates the row), use those. Otherwise
        // amount/method/rawValue default to 0/'fixed'/0 until configured via
        // PATCH /:id/payout-splits — the row existing at all is what each
        // participant approves or declines.
        payoutSplits: preConfiguredSplits?.length > 0
          ? preConfiguredSplits.map((s) => ({
              musicianId: s.musicianId,
              amount: s.amount || 0,
              method: s.method || 'fixed',
              rawValue: s.rawValue || 0,
              status: s.status || 'pending',
            }))
          : (participants || []).map((p) => ({
              musicianId: p.musicianId,
              amount: 0,
              method: 'fixed',
              rawValue: 0,
              status: 'pending',
            })),
      }),
    });

    await contract.save();
    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/payout-splits — manager configures how the band
// gets paid. `method` applies to the whole update (Feature 1: fixed OR
// percentage, not mixed per-row). Re-configuring resets every row back to
// 'pending' — a changed split needs fresh approval from each member.
router.patch('/:id/payout-splits', async (req, res) => {
  try {
    const { method, splits } = req.body; // splits: [{ musicianId, rawValue }]
    if (!['fixed', 'percentage'].includes(method) || !Array.isArray(splits) || splits.length === 0) {
      return res.status(400).json({ success: false, error: 'method and a non-empty splits array are required' });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });
    if (contract.status !== 'pending_signatures') {
      return res.status(400).json({ success: false, error: 'Splits can only be edited before the contract is fully signed' });
    }

    let amounts;
    if (method === 'fixed') {
      const sum = splits.reduce((acc, s) => acc + Number(s.rawValue || 0), 0);
      if (sum !== contract.compensation) {
        return res.status(400).json({
          success: false,
          error: `Fixed amounts must add up to the total compensation (₱${contract.compensation}), got ₱${sum}`,
        });
      }
      amounts = splits.map((s) => Number(s.rawValue || 0));
    } else {
      const pctSum = splits.reduce((acc, s) => acc + Number(s.rawValue || 0), 0);
      if (pctSum !== 100) {
        return res.status(400).json({ success: false, error: `Percentages must add up to 100, got ${pctSum}` });
      }
      // Floor each share, then hand the leftover peso remainder (rounding
      // error) to the last row so the sum always exactly equals compensation
      amounts = splits.map((s) => Math.floor((contract.compensation * Number(s.rawValue || 0)) / 100));
      const remainder = contract.compensation - amounts.reduce((a, b) => a + b, 0);
      amounts[amounts.length - 1] += remainder;
    }

    contract.payoutMode = req.body.payoutMode || contract.payoutMode || 'per_member';
    contract.payoutSplits = splits.map((s, i) => ({
      musicianId: s.musicianId,
      amount: amounts[i],
      method,
      rawValue: Number(s.rawValue || 0),
      // Proposing the split IS the manager's consent to their own row —
      // without this, the manager's own row would sit 'pending' forever
      // since only OTHER members get an approve/decline action in the UI.
      status: s.musicianId?.toString() === contract.musicianId?.toString() ? 'approved' : 'pending',
    }));

    await contract.save();
    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/payout-splits/:musicianId/respond — a band member
// approves or declines their share. The manager can only sign (below) once
// every row is 'approved'.
router.patch('/:id/payout-splits/:musicianId/respond', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'declined'
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: "status must be 'approved' or 'declined'" });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });

    const split = contract.payoutSplits.find((s) => s.musicianId.toString() === req.params.musicianId);
    if (!split) return res.status(404).json({ success: false, error: 'This musician has no payout split on this contract' });

    split.status = status;
    split.respondedAt = new Date();
    await contract.save();

    res.json({ success: true, data: contract });
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

    // Band/session-band booking: the manager signs on the group's behalf,
    // but only once every member has approved their payout split.
    if (role === 'musician' && (existing.teamId || existing.sessionBandId) && existing.payoutSplits.length > 0) {
      const unresolved = existing.payoutSplits.filter((s) => s.status !== 'approved');
      if (unresolved.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Waiting on ${unresolved.length} of ${existing.payoutSplits.length} member${existing.payoutSplits.length === 1 ? '' : 's'} to approve their share before this can be signed`,
        });
      }
    }

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

// PATCH /api/contracts/:id/escrow-terms — either party proposes the
// upfront/remainder split ratio and the second installment's due-date
// window. GigBag's baseline is 50/50 · 7 days, but nothing's locked in
// until someone signs — so this stays editable up to that point, and either
// side can keep adjusting it (that's the "dispute" mechanism: just don't
// sign until you're both happy, and use chat to talk it through).
router.patch('/:id/escrow-terms', async (req, res) => {
  try {
    const { escrowSplitRatio, secondInstallmentDueDays } = req.body;
    if (escrowSplitRatio == null || escrowSplitRatio < 0 || escrowSplitRatio > 100) {
      return res.status(400).json({ success: false, error: 'escrowSplitRatio must be between 0 and 100' });
    }
    if (secondInstallmentDueDays == null || secondInstallmentDueDays < 1) {
      return res.status(400).json({ success: false, error: 'secondInstallmentDueDays must be at least 1' });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (contract.organizerSignature || contract.musicianSignature) {
      return res.status(400).json({
        success: false,
        error: 'Escrow terms can only be changed before either party signs — decline to sign and renegotiate over chat instead.',
      });
    }

    contract.escrowSplitRatio = escrowSplitRatio;
    contract.secondInstallmentDueDays = secondInstallmentDueDays;
    await contract.save();

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/fund — organizer deposits the upfront share
// (fully_signed → funded), per whatever split ratio was agreed before signing.
router.patch('/:id/fund', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (contract.status !== 'fully_signed') {
      return res.status(400).json({ success: false, error: 'Contract must be fully signed before funding.' });
    }

    const gig = await Gig.findById(contract.gigId).select('date');

    // Split escrow per the agreed ratio — snapshotted here so later math
    // (late fees, etc.) isn't affected by anything else changing on the
    // contract. A 100% ratio means there's no second installment at all.
    const ratio = contract.escrowSplitRatio ?? 50;
    const first = Math.round(contract.compensation * (ratio / 100));
    contract.firstInstallmentAmount = first;
    contract.secondInstallmentAmount = contract.compensation - first;
    contract.status = 'funded';

    if (ratio < 100 && gig) {
      const days = contract.secondInstallmentDueDays ?? 7;
      contract.secondInstallmentDueAt = new Date(new Date(gig.date).getTime() + days * 24 * 60 * 60 * 1000);
    }

    await contract.save();

    // Move gig to in_progress so it no longer shows as just 'filled'
    await Gig.findByIdAndUpdate(contract.gigId, { status: 'in_progress' });

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/confirm-attendance — either party confirms the
// musician showed up on gig day. The first installment only auto-releases
// once BOTH sides have confirmed — neither can unilaterally force or block
// payment.
router.patch('/:id/confirm-attendance', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['organizer', 'musician'].includes(role)) {
      return res.status(400).json({ success: false, error: "role must be 'organizer' or 'musician'" });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (contract.status !== 'funded') {
      return res.status(400).json({ success: false, error: 'Attendance can only be confirmed while the contract is funded and awaiting the gig.' });
    }
    if (contract.concernRaised) {
      return res.status(400).json({ success: false, error: 'This contract has a reported concern — it needs to be resolved with GigBag Support before confirming attendance.' });
    }

    const gig = await Gig.findById(contract.gigId).select('date');
    if (gig && new Date() < new Date(gig.date)) {
      return res.status(400).json({ success: false, error: "Attendance can't be confirmed before the gig date." });
    }

    const now = new Date();
    if (role === 'organizer') {
      contract.organizerConfirmedAttendance = true;
      contract.organizerConfirmedAt = now;
    } else {
      contract.musicianConfirmedAttendance = true;
      contract.musicianConfirmedAt = now;
    }

    if (contract.organizerConfirmedAttendance && contract.musicianConfirmedAttendance) {
      // Both confirmed — release the escrow. A 100% split ratio means there
      // was never a second installment, so the booking is fully done right
      // here; anything less leaves the remainder due per the agreed terms.
      if ((contract.escrowSplitRatio ?? 50) >= 100) {
        if (contract.payoutMode === 'per_member' && contract.payoutSplits.length > 0) {
          contract.payoutSplits.forEach((s) => { s.paid = true; s.paidAt = now; });
        }
        contract.status = 'completed';
        await contract.save();
        await Gig.findByIdAndUpdate(contract.gigId, { status: 'completed' });
      } else {
        // Per-member split bookkeeping (marking each row `paid`) happens
        // once the FULL compensation clears at final completion, same as
        // it always has — this just moves the aggregate escrow forward.
        contract.status = 'partially_released';
        contract.secondInstallmentStatus = 'due';
        await contract.save();
      }
      await adjustRating(contract.musicianId, RATING_DELTAS.ON_TIME_SHOWING);
    } else {
      await contract.save();
    }

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/no-show — organizer (or musician, self-reporting
// a scheduling failure) flags that the musician didn't show. Unlike a
// contested concern, this applies its rating consequence immediately since
// it's normally the organizer reporting against their own interest (they'd
// rather have the gig happen than get a refund-shaped headache).
router.patch('/:id/no-show', async (req, res) => {
  try {
    const { reportedBy } = req.body;
    if (!['organizer', 'musician'].includes(reportedBy)) {
      return res.status(400).json({ success: false, error: "reportedBy must be 'organizer' or 'musician'" });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (contract.status !== 'funded') {
      return res.status(400).json({ success: false, error: 'A no-show can only be reported while the contract is funded and awaiting/on the gig.' });
    }
    if (contract.concernRaised) {
      return res.status(400).json({ success: false, error: 'A concern has already been reported on this contract.' });
    }

    contract.noShowReportedBy = reportedBy;
    contract.concernRaised = true;
    contract.concernRaisedBy = reportedBy;
    contract.concernNote = 'No-show reported';
    contract.concernRaisedAt = new Date();
    await contract.save();

    // Band bookings: the point-of-contact is who's accountable for the
    // booking showing up, same as everywhere else this app treats the
    // manager as responsible for the group.
    await adjustRating(contract.musicianId, RATING_DELTAS.NO_SHOW);

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/report-concern — freezes all further automated
// money/rating side-effects on this contract. Lightweight by design: it
// records the report and surfaces the existing "contact support" path —
// no in-app resolution workflow.
router.patch('/:id/report-concern', async (req, res) => {
  try {
    const { role, note } = req.body;
    if (!['organizer', 'musician'].includes(role)) {
      return res.status(400).json({ success: false, error: "role must be 'organizer' or 'musician'" });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (contract.concernRaised) {
      return res.status(400).json({ success: false, error: 'A concern has already been reported on this contract.' });
    }

    contract.concernRaised = true;
    contract.concernRaisedBy = role;
    contract.concernNote = note || '';
    contract.concernRaisedAt = new Date();
    await contract.save();

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/cancel — either party backs out before the
// booking locks in. Cancelling within 48h of the gig applies a rating
// penalty to whoever cancelled; cancelling well in advance doesn't.
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['organizer', 'musician'].includes(role)) {
      return res.status(400).json({ success: false, error: "role must be 'organizer' or 'musician'" });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (['partially_released', 'completed', 'cancelled'].includes(contract.status)) {
      return res.status(400).json({ success: false, error: 'This contract can no longer be cancelled.' });
    }

    const gig = await Gig.findById(contract.gigId).select('date status');
    const hoursUntilGig = gig ? (new Date(gig.date) - Date.now()) / (1000 * 60 * 60) : Infinity;
    const isLastMinute = hoursUntilGig < 48;

    contract.status = 'cancelled';
    await contract.save();

    if (gig) await Gig.findByIdAndUpdate(gig._id, { status: 'open' });

    if (isLastMinute) {
      const responsibleId = role === 'organizer' ? contract.organizerId : contract.musicianId;
      await adjustRating(responsibleId, RATING_DELTAS.LATE_CANCELLATION);
    }

    res.json({ success: true, data: contract });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/contracts/:id/pay-second-installment — organizer pays the
// remaining balance (partially_released → completed). The server computes
// the live late surcharge itself — the client never supplies an amount.
router.patch('/:id/pay-second-installment', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found.' });
    if (contract.status !== 'partially_released') {
      return res.status(400).json({ success: false, error: 'The remaining balance can only be paid after the first installment has been released.' });
    }
    if (contract.concernRaised) {
      return res.status(400).json({ success: false, error: 'This contract has a reported concern — it needs to be resolved with GigBag Support before paying the remaining balance.' });
    }

    const { total, surcharge, isOverdue } = computeSecondInstallmentTotal(contract);

    // Per-member split: disburse each member's full share now that the
    // compensation is fully paid out.
    if (contract.payoutMode === 'per_member' && contract.payoutSplits.length > 0) {
      const paidSum = contract.payoutSplits.reduce((acc, s) => acc + s.amount, 0);
      if (paidSum !== contract.compensation) {
        return res.status(400).json({
          success: false,
          error: `Payout splits (₱${paidSum}) don't add up to the contract total (₱${contract.compensation}) — fix the splits before paying out.`,
        });
      }
      const now = new Date();
      contract.payoutSplits.forEach((s) => {
        s.paid = true;
        s.paidAt = now;
      });
    }

    const wasAlreadyPenalized = contract.latePenaltyApplied;
    contract.secondInstallmentStatus = 'paid';
    contract.secondInstallmentPaidAt = new Date();
    contract.secondInstallmentSurchargeCharged = surcharge;
    contract.status = 'completed';
    if (isOverdue) contract.latePenaltyApplied = true;
    await contract.save();

    await Gig.findByIdAndUpdate(contract.gigId, { status: 'completed' });

    if (isOverdue && !wasAlreadyPenalized) {
      await adjustRating(contract.organizerId, RATING_DELTAS.LATE_PAYMENT);
    } else if (!isOverdue) {
      await adjustRating(contract.organizerId, RATING_DELTAS.ON_TIME_PAYMENT);
    }

    res.json({ success: true, data: { ...contract.toObject(), amountCharged: total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
