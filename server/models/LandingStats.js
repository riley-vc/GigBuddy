import mongoose from 'mongoose';

// Singleton document (key: 'landing') tracking aggregate counters for the
// standalone landing page. Not tied to any User/Gig — separate from the
// core marketplace schema by design.
const landingStatsSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true, default: 'landing' },
  views:     { type: Number, default: 0 },
  ctaClicks: { type: Number, default: 0 },
});

export default mongoose.model('LandingStats', landingStatsSchema);
