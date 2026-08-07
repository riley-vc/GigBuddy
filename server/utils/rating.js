import User from '../models/User.js';

// Automated policy events (no-show, late payment, on-time bonuses, etc.)
// apply a flat, clamped nudge — unlike a peer review, a punitive/rewarding
// signal shouldn't get diluted into irrelevance by a large review history.
export async function adjustRating(userId, delta) {
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) return;
  user.rating = Math.round(Math.min(5, Math.max(1, user.rating + delta)) * 100) / 100;
  await user.save();
  return user;
}

// A person-authored review blends into the weighted average like a normal
// review platform.
export async function recordReview(userId, stars) {
  const user = await User.findById(userId);
  if (!user) return;
  user.rating = Math.round(((user.rating * user.ratingCount + stars) / (user.ratingCount + 1)) * 100) / 100;
  user.ratingCount += 1;
  await user.save();
  return user;
}

export const RATING_DELTAS = {
  NO_SHOW: -1.0,
  LATE_CANCELLATION: -0.5,
  LATE_PAYMENT: -0.3,
  ON_TIME_PAYMENT: 0.1,
  ON_TIME_SHOWING: 0.1,
};
