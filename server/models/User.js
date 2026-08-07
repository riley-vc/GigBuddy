import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['organizer', 'musician'], required: true },
    name:     { type: String, required: true, trim: true },

    // Optional musician profile fields (Phase 1 — extended in Phase 2)
    bio:         { type: String, default: '' },
    genres:      { type: [String], default: [] },
    instruments: { type: [String], default: [] },
    location:    { type: String, default: '' },

    // Freemium tier — applies to both organizer and musician accounts
    isPremium:    { type: Boolean, default: false },
    premiumSince: { type: Date, default: null },

    // Star rating — blended from peer reviews (weighted average) and
    // automated policy adjustments (flat clamped nudges) — see server/utils/rating.js
    rating:      { type: Number, default: 4.5, min: 1, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
