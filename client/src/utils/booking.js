// Mirrors the server-side overlap logic in server/routes/contracts.js —
// a gig's "occupied" window runs from soundcheck to set end, and times that
// roll past midnight (end <= start) are treated as spanning into the next day.
export function gigWindow(gig) {
  const dateStr = new Date(gig.date).toISOString().split('T')[0];
  const start = new Date(`${dateStr}T${gig.soundcheckTime || '00:00'}:00`);
  let end = new Date(`${dateStr}T${gig.endTime || '23:59'}:00`);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function windowsOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

// Does `gig` overlap any of `musicianId`'s existing contracts (as
// point-of-contact or band payout-split member)? `gigsById` must contain
// every gig referenced by `contracts` — both props already flow through
// App.jsx, so this is a pure client-side check with no extra fetch.
export function findConflictingContract(gig, musicianId, contracts, gigsById) {
  const targetWindow = gigWindow(gig);
  const gigId = (gig._id || gig.id)?.toString();
  const mid = musicianId?.toString();

  for (const c of contracts || []) {
    const cGigId = (c.gigId?._id || c.gigId)?.toString();
    if (cGigId === gigId) continue; // same gig — not a conflict with itself

    const isMember =
      (c.musicianId?._id || c.musicianId)?.toString() === mid ||
      (c.payoutSplits || []).some((s) => (s.musicianId?._id || s.musicianId)?.toString() === mid);
    if (!isMember) continue;

    const cGig = gigsById[cGigId];
    if (!cGig) continue;
    if (windowsOverlap(targetWindow, gigWindow(cGig))) return c;
  }
  return null;
}
