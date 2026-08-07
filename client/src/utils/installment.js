// Mirrors server/routes/contracts.js's computeSecondInstallmentTotal — for
// display only, the server always computes its own authoritative total when
// the second installment is actually paid.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeSecondInstallmentTotal(contract) {
  const base = contract.secondInstallmentAmount || 0;
  if (!contract.secondInstallmentDueAt) return { total: base, weeksLate: 0, surcharge: 0, isOverdue: false };
  const msLate = Date.now() - new Date(contract.secondInstallmentDueAt).getTime();
  if (msLate <= 0) return { total: base, weeksLate: 0, surcharge: 0, isOverdue: false };
  const weeksLate = Math.ceil(msLate / WEEK_MS);
  const surcharge = Math.round(base * 0.05 * weeksLate);
  return { total: base + surcharge, weeksLate, surcharge, isOverdue: true };
}
