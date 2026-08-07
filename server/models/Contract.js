import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    musicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Denormalized for fast display
    gigTitle:           { type: String, required: true },
    venueName:          { type: String, default: '' },
    date:               { type: String, default: '' }, // e.g. "2026-07-04"
    compensation:       { type: Number, required: true, min: 0 },

    // Signatures (typed legal name of each party). For a band booking,
    // musicianSignature is the manager/point-of-contact signing on the
    // team's behalf — see payoutSplits[].status for individual members'
    // consent to their share.
    organizerSignature: { type: String, default: '' },
    musicianSignature:  { type: String, default: '' },
    signedAt:           { type: String, default: '' }, // ISO date string when fully signed

    status: {
      type: String,
      enum: ['pending_signatures', 'fully_signed', 'funded', 'partially_released', 'completed', 'cancelled'],
      default: 'pending_signatures',
    },

    // ── Split escrow — GigBag standard is 50% upfront / 50% within a week of
    // the gig, but either party can propose different terms before anyone
    // signs (see PATCH /:id/escrow-terms). Once a signature exists, terms
    // lock — disagree and the move is to not sign and renegotiate over chat.
    escrowSplitRatio:        { type: Number, default: 50, min: 0, max: 100 }, // % released upfront
    secondInstallmentDueDays: { type: Number, default: 7, min: 1 }, // days after the gig date
    firstInstallmentAmount:  { type: Number },
    secondInstallmentAmount: { type: Number },
    // 'overdue' is derived live from secondInstallmentDueAt, not stored
    secondInstallmentStatus: {
      type: String,
      enum: ['not_due', 'due', 'paid'],
      default: 'not_due',
    },
    secondInstallmentDueAt:  { type: Date },
    secondInstallmentPaidAt: { type: Date },
    secondInstallmentSurchargeCharged: { type: Number, default: 0 },
    // Guards the one-time organizer rating hit the first time it goes overdue
    latePenaltyApplied:      { type: Boolean, default: false },

    // ── Gig-day mutual confirmation ─────────────────────────────────────────
    // Both sides must confirm before the first installment auto-releases —
    // neither side can unilaterally force or block payment.
    organizerConfirmedAttendance: { type: Boolean, default: false },
    organizerConfirmedAt:         { type: Date },
    musicianConfirmedAttendance:  { type: Boolean, default: false },
    musicianConfirmedAt:          { type: Date },
    noShowReportedBy:             { type: String, enum: ['organizer', 'musician'] },

    // ── Report a Concern — freezes auto-release / late-fee / rating
    // side-effects on this contract until a human sorts it out ─────────────
    concernRaised:   { type: Boolean, default: false },
    concernRaisedBy: { type: String, enum: ['organizer', 'musician'] },
    concernNote:     { type: String, default: '' },
    concernRaisedAt: { type: Date },

    // ── Band/Team payout (Feature 1) — absent for solo-musician contracts ──
    // Exactly one of these is set for a group booking: teamId for a
    // permanent act, sessionBandId for a one-off group. Everything below
    // (payoutMode, payoutSplits, the manager-signs-once-approved gate)
    // works identically regardless of which one is set.
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    sessionBandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SessionBand',
    },
    payoutMode: {
      type: String,
      enum: ['lump_sum', 'per_member'],
    },
    // One entry per member being paid out of `compensation`. The manager
    // can only sign (musicianSignature) once every entry's status is
    // 'approved' — checked live off this array, not cached.
    payoutSplits: [
      {
        musicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount:     { type: Number, required: true, min: 0 }, // resolved ₱ amount
        method:     { type: String, enum: ['fixed', 'percentage'], required: true },
        rawValue:   { type: Number, required: true }, // the ₱ or % as originally entered
        status: {
          type: String,
          enum: ['pending', 'approved', 'declined'],
          default: 'pending',
        },
        respondedAt: { type: Date },
        paid:        { type: Boolean, default: false },
        paidAt:      { type: Date },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Contract', ContractSchema);
