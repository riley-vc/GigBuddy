import mongoose from 'mongoose';

const waitlistSignupSchema = new mongoose.Schema({
  name:      { type: String, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('WaitlistSignup', waitlistSignupSchema);
