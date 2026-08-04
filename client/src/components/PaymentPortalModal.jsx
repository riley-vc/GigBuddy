import { useState } from 'react';
import { X, Shield, CheckCircle, Loader2, Lock, Banknote, Smartphone, AlertTriangle } from 'lucide-react';

const PLATFORM_FEE_RATE = 0.05; // 5% GigBag platform fee added on top of artist compensation

export default function PaymentPortalModal({
  isOpen,
  onClose,
  contract,
  onFund,
  onRelease,
}) {
  const [loading, setLoading]         = useState(false);
  const [releasing, setReleasing]     = useState(false);
  const [error, setError]             = useState('');
  const [devOverride, setDevOverride] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState(false);

  if (!isOpen || !contract) return null;

  const isFunded    = contract.status === 'funded';
  const isCompleted = contract.status === 'completed';
  const amount      = contract.compensation || 0; // artist's pay
  const platformFee = Math.round(amount * PLATFORM_FEE_RATE);
  const totalCharge = amount + platformFee;        // what organizer actually pays

  // Gate: release is only allowed after the gig date
  const gigDate      = contract.date ? new Date(contract.date) : null;
  const gigHasPassed = gigDate ? new Date() >= gigDate : false;
  const canRelease   = gigHasPassed || devOverride;

  // ── Simulate scan & pay ───────────────────────────────────────────────────
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

  // ── Release payment ───────────────────────────────────────────────────────
  async function handleRelease() {
    setError('');
    setReleasing(true);
    await new Promise((r) => setTimeout(r, 1200));
    try {
      await onRelease(contract._id || contract.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Release failed. Please try again.');
    } finally {
      setReleasing(false);
    }
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
                {isFunded ? 'Escrow Funded ✓' : isCompleted ? 'Payment Released ✓' : 'Secure Payment Portal'}
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
              SCREEN A — QR Ph checkout (fully_signed)
          ══════════════════════════════════════════════════════════════════ */}
          {!isFunded && !isCompleted && (
            <>
              {/* Amount summary */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Total to Deposit</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      ₱{totalCharge.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-400">Escrow Protected</span>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Artist compensation</span>
                    <span className="text-zinc-200">₱{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>GigBag platform fee <span className="text-zinc-600">(5%)</span></span>
                    <span className="text-amber-400">+ ₱{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-300">Total charged to you</span>
                    <span className="text-emerald-400">₱{totalCharge.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-zinc-500 truncate">{contract.gigTitle}</p>
              </div>

              {/* QR Ph branding strip */}
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-300 font-semibold">
                  Scan with GCash, Maya, or any QR Ph-supported app
                </p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-lg shadow-black/30">
                  <img
                    src="/qrph_dummy.png"
                    alt="QR Ph payment code"
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[11px] font-mono text-zinc-600 text-center">
                  Reference: GGB-{(contract._id || contract.id || '').slice(-8).toUpperCase()}
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              {/* Simulate pay button */}
              <button
                id="btn-simulate-qr-pay"
                onClick={handleSimulatePay}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing payment…
                  </>
                ) : (
                  `Simulate Successful Scan & Pay — ₱${totalCharge.toLocaleString()}`
                )}
              </button>

              {/* Security note */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL · GigBag Escrow PH · BSP Regulated · QR Ph Standard</span>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SCREEN B — Funded / Release Payment
          ══════════════════════════════════════════════════════════════════ */}
          {(isFunded || isCompleted) && (
            <>
              {/* Success animation */}
              <div className="flex flex-col items-center py-4 space-y-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  {isFunded && (
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping" />
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-zinc-50 text-lg">
                    {isCompleted ? 'Payment Released!' : 'Funds Secured in Escrow'}
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    {isCompleted
                      ? `₱${amount.toLocaleString()} has been sent to the artist.`
                      : `₱${totalCharge.toLocaleString()} is held safely until the gig is complete.`}
                  </p>
                </div>
              </div>

              {/* Contract summary */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                <p className="text-zinc-400"><span className="text-zinc-600">Gig:</span> <span className="text-zinc-200">{contract.gigTitle}</span></p>
                <p className="text-zinc-400"><span className="text-zinc-600">Venue:</span> <span className="text-zinc-200">{contract.venueName}</span></p>
                <p className="text-zinc-400"><span className="text-zinc-600">Date:</span> <span className="text-zinc-200">{contract.date}</span></p>
                <div className="border-t border-zinc-800 pt-2 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Artist pay</span>
                    <span className="text-emerald-400 font-bold">₱{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">GigBag fee (5%)</span>
                    <span className="text-amber-400">₱{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-500">Total deposited</span>
                    <span className="text-zinc-300">₱{totalCharge.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-zinc-400 pt-1">
                  <span className="text-zinc-600">Status:</span>{' '}
                  <span className={isCompleted ? 'text-violet-400' : 'text-emerald-400'}>
                    {isCompleted ? '✅ PAID — Escrow Released' : '🔒 FUNDED — Held in Escrow'}
                  </span>
                </p>
              </div>

              {/* Release block */}
              {isFunded && (
                <div className="space-y-3">
                  {/* Date gate notice */}
                  {!canRelease && (
                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed">
                      <p className="text-zinc-300 font-semibold mb-1">⏳ Release locked until gig date</p>
                      The payment can only be released to the artist on or after{' '}
                      <strong className="text-zinc-200">
                        {gigDate ? gigDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'the scheduled gig date'}.
                      </strong>
                    </div>
                  )}

                  {canRelease && (
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-xs text-zinc-400 leading-relaxed">
                      <p className="text-amber-400 font-semibold mb-1">⚡ Ready to release</p>
                      The gig date has passed. Once you release, funds go directly to the artist.
                      This action is <strong className="text-zinc-300">irreversible</strong>.
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <button
                    id="btn-release-payment"
                    onClick={() => setConfirmRelease(true)}
                    disabled={!canRelease}
                    className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all shadow-lg cursor-pointer ${
                      canRelease
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none'
                    } disabled:cursor-not-allowed`}
                  >
                    <Banknote className="w-4 h-4" />Release ₱{amount.toLocaleString()} to Artist
                  </button>

                  {/* Confirmation panel */}
                  {confirmRelease && (
                    <div className="bg-zinc-950 border border-red-500/30 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-red-400">Confirm Payment Release</p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        You are about to release{' '}
                        <strong className="text-emerald-400">₱{amount.toLocaleString()}</strong>{' '}
                        to the artist for{' '}
                        <strong className="text-zinc-200">{contract.gigTitle}</strong>.
                        The GigBag platform fee of{' '}
                        <strong className="text-amber-400">₱{platformFee.toLocaleString()}</strong>{' '}
                        was already collected at deposit.
                        This release is <strong className="text-red-400">permanent and cannot be undone</strong>.
                      </p>
                      {error && (
                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmRelease(false)}
                          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          id="btn-confirm-release"
                          onClick={handleRelease}
                          disabled={releasing}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {releasing ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Releasing…</>
                          ) : (
                            'Yes, Release Now'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dispute option */}
                  {!showDispute ? (
                    <button
                      id="btn-raise-dispute"
                      onClick={() => setShowDispute(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Not satisfied? Raise a dispute
                    </button>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Dispute &amp; Retraction
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Payment retraction and dispute resolution is handled by{' '}
                        <strong className="text-zinc-300">GigBag Support</strong>. Escrowed funds are
                        held securely and will not be released until the dispute is resolved.
                      </p>
                      <p className="text-xs text-zinc-500">
                        📧 Contact <span className="text-violet-400">support@gigbag.ph</span> with
                        your reference <span className="font-mono text-zinc-300">GGB-{(contract._id || contract.id || '').slice(-8).toUpperCase()}</span> to open a case.
                      </p>
                      <p className="text-[10px] text-zinc-600 italic">
                        Full in-app dispute flow coming in Phase 3.
                      </p>
                      <button
                        onClick={() => setShowDispute(false)}
                        className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                      >
                        ← Back
                      </button>
                    </div>
                  )}


                  {/* ── Simulate Release — always enabled for demo/testing ── */}
                  <div className="pt-1 border-t border-zinc-800/60">
                    <p className="text-[10px] text-zinc-600 text-center mb-2">For demo / testing purposes</p>
                    <button
                      id="btn-simulate-release"
                      onClick={handleRelease}
                      disabled={releasing}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                    >
                      {releasing ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Releasing…</>
                      ) : (
                        `Simulate Release — ₱${amount.toLocaleString()} to Artist`
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4 text-xs text-zinc-400 text-center">
                  🎉 Transaction complete. The artist has been paid. This contract is now archived.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
