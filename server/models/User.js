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
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
