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

    // Signatures (typed legal name of each party)
    organizerSignature: { type: String, default: '' },
    musicianSignature:  { type: String, default: '' },
    signedAt:           { type: String, default: '' }, // ISO date string when fully signed

    status: {
      type: String,
      enum: ['pending_signatures', 'fully_signed', 'completed'],
      default: 'pending_signatures',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Contract', ContractSchema);
