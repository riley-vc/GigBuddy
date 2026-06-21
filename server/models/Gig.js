import mongoose from 'mongoose';

const GigSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    venue: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    date: { type: Date, required: true },
    startTime: { type: String, default: '' }, // e.g. "19:00"
    endTime: { type: String, default: '' },   // e.g. "22:00"
    soundcheckTime: { type: String, default: '' },
    budget: { type: Number, required: true, min: 0 },
    requirements: {
      genres: { type: [String], default: [] },
      instruments: { type: [String], default: [] },
      backlineProvided: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Gig', GigSchema);
