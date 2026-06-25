import mongoose from 'mongoose';

const GigSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title:            { type: String, required: true, trim: true },
    description:      { type: String, default: '' },
    venueName:        { type: String, required: true, trim: true },
    date:             { type: Date, required: true },
    soundcheckTime:   { type: String, default: '' },  // e.g. "18:00"
    setTime:          { type: String, default: '' },  // e.g. "20:30"
    endTime:          { type: String, default: '' },  // e.g. "23:00"
    budget:           { type: Number, required: true, min: 0 },
    genres:           { type: [String], default: [] },
    instruments:      { type: [String], default: [] },
    backlineProvided: { type: [String], default: [] }, // list of gear items provided on-site
    status: {
      type: String,
      enum: ['open', 'filled', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Gig', GigSchema);
