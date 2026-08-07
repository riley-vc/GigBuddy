import { useState } from 'react';
import { X, Shield, CheckCircle, Loader2, Lock, Smartphone, AlertTriangle, Users, Clock, UserX } from 'lucide-react';
import { computeSecondInstallmentTotal } from '../utils/installment.js';

const PLATFORM_FEE_RATE = 0.05; // 5% GigBag platform fee added on top of each installment

export default function PaymentPortalModal({
  isOpen,
  onClose,
  contract,
  musicians = [],
  onFund,
  onConfirmAttendance,
  onReportNoShow,
  onReportConcern,
  onCancelContract,
  onPaySecondInstallment,
}) {
  const [loading, setLoading]           = useState(false); // first deposit
  const [payingSecond, setPayingSecond] = useState(false);
  const [confirming, setConfirming]     = useState(false);
  const [reportingNoShow, setReportingNoShow] = useState(false);
  const [reportingConcern, setReportingConcern] = useState(false);
  const [cancelling, setCancelling]     = useState(false);
  const [error, setError]               = useState('');
  const [devOverride, setDevOverride]   = useState(false);
  const [showConcernForm, setShowConcernForm] = useState(false);
  const [concernNote, setConcernNote]   = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !contract) return null;

  const status = contract.status;
  const isPreFunding      = status === 'pending_signatures' || status === 'fully_signed';
  const isFunded          = status === 'funded';
  const isPartiallyReleased = status === 'partially_released';
  const isCompleted       = status === 'completed';
  const isCancelled       = status === 'cancelled';

  const amount = contract.compensation || 0;
  const ratio = contract.escrowSplitRatio ?? 50;
  const dueDays = contract.secondInstallmentDueDays ?? 7;
  const isFullUpfront = ratio >= 100;
  const firstAmount = contract.firstInstallmentAmount ?? Math.round(amount * (ratio / 100));
  const firstFee = Math.round(firstAmount * PLATFORM_FEE_RATE);
  const firstTotalCharge = firstAmount + firstFee;

  const secondAmount = contract.secondInstallmentAmount ?? (amount - firstAmount);
  const secondFee = Math.round(secondAmount * PLATFORM_FEE_RATE);
  const { total: secondBaseTotal, surcharge, weeksLate, isOverdue } = computeSecondInstallmentTotal(contract);
  const secondTotalCharge = secondBaseTotal + secondFee;

  // Band payout breakdown — the manager already configured this in the MoA,
  // but the release screen is where money actually moves, so it needs to be
  // visible here too instead of only inside the (now-closed) contract modal.
  const payoutSplits   = contract.payoutSplits || [];
  const isBandContract = !!contract.teamId && payoutSplits.length > 0;
  const getMusicianInfo = (id) => {
    const idStr = (id?._id || id || '').toString();
    return musicians.find((m) => (m._id || m.id || '').toString() === idStr) || { name: id?.name || 'Musician' };
  };
  const managerName = getMusicianInfo(contract.musicianId).name;

  // Gate: attendance can only be confirmed once the gig date arrives
  const gigDate      = contract.date ? new Date(contract.date) : null;
  const gigHasPassed = gigDate ? new Date() >= gigDate : false;
  const canConfirm   = gigHasPassed || devOverride;

  const orgConfirmed = !!contract.organizerConfirmedAttendance;
  const musConfirmed = !!contract.musicianConfirmedAttendance;

  const contractRef = (contract._id || contract.id || '').slice(-8).toUpperCase();

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleSimulatePay() {
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    try {
      await onFund(contract._id || contract.id);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmAttendanceClick() {
    setError('');
    setConfirming(true);
    try {
      await onConfirmAttendance(contract._id || contract.id, 'organizer');
    } catch (err) {
      setError(err.message || 'Failed to confirm attendance.');
    } finally {
      setConfirming(false);
    }
  }

  async function handleReportNoShowClick() {
    setError('');
    setReportingNoShow(true);
    try {
      await onReportNoShow(contract._id || contract.id, 'organizer');
    } catch (err) {
      setError(err.message || 'Failed to report no-show.');
    } finally {
      setReportingNoShow(false);
    }
  }

  async function handleSubmitConcern() {
    setError('');
    setReportingConcern(true);
    try {
      await onReportConcern(contract._id || contract.id, 'organizer', concernNote);
      setShowConcernForm(false);
    } catch (err) {
      setError(err.message || 'Failed to report concern.');
    } finally {
      setReportingConcern(false);
    }
  }

  async function handleCancelClick() {
    setError('');
    setCancelling(true);
    try {
      await onCancelContract(contract._id || contract.id, 'organizer');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel.');
    } finally {
      setCancelling(false);
    }
  }

  async function handlePaySecondClick() {
    setError('');
    setPayingSecond(true);
    await new Promise((r) => setTimeout(r, 1200));
    try {
      await onPaySecondInstallment(contract._id || contract.id);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPayingSecond(false);
    }
  }

  // ── Shared sub-sections ──────────────────────────────────────────────────
  function PayoutBreakdown({ scaleFactor = 1 }) {
    if (!isBandContract) return null;
    return (
      <div id="payment-portal-payout-breakdown" className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-violet-400" />
          <p className="text-xs font-bold text-zinc-200">
            {contract.payoutMode === 'per_member' ? 'Split Across the Band' : 'Lump Sum — Distribution Plan'}
          </p>
        </div>
        <p className="text-[11px] text-zinc-500">
          {contract.payoutMode === 'per_member'
            ? 'GigBag disburses each member\'s share directly when payment is released.'
            : `Paid in full to ${managerName}, who is responsible for distributing it to the band per this plan.`}
        </p>
        <div className="space-y-1.5">
          {payoutSplits.map((s) => {
            const sid = (s.musicianId?._id || s.musicianId || '').toString();
            const info = getMusicianInfo(s.musicianId);
            return (
              <div key={sid} className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <span className="text-xs text-zinc-300 truncate">{info.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-emerald-400">₱{Math.round((s.amount || 0) * scaleFactor).toLocaleString()}</span>
                  {scaleFactor === 1 && contract.payoutMode === 'per_member' && (isCompleted || s.paid) && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">Paid</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ConcernSection() {
    if (contract.concernRaised) {
      return (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Concern Reported
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {contract.concernNote || 'A concern was reported on this contract.'} Automated release, late fees, and rating
            changes are paused on this contract until it's resolved.
          </p>
          <p className="text-xs text-zinc-500">
            📧 Contact <span className="text-violet-400">support@gigbag.ph</span> with reference{' '}
            <span className="font-mono text-zinc-300">GGB-{contractRef}</span> to open a case.
          </p>
        </div>
      );
    }
    return !showConcernForm ? (
      <button
        id="btn-raise-concern"
        type="button"
        onClick={() => setShowConcernForm(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Report a Concern
      </button>
    ) : (
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Report a Concern
        </p>
        <textarea
          id="concern-note-input"
          rows={2}
          value={concernNote}
          onChange={(e) => setConcernNote(e.target.value)}
          placeholder="Briefly describe what happened…"
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500/50 resize-none placeholder:text-zinc-600"
        />
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowConcernForm(false)}
            className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-submit-concern"
            type="button"
            onClick={handleSubmitConcern}
            disabled={reportingConcern}
            className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {reportingConcern ? 'Reporting…' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  function CancelSection() {
    if (!showCancelConfirm) {
      return (
        <button
          id="btn-open-cancel-booking"
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          className="w-full text-center text-[11px] text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
        >
          Cancel this booking
        </button>
      );
    }
    const hoursUntilGig = gigDate ? (gigDate - new Date()) / (1000 * 60 * 60) : Infinity;
    const isLastMinute = hoursUntilGig < 48;
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-bold text-red-400">Cancel This Booking?</p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {isLastMinute
            ? "This gig is less than 48 hours away — cancelling now will lower your rating."
            : "You're cancelling with plenty of notice, so no rating penalty applies."}{' '}
          The gig reopens for other artists to apply to. This can't be undone.
        </p>
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCancelConfirm(false)}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Never Mind
          </button>
          <button
            id="btn-confirm-cancel-booking"
            type="button"
            onClick={handleCancelClick}
            disabled={cancelling}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {cancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
          </button>
        </div>
      </div>
    );
  }

  function DayOfGigPanel() {
    if (contract.concernRaised) return <ConcernSection />;

    if (!canConfirm) {
      return (
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed">
          <p className="text-zinc-300 font-semibold mb-1">⏳ Gig day hasn't arrived yet</p>
          Attendance confirmation unlocks on{' '}
          <strong className="text-zinc-200">
            {gigDate ? gigDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'the scheduled gig date'}.
          </strong>{' '}
          {isFullUpfront ? 'The full amount' : `The first ${ratio}%`} releases automatically once both you and the musician confirm the gig happened.
        </div>
      );
    }

    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-violet-400" /> Day of the Gig
        </p>
        <p className="text-[11px] text-zinc-500">
          Both sides confirm the musician showed up — {isFullUpfront ? 'the full amount' : `the ${ratio}% `}in escrow releases automatically once you both have.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2.5 rounded-lg border text-center ${orgConfirmed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">You (Organizer)</p>
            <p className={`text-xs font-bold mt-1 ${orgConfirmed ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {orgConfirmed ? '✓ Confirmed' : 'Pending'}
            </p>
          </div>
          <div className={`p-2.5 rounded-lg border text-center ${musConfirmed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">Musician</p>
            <p className={`text-xs font-bold mt-1 ${musConfirmed ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {musConfirmed ? '✓ Confirmed' : 'Pending'}
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

        {!orgConfirmed ? (
          <div className="flex gap-2">
            <button
              id="btn-confirm-attendance"
              type="button"
              onClick={handleConfirmAttendanceClick}
              disabled={confirming}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg py-2.5 transition-colors cursor-pointer"
            >
              {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {confirming ? 'Confirming…' : 'Confirm They Showed Up'}
            </button>
            <button
              id="btn-report-no-show"
              type="button"
              onClick={handleReportNoShowClick}
              disabled={reportingNoShow}
              title="Report No-Show"
              className="px-3.5 flex items-center justify-center bg-zinc-900 border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <UserX className="w-4 h-4" />
            </button>
          </div>
        ) : !musConfirmed ? (
          <p className="text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">
            You've confirmed — waiting on the musician to confirm too before the escrow releases.
          </p>
        ) : (
          <p className="text-[11px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Both confirmed — {isFullUpfront ? 'the full amount has' : `the first ${ratio}% has`} been released.
          </p>
        )}

        {!orgConfirmed && <ConcernSection />}
      </div>
    );
  }

  return (
    <div id="payment-portal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-50">
                {isCancelled ? 'Booking Cancelled' : isCompleted ? 'Payment Complete ✓' : isPartiallyReleased ? '50% Released ✓' : isFunded ? 'Escrow Funded ✓' : 'Secure Payment Portal'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">GigBag Escrow — QR Ph</p>
            </div>
          </div>
          <button
            id="close-payment-portal"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-50 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* ══════════════════════════════════════════════════════════════════
              CANCELLED
          ══════════════════════════════════════════════════════════════════ */}
          {isCancelled && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center space-y-2">
              <p className="text-sm font-bold text-zinc-300">This booking was cancelled</p>
              <p className="text-xs text-zinc-500">{contract.gigTitle} · {contract.venueName}</p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SCREEN A — QR Ph checkout, first 50% deposit
          ══════════════════════════════════════════════════════════════════ */}
          {isPreFunding && (
            <>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                      Deposit Now {isFullUpfront ? '(Full Amount)' : `(${ratio}%)`}
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      ₱{firstTotalCharge.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-400">Escrow Protected</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>{isFullUpfront ? 'Artist compensation' : `${ratio}% of artist compensation`}</span>
                    <span className="text-zinc-200">₱{firstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GigBag platform fee <span className="text-zinc-600">(5%)</span></span>
                    <span className="text-amber-400">+ ₱{firstFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-300">Total charged to you</span>
                    <span className="text-emerald-400">₱{firstTotalCharge.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-zinc-500 truncate">{contract.gigTitle}</p>
              </div>

              <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-3.5 text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-violet-300">Payment terms:</strong>{' '}
                {isFullUpfront ? (
                  'this booking is paid in full upfront — there\'s no second installment.'
                ) : (
                  <>the remaining ₱{(amount - firstAmount).toLocaleString()} ({100 - ratio}%) is due within {dueDays} day{dueDays === 1 ? '' : 's'} of
                  the gig, once you both confirm it happened. Paying late adds a 5% surcharge per week overdue and lowers your rating.</>
                )}
              </div>

              <PayoutBreakdown />

              <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-300 font-semibold">
                  Scan with GCash, Maya, or any QR Ph-supported app
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-lg shadow-black/30">
                  <img
                    src="/qrph_dummy.png"
                    alt="QR Ph payment code"
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[11px] font-mono text-zinc-600 text-center">
                  Reference: GGB-{contractRef}
                </p>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              <button
                id="btn-simulate-qr-pay"
                onClick={handleSimulatePay}
                disabled={loading || status !== 'fully_signed'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing payment…
                  </>
                ) : status !== 'fully_signed' ? (
                  'Awaiting both signatures'
                ) : (
                  `Simulate Successful Scan & Pay — ₱${firstTotalCharge.toLocaleString()}`
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL · GigBag Escrow PH · BSP Regulated · QR Ph Standard</span>
              </div>

              {status === 'fully_signed' && <CancelSection />}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SCREEN B — Funded, awaiting/on gig day
          ══════════════════════════════════════════════════════════════════ */}
          {isFunded && (
            <>
              <div className="flex flex-col items-center py-4 space-y-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-zinc-50 text-lg">
                    {isFullUpfront ? 'Full Amount Secured in Escrow' : `${ratio}% Secured in Escrow`}
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    ₱{firstTotalCharge.toLocaleString()} is held safely.{' '}
                    {isFullUpfront
                      ? 'It releases once you both confirm the gig happened.'
                      : `The other ${100 - ratio}% releases once you both confirm the gig happened.`}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                <p className="text-zinc-400"><span className="text-zinc-600">Gig:</span> <span className="text-zinc-200">{contract.gigTitle}</span></p>
                <p className="text-zinc-400"><span className="text-zinc-600">Venue:</span> <span className="text-zinc-200">{contract.venueName}</span></p>
                <p className="text-zinc-400"><span className="text-zinc-600">Date:</span> <span className="text-zinc-200">{contract.date}</span></p>
              </div>

              <PayoutBreakdown />

              <DayOfGigPanel />

              {!contract.concernRaised && (
                <>
                  <div className="pt-1 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => setDevOverride((v) => !v)}
                      className="w-full text-[10px] text-zinc-700 hover:text-zinc-500 text-center pt-2 cursor-pointer"
                    >
                      {devOverride ? 'Hide' : 'Show'} demo/testing override (bypass gig-date gate)
                    </button>
                  </div>
                  <CancelSection />
                </>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SCREEN C — Partially released, second installment due
          ══════════════════════════════════════════════════════════════════ */}
          {isPartiallyReleased && (
            <>
              <div className="flex flex-col items-center py-4 space-y-3">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-zinc-50 text-lg">First {ratio}% Released</h4>
                  <p className="text-sm text-zinc-400 mt-1">₱{firstAmount.toLocaleString()} is on its way to the artist.</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                <p className="text-zinc-400"><span className="text-zinc-600">Gig:</span> <span className="text-zinc-200">{contract.gigTitle}</span></p>
                <div className="border-t border-zinc-800 pt-2 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Remaining balance</span>
                    <span className="text-zinc-200">₱{secondAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">GigBag fee (5%)</span>
                    <span className="text-amber-400">+ ₱{secondFee.toLocaleString()}</span>
                  </div>
                  {isOverdue && (
                    <div className="flex justify-between text-red-400">
                      <span>Late surcharge ({weeksLate} wk{weeksLate === 1 ? '' : 's'} @ 5%)</span>
                      <span>+ ₱{surcharge.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-300">Total due now</span>
                    <span className="text-emerald-400">₱{secondTotalCharge.toLocaleString()}</span>
                  </div>
                </div>
                <p className={`pt-1 ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                  <span className="text-zinc-600">{isOverdue ? 'Was due:' : 'Due by:'}</span>{' '}
                  {contract.secondInstallmentDueAt
                    ? new Date(contract.secondInstallmentDueAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                  {isOverdue && ' — OVERDUE'}
                </p>
              </div>

              {isOverdue && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 text-[11px] text-red-300 leading-relaxed">
                  This balance is overdue — a 5% surcharge is added per week late, and it's already cost a rating hit.
                  Pay as soon as possible to stop it from growing.
                </div>
              )}

              {!contract.concernRaised && !isOverdue && (
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3.5 text-[11px] text-emerald-300 leading-relaxed">
                  Pay before the due date to keep the surcharge at ₱0 and earn a small rating boost.
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              {!contract.concernRaised ? (
                <button
                  id="btn-pay-second-installment"
                  onClick={handlePaySecondClick}
                  disabled={payingSecond}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  {payingSecond ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing payment…
                    </>
                  ) : (
                    `Pay Remaining Balance — ₱${secondTotalCharge.toLocaleString()}`
                  )}
                </button>
              ) : (
                <ConcernSection />
              )}

              <PayoutBreakdown />

              {!contract.concernRaised && <ConcernSection />}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SCREEN D — Fully completed
          ══════════════════════════════════════════════════════════════════ */}
          {isCompleted && (
            <>
              <div className="flex flex-col items-center py-4 space-y-3">
                <div className="w-20 h-20 rounded-full bg-violet-500/10 border-2 border-violet-500/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-violet-400" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-zinc-50 text-lg">Payment Complete!</h4>
                  <p className="text-sm text-zinc-400 mt-1">₱{amount.toLocaleString()} has been fully paid to the artist.</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                <p className="text-zinc-400"><span className="text-zinc-600">Gig:</span> <span className="text-zinc-200">{contract.gigTitle}</span></p>
                <p className="text-zinc-400"><span className="text-zinc-600">Venue:</span> <span className="text-zinc-200">{contract.venueName}</span></p>
                <div className="border-t border-zinc-800 pt-2 mt-1 space-y-1">
                  {isFullUpfront ? (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Paid in full upfront</span>
                      <span className="text-emerald-400">₱{firstAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">1st installment ({ratio}%)</span>
                        <span className="text-emerald-400">₱{firstAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">2nd installment ({100 - ratio}%)</span>
                        <span className="text-emerald-400">₱{secondAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  {contract.secondInstallmentSurchargeCharged > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Late surcharge charged</span>
                      <span>₱{contract.secondInstallmentSurchargeCharged.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-300">Total to artist</span>
                    <span className="text-zinc-200">₱{amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <PayoutBreakdown />

              <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4 text-xs text-zinc-400 text-center">
                🎉 Transaction complete. This contract is now archived.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
