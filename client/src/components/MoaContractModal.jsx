import { useState, useEffect } from 'react';
import { X, Shield, FileText, CheckCircle, Users, Check, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { computeSecondInstallmentTotal } from '../utils/installment.js';

function ConcernBanner({ contract }) {
  const ref = (contract._id || contract.id || '').slice(-8).toUpperCase();
  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 space-y-2">
      <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5" /> Concern Reported
      </p>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {contract.concernNote || 'A concern was reported on this contract.'} Automated release, late fees, and rating
        changes are paused until it's resolved.
      </p>
      <p className="text-xs text-zinc-500">
        📧 Contact <span className="text-violet-400">support@gigbag.ph</span> with reference{' '}
        <span className="font-mono text-zinc-300">GGB-{ref}</span> to open a case.
      </p>
    </div>
  );
}

export default function MoaContractModal({
  isOpen,
  onClose,
  contract,
  onSign,
  role,
  currentUser,
  musicians = [],
  onConfigureSplits,
  onRespondSplit,
  onConfirmAttendance,
  onReportConcern,
  onCancelContract,
  onUpdateEscrowTerms,
}) {
  const [signatureText, setSignatureText] = useState(currentUser?.name || '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  // ── Day-of-the-gig (musician side) ───────────────────────────────────────
  const [confirming, setConfirming] = useState(false);
  const [reportingConcern, setReportingConcern] = useState(false);
  const [showConcernForm, setShowConcernForm] = useState(false);
  const [concernNote, setConcernNote] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── Band payout split builder ────────────────────────────────────────────
  const [splitMode, setSplitMode] = useState('lump_sum');
  const [splitMethod, setSplitMethod] = useState('percentage');
  const [splitInputs, setSplitInputs] = useState({});
  const [editingSplits, setEditingSplits] = useState(false);
  const [splitError, setSplitError] = useState('');
  const [savingSplits, setSavingSplits] = useState(false);
  const [respondingSplit, setRespondingSplit] = useState(false);

  // ── Escrow terms (ratio + due-days) — negotiable by either side until
  // someone signs ───────────────────────────────────────────────────────────
  const [escrowRatio, setEscrowRatio] = useState(50);
  const [escrowDueDays, setEscrowDueDays] = useState(7);
  const [savingEscrowTerms, setSavingEscrowTerms] = useState(false);
  const [escrowTermsError, setEscrowTermsError] = useState('');

  // Reset the builders whenever a different contract is loaded into the modal
  useEffect(() => {
    const splits = contract.payoutSplits || [];
    const hasConfigured = splits.some((s) => s.rawValue > 0);
    setSplitMode(contract.payoutMode || 'lump_sum');
    setSplitMethod(hasConfigured ? splits[0].method : 'percentage');
    const inputs = {};
    splits.forEach((s) => {
      const sid = (s.musicianId?._id || s.musicianId || '').toString();
      inputs[sid] = hasConfigured ? String(s.rawValue) : '';
    });
    setSplitInputs(inputs);
    setEditingSplits(!hasConfigured);
    setSplitError('');

    setEscrowRatio(contract.escrowSplitRatio ?? 50);
    setEscrowDueDays(contract.secondInstallmentDueDays ?? 7);
    setEscrowTermsError('');
  }, [contract._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const getMusicianInfo = (id) => {
    const idStr = (id?._id || id || '').toString();
    return musicians.find((m) => (m._id || m.id || '').toString() === idStr) || { name: id?.name || 'Musician' };
  };

  const myId = (currentUser?._id || currentUser?.id || '').toString();
  const isBandContract = !!contract.teamId;
  const managerId = (contract.musicianId?._id || contract.musicianId || '').toString();
  const isManager = isBandContract && managerId === myId;
  const payoutSplits = contract.payoutSplits || [];
  const mySplit = isBandContract
    ? payoutSplits.find((s) => (s.musicianId?._id || s.musicianId || '').toString() === myId)
    : null;
  const isMemberOnly = isBandContract && !isManager && !!mySplit;
  const totalSplits = payoutSplits.length;
  const approvedCount = payoutSplits.filter((s) => s.status === 'approved').length;
  const allApproved = isBandContract ? totalSplits > 0 && approvedCount === totalSplits : true;

  const handleSaveSplits = async () => {
    setSplitError('');
    const splits = payoutSplits.map((s) => {
      const sid = (s.musicianId?._id || s.musicianId || '').toString();
      return { musicianId: sid, rawValue: Number(splitInputs[sid] || 0) };
    });
    const sum = splits.reduce((acc, s) => acc + s.rawValue, 0);
    const expected = splitMethod === 'percentage' ? 100 : contract.compensation;
    if (sum !== expected) {
      const target = splitMethod === 'percentage' ? '100' : `₱${contract.compensation?.toLocaleString()}`;
      const got = splitMethod === 'percentage' ? sum : `₱${sum.toLocaleString()}`;
      setSplitError(`${splitMethod === 'percentage' ? 'Percentages' : 'Amounts'} must add up to ${target} — currently ${got}`);
      return;
    }
    setSavingSplits(true);
    const updated = await onConfigureSplits(contract._id, { method: splitMethod, splits, payoutMode: splitMode });
    setSavingSplits(false);
    if (updated) setEditingSplits(false);
  };

  const handleRespondSplit = async (status) => {
    setRespondingSplit(true);
    await onRespondSplit(contract._id, myId, status);
    setRespondingSplit(false);
  };

  const handleConfirmAttendanceClick = async () => {
    setError('');
    setConfirming(true);
    try {
      await onConfirmAttendance(contract._id, 'musician');
    } catch (err) {
      setError(err.message || 'Failed to confirm attendance.');
    } finally {
      setConfirming(false);
    }
  };

  const handleSubmitConcern = async () => {
    setError('');
    setReportingConcern(true);
    try {
      await onReportConcern(contract._id, 'musician', concernNote);
      setShowConcernForm(false);
    } catch (err) {
      setError(err.message || 'Failed to report concern.');
    } finally {
      setReportingConcern(false);
    }
  };

  const handleCancelClick = async () => {
    setError('');
    setCancelling(true);
    try {
      await onCancelContract(contract._id, 'musician');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSaveEscrowTerms = async (ratio, dueDays) => {
    setEscrowTermsError('');
    setSavingEscrowTerms(true);
    try {
      await onUpdateEscrowTerms(contract._id, { escrowSplitRatio: ratio, secondInstallmentDueDays: dueDays });
      setEscrowRatio(ratio);
      setEscrowDueDays(dueDays);
    } catch (err) {
      setEscrowTermsError(err.message || 'Failed to update escrow terms.');
    } finally {
      setSavingEscrowTerms(false);
    }
  };

  const handleSign = (e) => {
    e.preventDefault();
    const trimmed = signatureText.trim();

    if (!trimmed) {
      setError('Please type your full legal name to sign.');
      return;
    }

    // Must have at least two words (first + last name minimum)
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      setError('Please enter your full legal name — at least a first and last name.');
      return;
    }

    // Each word must be letters only (allows hyphens and apostrophes for names like De La Cruz, O'Brien)
    const validName = /^[A-Za-zÀ-ÖØ-öø-ÿ''.\-\s]+$/.test(trimmed);
    if (!validName) {
      setError('Name must contain letters only — no numbers or special characters.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must accept the terms of the agreement.');
      return;
    }

    setError('');
    onSign(trimmed);
    setSignatureText('');
    setAgreedToTerms(false);
  };

  const isAlreadySignedByRole =
    role === 'organizer' ? !!contract.organizerSignature : !!contract.musicianSignature;

  return (
    <div id="moa-modal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div
        id="moa-modal-container"
        className="w-full sm:max-w-2xl bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-50 text-lg">Memorandum of Agreement</h3>
              <p className="text-xs text-zinc-400">Your booking agreement — secured and paid through GigBag</p>
            </div>
          </div>
          <button
            id="close-moa-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-50 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* Escrow / Payment Terms — disclosed here before signing, and
              negotiable by either side up until then. If you disagree with
              whatever's shown, just don't sign — adjust it here or hash it
              out over chat first. Once either party signs, terms lock. */}
          {(() => {
            const locked = !!(contract.organizerSignature || contract.musicianSignature);
            const ratio = locked ? (contract.escrowSplitRatio ?? 50) : escrowRatio;
            const dueDays = locked ? (contract.secondInstallmentDueDays ?? 7) : escrowDueDays;
            const firstAmt = Math.round((contract.compensation || 0) * (ratio / 100));
            const secondAmt = (contract.compensation || 0) - firstAmt;
            const isFullUpfront = ratio >= 100;
            const PRESETS = [100, 70, 60, 50, 40, 30, 0];

            return (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg space-y-3">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider">
                      How you get paid{isFullUpfront ? ' — paid in full upfront' : ` — ${ratio}/${100 - ratio} split escrow`}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Once both sides sign, the organizer deposits{' '}
                      <strong className="text-emerald-400">
                        {isFullUpfront ? 'the full amount' : `${ratio}% (₱${firstAmt.toLocaleString()})`}
                      </strong>{' '}
                      into escrow right away.{' '}
                      {isFullUpfront
                        ? 'It releases to you once you and the organizer both confirm the gig happened on the day.'
                        : <>That share releases to you once you <em>and</em> the organizer both confirm the gig happened on the day.</>}
                    </p>
                    {!isFullUpfront && (
                      <p className="text-xs text-zinc-400">
                        The remaining{' '}
                        <strong className="text-emerald-400">{100 - ratio}% (₱{secondAmt.toLocaleString()})</strong>{' '}
                        is due within <strong className="text-zinc-200">{dueDays} day{dueDays === 1 ? '' : 's'}</strong> after
                        the gig — the organizer's rating drops if it's late, and a{' '}
                        <strong className="text-amber-400">5% surcharge</strong> is added for every week it stays unpaid.
                      </p>
                    )}
                  </div>
                </div>

                {!locked && (
                  <div className="space-y-2.5 pt-1 border-t border-emerald-500/10">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Customize the split — either of you can adjust this until someone signs
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={p}
                          id={`escrow-preset-${p}`}
                          type="button"
                          onClick={() => handleSaveEscrowTerms(p, escrowDueDays)}
                          disabled={savingEscrowTerms}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                            escrowRatio === p
                              ? 'bg-violet-600 border-violet-600 text-zinc-50'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {p}/{100 - p}{p === 50 ? ' · Standard' : ''}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <label className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        Custom %:
                        <input
                          id="escrow-custom-ratio-input"
                          type="number"
                          min="0"
                          max="100"
                          value={escrowRatio}
                          onChange={(e) => setEscrowRatio(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-16 bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-violet-500"
                        />
                      </label>
                      <label className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        Due
                        <input
                          id="escrow-due-days-input"
                          type="number"
                          min="1"
                          value={escrowDueDays}
                          onChange={(e) => setEscrowDueDays(Math.max(1, Number(e.target.value)))}
                          disabled={escrowRatio >= 100}
                          className="w-14 bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-violet-500 disabled:opacity-40"
                        />
                        days after the gig
                      </label>
                      <button
                        id="save-escrow-terms-btn"
                        type="button"
                        onClick={() => handleSaveEscrowTerms(escrowRatio, escrowDueDays)}
                        disabled={savingEscrowTerms || (escrowRatio === (contract.escrowSplitRatio ?? 50) && escrowDueDays === (contract.secondInstallmentDueDays ?? 7))}
                        className="ml-auto px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-zinc-50 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {savingEscrowTerms ? 'Saving…' : 'Save Terms'}
                      </button>
                    </div>
                    {escrowTermsError && (
                      <p className="text-[11px] text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded border border-amber-500/10">
                        {escrowTermsError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Band Payout Split */}
          {isBandContract && (
            <div className="border border-violet-500/10 bg-violet-500/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider">Band Payout</h4>
              </div>

              {isManager && editingSplits ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['lump_sum', 'per_member'].map((m) => (
                      <button
                        key={m}
                        id={`split-mode-${m}`}
                        type="button"
                        onClick={() => setSplitMode(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          splitMode === m
                            ? 'bg-violet-600 border-violet-600 text-zinc-50'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {m === 'lump_sum' ? 'Lump Sum to You' : 'Per-Member Split'}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {['percentage', 'fixed'].map((m) => (
                      <button
                        key={m}
                        id={`split-method-${m}`}
                        type="button"
                        onClick={() => setSplitMethod(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          splitMethod === m
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-50'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {m === 'percentage' ? 'By Percentage' : 'By Fixed ₱'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {payoutSplits.map((s) => {
                      const sid = (s.musicianId?._id || s.musicianId || '').toString();
                      const info = getMusicianInfo(s.musicianId);
                      return (
                        <div key={sid} className="flex items-center gap-2.5">
                          <img
                            referrerPolicy="no-referrer"
                            src={info.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=27272a&color=fff&size=40`}
                            alt={info.name}
                            className="w-7 h-7 rounded-lg object-cover border border-zinc-800 shrink-0"
                          />
                          <span className="text-xs text-zinc-300 flex-1 min-w-0 truncate">{info.name}{sid === myId ? ' (You)' : ''}</span>
                          <div className="relative shrink-0 w-24">
                            {splitMethod === 'fixed' && (
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">₱</span>
                            )}
                            <input
                              id={`split-input-${sid}`}
                              type="number"
                              min="0"
                              value={splitInputs[sid] || ''}
                              onChange={(e) => setSplitInputs((prev) => ({ ...prev, [sid]: e.target.value }))}
                              className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-1.5 text-xs text-right focus:outline-none focus:border-violet-500 ${splitMethod === 'fixed' ? 'pl-5 pr-2' : 'pl-2 pr-5'}`}
                            />
                            {splitMethod === 'percentage' && (
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {splitError && (
                    <p className="text-[11px] text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded border border-amber-500/10">
                      {splitError}
                    </p>
                  )}

                  <button
                    id="save-splits-btn"
                    type="button"
                    onClick={handleSaveSplits}
                    disabled={savingSplits}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {savingSplits ? 'Saving...' : 'Save Split'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-500">
                    {splitMode === 'lump_sum'
                      ? `Paid as one lump sum to ${getMusicianInfo(contract.musicianId).name}, who distributes to the band.`
                      : 'Disbursed directly to each member when payment is released.'}
                  </p>
                  {payoutSplits.map((s) => {
                    const sid = (s.musicianId?._id || s.musicianId || '').toString();
                    const info = getMusicianInfo(s.musicianId);
                    return (
                      <div key={sid} className="flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            referrerPolicy="no-referrer"
                            src={info.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=27272a&color=fff&size=40`}
                            alt={info.name}
                            className="w-6 h-6 rounded-md object-cover border border-zinc-800 shrink-0"
                          />
                          <span className="text-xs text-zinc-200 truncate">{info.name}{sid === myId ? ' (You)' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-emerald-400">₱{s.amount?.toLocaleString()}</span>
                          {s.status === 'approved' && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">✓ Approved</span>
                          )}
                          {s.status === 'declined' && (
                            <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">✗ Declined</span>
                          )}
                          {s.status === 'pending' && (
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-zinc-500">{approvedCount} of {totalSplits} member{totalSplits === 1 ? '' : 's'} approved</p>
                  {isManager && contract.status === 'pending_signatures' && (
                    <button
                      id="edit-splits-btn"
                      type="button"
                      onClick={() => setEditingSplits(true)}
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                    >
                      Edit Split
                    </button>
                  )}
                </div>
              )}

              {isMemberOnly && mySplit && (
                <div className="border-t border-violet-500/10 pt-3 mt-1">
                  <p className="text-xs text-zinc-300 mb-2">
                    Your share: <strong className="text-emerald-400">₱{mySplit.amount?.toLocaleString()}</strong>
                  </p>
                  <div className="flex gap-2">
                    <button
                      id="approve-my-split-btn"
                      type="button"
                      onClick={() => handleRespondSplit('approved')}
                      disabled={respondingSplit}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                        mySplit.status === 'approved'
                          ? 'bg-emerald-600 border-emerald-600 text-zinc-50'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-emerald-500/50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      id="decline-my-split-btn"
                      type="button"
                      onClick={() => handleRespondSplit('declined')}
                      disabled={respondingSplit}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                        mySplit.status === 'declined'
                          ? 'bg-red-600 border-red-600 text-zinc-50'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-red-500/50'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancel Booking — either party can back out before the first
              installment releases; last-minute cancellation costs a rating hit
              (enforced server-side). */}
          {role === 'musician' && (!isBandContract || isManager) && ['fully_signed', 'funded'].includes(contract.status) && (
            showCancelConfirm ? (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-2.5">
                <p className="text-xs font-bold text-red-400">Cancel This Booking?</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cancelling within 48 hours of the gig lowers your rating. The gig reopens for other artists. This can't be undone.
                </p>
                {error && <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowCancelConfirm(false)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg cursor-pointer">
                    Never Mind
                  </button>
                  <button
                    id="btn-confirm-cancel-booking-musician"
                    type="button"
                    onClick={handleCancelClick}
                    disabled={cancelling}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    {cancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-open-cancel-booking-musician"
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="w-full text-center text-[11px] text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
              >
                Cancel this booking
              </button>
            )
          )}

          {/* Day of the Gig — musician-side confirm/concern actions. Only the
              point of contact (solo musician or band manager) acts here;
              the mirrored organizer-side actions live in PaymentPortalModal. */}
          {role === 'musician' && (!isBandContract || isManager) && (
            <>
              {(contract.status === 'funded') && (
                contract.concernRaised ? (
                  <ConcernBanner contract={contract} />
                ) : (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-400" />
                      <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider">Day of the Gig</h4>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Confirm you performed once the gig happens — the first 50% releases automatically once both you and
                      the organizer have confirmed.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-lg border text-center ${contract.organizerConfirmedAttendance ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono">Organizer</p>
                        <p className={`text-xs font-bold mt-1 ${contract.organizerConfirmedAttendance ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {contract.organizerConfirmedAttendance ? '✓ Confirmed' : 'Pending'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-lg border text-center ${contract.musicianConfirmedAttendance ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono">You</p>
                        <p className={`text-xs font-bold mt-1 ${contract.musicianConfirmedAttendance ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {contract.musicianConfirmedAttendance ? '✓ Confirmed' : 'Pending'}
                        </p>
                      </div>
                    </div>

                    {error && <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

                    {!contract.musicianConfirmedAttendance ? (
                      <button
                        id="btn-confirm-attendance-musician"
                        type="button"
                        onClick={handleConfirmAttendanceClick}
                        disabled={confirming}
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg py-2.5 transition-colors cursor-pointer"
                      >
                        {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        {confirming ? 'Confirming…' : 'Confirm I Performed'}
                      </button>
                    ) : (
                      <p className="text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">
                        You've confirmed — waiting on the organizer to confirm too before the escrow releases.
                      </p>
                    )}

                    {!showConcernForm ? (
                      <button
                        id="btn-raise-concern-musician"
                        type="button"
                        onClick={() => setShowConcernForm(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3" /> Report a Concern
                      </button>
                    ) : (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-2">
                        <textarea
                          id="concern-note-input-musician"
                          rows={2}
                          value={concernNote}
                          onChange={(e) => setConcernNote(e.target.value)}
                          placeholder="Briefly describe what happened…"
                          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500/50 resize-none placeholder:text-zinc-600"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowConcernForm(false)} className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-semibold rounded-lg cursor-pointer">
                            Cancel
                          </button>
                          <button
                            id="btn-submit-concern-musician"
                            type="button"
                            onClick={handleSubmitConcern}
                            disabled={reportingConcern}
                            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                          >
                            {reportingConcern ? 'Reporting…' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

              {contract.status === 'partially_released' && (() => {
                const { isOverdue, weeksLate, surcharge } = computeSecondInstallmentTotal(contract);
                return (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`} />
                      <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider">First 50% Released</h4>
                    </div>
                    <p className="text-xs text-zinc-400">
                      The organizer has the remaining balance {isOverdue ? 'was due' : 'due'} by{' '}
                      <strong className="text-zinc-200">
                        {contract.secondInstallmentDueAt ? new Date(contract.secondInstallmentDueAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </strong>. You'll see it land here once they pay.
                    </p>
                    {isOverdue && (
                      <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                        Overdue by {weeksLate} week{weeksLate === 1 ? '' : 's'} — a ₱{surcharge.toLocaleString()} late surcharge has
                        accrued and the organizer's rating has already taken a hit for it.
                      </p>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {/* Contract Text */}
          <div className="border border-zinc-800 p-5 rounded-lg bg-zinc-950 font-mono text-[11px] leading-5 space-y-4 max-h-[300px] overflow-y-auto select-none">
            <p className="text-center font-bold text-zinc-400 uppercase tracking-widest text-xs border-b border-zinc-800 pb-2">
              STANDARD LIVE PERFORMANCE AGREEMENT
            </p>
            <p>This Memorandum of Agreement ("Agreement") is executed on {new Date().toLocaleDateString()} by and between:</p>
            <p>
              <strong>1. EVENT ORGANIZER / PLANNER</strong><br />
              Representing entity and venue: {contract.venueName || 'Designated Venue Partner'} (hereinafter referred to as the "Client").
            </p>
            <p>
              <strong>2. INDEPENDENT ARTIST / MUSICIAN</strong><br />
              (hereinafter referred to as the "Artist").
            </p>
            <p>
              <strong>SECTION 1. ENGAGEMENT LOGISTICS</strong><br />
              The Client hereby engages the Artist to perform a professional live musical showcase for the production titled{' '}
              <strong>"{contract.gigTitle || 'Live Performance Showcase'}"</strong> on the date of{' '}
              <strong>{contract.date}</strong>.
            </p>
            <p>
              <strong>SECTION 2. TIMELINES & PUNCTUALITY</strong><br />
              The Artist agrees to report on site for equipment setup and acoustic sound check precisely as outlined in the logistics profiles.
            </p>
            <p>
              <strong>SECTION 3. COMPENSATION & TAXES</strong><br />
              In consideration for full and satisfactory performance, the Client agrees to authorize a total guaranteed flat payment of{' '}
              <strong>₱{contract.compensation?.toLocaleString()} PHP</strong>. All payments clear through the GigBag Escrow mechanism.
            </p>
            <p>
              <strong>SECTION 4. FORCE MAJEURE & CANCELLATION</strong><br />
              Either party may cancel this engagement without liability if performance is rendered impossible due to natural disasters, sudden venue closures, or other unforeseen acts, provided notice is sent through GigBag at least 48 hours prior.
            </p>
          </div>

          {/* Signature Status */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
              <span className="text-zinc-500 block mb-2 uppercase tracking-wider text-[10px]">Client Signature (Planner)</span>
              {contract.organizerSignature ? (
                <div className="space-y-1">
                  <span className="text-violet-400 font-bold italic text-sm">✗ {contract.organizerSignature}</span>
                  <span className="text-zinc-500 block text-[9px]">Verified on {contract.signedAt || new Date().toLocaleDateString()}</span>
                </div>
              ) : (
                <span className="text-amber-500 italic flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending signature
                </span>
              )}
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
              <span className="text-zinc-500 block mb-2 uppercase tracking-wider text-[10px]">Artist Signature (Musician)</span>
              {contract.musicianSignature ? (
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold italic text-sm">✗ {contract.musicianSignature}</span>
                  <span className="text-zinc-500 block text-[9px]">Verified on {contract.signedAt || new Date().toLocaleDateString()}</span>
                </div>
              ) : (
                <span className="text-amber-500 italic flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending signature
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer / Signing Box */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950">
          {isMemberOnly ? (
            contract.musicianSignature ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-sm font-medium text-center">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Booking confirmed — {getMusicianInfo(contract.musicianId).name} signed on the band's behalf.</span>
              </div>
            ) : (
              <p className="text-center text-xs text-zinc-500 py-2">
                Only the band's point of contact signs this agreement — approve your share above, then they'll take it from here.
              </p>
            )
          ) : isAlreadySignedByRole ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>You're signed — this booking is locked in!</span>
            </div>
          ) : role === 'musician' && isBandContract && !allApproved ? (
            <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-sm font-medium text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>Waiting on {totalSplits - approvedCount} of {totalSplits} member{totalSplits - approvedCount === 1 ? '' : 's'} to approve their share before you can sign</span>
            </div>
          ) : (
            <form onSubmit={handleSign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Type your full name to sign:
                </label>
                <input
                  id="moa-signature-input"
                  type="text"
                  placeholder={currentUser?.name || 'e.g. Carlo Reyes'}
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-50 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  id="moa-terms-checkbox"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-800 bg-zinc-900 text-violet-600 cursor-pointer"
                />
                <span className="text-xs text-zinc-400 select-none">
                  I'm authorized to sign this, and I understand GigBag will hold the payment safely until the gig is done.
                </span>
              </label>

              {error && (
                <p id="moa-form-error" className="text-xs text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded border border-amber-500/10">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  id="cancel-moa-btn"
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-moa-btn"
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-zinc-50 rounded-lg py-2.5 text-xs font-semibold shadow-lg shadow-violet-600/10 transition-colors"
                >
                  Sign & Lock In Payment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
