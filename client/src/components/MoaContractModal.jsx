import { useState } from 'react';
import { X, Shield, FileText, CheckCircle } from 'lucide-react';

export default function MoaContractModal({ isOpen, onClose, contract, onSign, role }) {
  const [signatureText, setSignatureText] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    <div id="moa-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        id="moa-modal-container"
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Memorandum of Agreement</h3>
              <p className="text-xs text-gray-500">GigBag Standard Legal MoA & Escrow Lock</p>
            </div>
          </div>
          <button
            id="close-moa-modal"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
          {/* Escrow Badge */}
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-800 text-xs uppercase tracking-wider">Escrow Security Escort</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Upon fully signing this document, the designated talent budget of{' '}
                <strong className="text-emerald-800">₱{contract.compensation?.toLocaleString()}</strong> will be locked in
                GigBag's secure escrow contract. Funds are released 24 hours post-performance.
              </p>
            </div>
          </div>

          {/* Contract Text */}
          <div className="border border-gray-200 p-5 rounded-lg bg-gray-50 font-mono text-[11px] leading-5 space-y-4 max-h-[300px] overflow-y-auto select-none">
            <p className="text-center font-bold text-gray-500 uppercase tracking-widest text-xs border-b border-gray-200 pb-2">
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
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-500 block mb-2 uppercase tracking-wider text-[10px]">Client Signature (Planner)</span>
              {contract.organizerSignature ? (
                <div className="space-y-1">
                  <span className="text-indigo-600 font-bold italic text-sm">✗ {contract.organizerSignature}</span>
                  <span className="text-gray-400 block text-[9px]">Verified on {contract.signedAt || new Date().toLocaleDateString()}</span>
                </div>
              ) : (
                <span className="text-amber-500 italic flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending signature
                </span>
              )}
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-500 block mb-2 uppercase tracking-wider text-[10px]">Artist Signature (Musician)</span>
              {contract.musicianSignature ? (
                <div className="space-y-1">
                  <span className="text-emerald-600 font-bold italic text-sm">✗ {contract.musicianSignature}</span>
                  <span className="text-gray-400 block text-[9px]">Verified on {contract.signedAt || new Date().toLocaleDateString()}</span>
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
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          {isAlreadySignedByRole ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>You have officially signed this Memorandum of Agreement!</span>
            </div>
          ) : (
            <form onSubmit={handleSign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Type your Legal Full Name to sign electronically:
                </label>
                <input
                  id="moa-signature-input"
                  type="text"
                  placeholder="e.g. Carlo Reyes"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  id="moa-terms-checkbox"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-gray-500 select-none">
                  I certify that I am authorized to execute this agreement, and understand that GigBag will lock/secure budget funds in an escrow transaction state.
                </span>
              </label>

              {error && (
                <p id="moa-form-error" className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded border border-amber-100">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  id="cancel-moa-btn"
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="submit-moa-btn"
                  type="submit"
                  className="btn-primary flex-1 py-2.5 text-xs font-semibold"
                >
                  Sign & Escrow Contract
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
