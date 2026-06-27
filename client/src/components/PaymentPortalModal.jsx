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
    <div id="payment-portal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {isFunded ? 'Escrow Funded ✓' : isCompleted ? 'Payment Released ✓' : 'Secure Payment Portal'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">GigBag Escrow — QR Ph</p>
            </div>
          </div>
          <button
            id="close-payment-portal"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ══════════════════════════════════════════════════════════════════
              SCREEN A — QR Ph checkout (fully_signed)
          ══════════════════════════════════════════════════════════════════ */}
          {!isFunded && !isCompleted && (
            <>
              {/* Amount summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Total to Deposit</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                      ₱{totalCharge.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-700">Escrow Protected</span>
                  </div>
                </div>

                {/* Fee breakdown */}
                <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-500">
                    <span>Artist compensation</span>
                    <span className="text-gray-700">₱{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GigBag platform fee <span className="text-gray-400">(5%)</span></span>
                    <span className="text-amber-600">+ ₱{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5">
                    <span className="text-gray-600">Total charged to you</span>
                    <span className="text-emerald-700">₱{totalCharge.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-gray-400 truncate">{contract.gigTitle}</p>
              </div>

              {/* QR Ph branding strip */}
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <p className="text-xs text-indigo-700 font-semibold">
                  Scan with GCash, Maya, or any QR Ph-supported app
                </p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <img
                    src="/qrph_dummy.png"
                    alt="QR Ph payment code"
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[11px] font-mono text-gray-500 text-center">
                  Reference: GGB-{(contract._id || contract.id || '').slice(-8).toUpperCase()}
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg text-center">
                  {error}
                </p>
              )}

              {/* Simulate pay button */}
              <button
                id="btn-simulate-qr-pay"
                onClick={handleSimulatePay}
                disabled={loading}
                className="btn-primary w-full"
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
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
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
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  {isFunded && (
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping" />
                  )}
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {isCompleted ? 'Payment Released!' : 'Funds Secured in Escrow'}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {isCompleted
                      ? `₱${amount.toLocaleString()} has been sent to the artist.`
                      : `₱${totalCharge.toLocaleString()} is held safely until the gig is complete.`}
                  </p>
                </div>
              </div>

              {/* Contract summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                <p className="text-gray-500"><span className="text-gray-400">Gig:</span> <span className="text-gray-700">{contract.gigTitle}</span></p>
                <p className="text-gray-500"><span className="text-gray-400">Venue:</span> <span className="text-gray-700">{contract.venueName}</span></p>
                <p className="text-gray-500"><span className="text-gray-400">Date:</span> <span className="text-gray-700">{contract.date}</span></p>
                <div className="border-t border-gray-200 pt-2 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Artist pay</span>
                    <span className="text-emerald-600 font-bold">₱{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GigBag fee (5%)</span>
                    <span className="text-amber-600">₱{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-600">Total deposited</span>
                    <span className="text-gray-800">₱{totalCharge.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-gray-500 pt-1">
                  <span className="text-gray-400">Status:</span>{' '}
                  <span className={isCompleted ? 'text-indigo-600' : 'text-emerald-600'}>
                    {isCompleted ? '✅ PAID — Escrow Released' : '🔒 FUNDED — Held in Escrow'}
                  </span>
                </p>
              </div>

              {/* Release block */}
              {isFunded && (
                <div className="space-y-3">
                  {/* Date gate notice */}
                  {!canRelease && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                      <p className="text-gray-700 font-semibold mb-1">⏳ Release locked until gig date</p>
                      The payment can only be released to the artist on or after{' '}
                      <strong className="text-gray-900">
                        {gigDate ? gigDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'the scheduled gig date'}.
                      </strong>
                    </div>
                  )}

                  {canRelease && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
                      <p className="text-amber-700 font-semibold mb-1">⚡ Ready to release</p>
                      The gig date has passed. Once you release, funds go directly to the artist.
                      This action is <strong className="text-gray-900">irreversible</strong>.
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <button
                    id="btn-release-payment"
                    onClick={() => setConfirmRelease(true)}
                    disabled={!canRelease}
                    className={`btn-primary w-full ${!canRelease ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Banknote className="w-4 h-4" />Release ₱{amount.toLocaleString()} to Artist
                  </button>

                  {/* Confirmation panel */}
                  {confirmRelease && (
                    <div className="bg-white border border-red-200 shadow-sm rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-red-600">Confirm Payment Release</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        You are about to release{' '}
                        <strong className="text-emerald-600">₱{amount.toLocaleString()}</strong>{' '}
                        to the artist for{' '}
                        <strong className="text-gray-900">{contract.gigTitle}</strong>.
                        The GigBag platform fee of{' '}
                        <strong className="text-amber-600">₱{platformFee.toLocaleString()}</strong>{' '}
                        was already collected at deposit.
                        This release is <strong className="text-red-600">permanent and cannot be undone</strong>.
                      </p>
                      {error && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmRelease(false)}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          id="btn-confirm-release"
                          onClick={handleRelease}
                          disabled={releasing}
                          className="btn-danger flex-1"
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
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Not satisfied? Raise a dispute
                    </button>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Dispute &amp; Retraction
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Payment retraction and dispute resolution is handled by{' '}
                        <strong className="text-gray-700">GigBag Support</strong>. Escrowed funds are
                        held securely and will not be released until the dispute is resolved.
                      </p>
                      <p className="text-xs text-gray-500">
                        📧 Contact <span className="text-indigo-600">support@gigbag.ph</span> with
                        your reference <span className="font-mono text-gray-700">GGB-{(contract._id || contract.id || '').slice(-8).toUpperCase()}</span> to open a case.
                      </p>
                      <p className="text-[10px] text-gray-400 italic">
                        Full in-app dispute flow coming in Phase 3.
                      </p>
                      <button
                        onClick={() => setShowDispute(false)}
                        className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        ← Back
                      </button>
                    </div>
                  )}

                  {/* Dev mode override */}
                  {!gigHasPassed && !devOverride && (
                    <p className="text-center text-[10px] text-gray-400">
                      Testing?{' '}
                      <button
                        onClick={() => setDevOverride(true)}
                        className="text-gray-400 underline hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        Override date gate (dev only)
                      </button>
                    </p>
                  )}
                </div>
              )}

              {isCompleted && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-700 text-center">
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
