import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle } from 'lucide-react';
import { MoaContract } from '../types';

interface MoaContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Partial<MoaContract>;
  onSign: (signature: string) => void;
  role: 'organizer' | 'musician';
}

export default function MoaContractModal({
  isOpen,
  onClose,
  contract,
  onSign,
  role,
}: MoaContractModalProps) {
  const [signatureText, setSignatureText] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureText.trim()) {
      setError('Please type your legal full name to sign.');
      return;
    }
    if (!agreedToTerms) {
      setError('You must accept the terms of the agreement.');
      return;
    }
    setError('');
    onSign(signatureText);
  };

  const isAlreadySignedByRole = 
    role === 'organizer' ? !!contract.organizerSignature : !!contract.musicianSignature;

  return (
    <div id="moa-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        id="moa-modal-container"
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-zinc-50 text-lg">Memorandum of Agreement</h3>
              <p className="text-xs text-zinc-400">GigBuddy Standard Legal MoA & Escrow Lock</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans text-sm text-zinc-300 leading-relaxed">
          {/* Escrow Badge */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg flex gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider">Escrow Security Escort</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Upon fully signing this document, the designated talent budget of <strong className="text-emerald-400">${contract.compensation}</strong> will be locked in GigBuddy's secure escrow contract. Funds are released 24 hours post-performance, ensuring payment protection for the artist and cancellation refunds for the planner.
              </p>
            </div>
          </div>

          <div className="border border-zinc-800 p-5 rounded-lg bg-zinc-950 font-mono text-[11px] leading-5 space-y-4 max-h-[300px] overflow-y-auto select-none">
            <p className="text-center font-bold text-zinc-400 uppercase tracking-widest text-xs border-b border-zinc-800 pb-2">
              STANDARD LIVE PERFORMANCE AGREEMENT
            </p>
            <p>
              This Memorandum of Agreement ("Agreement") is executed on {new Date().toLocaleDateString()} by and between:
            </p>
            <p>
              <strong>1. EVENT ORGANIZER / PLANNER</strong><br />
              Representing entity and venue: {contract.venueName || "Designated Venue Partner"} (hereinafter referred to as the "Client").
            </p>
            <p>
              <strong>2. INDEPENDENT ARTIST / MUSICIAN</strong><br />
              (hereinafter referred to as the "Artist").
            </p>
            <p>
              <strong>SECTION 1. ENGAGEMENT LOGISTICS</strong><br />
              The Client hereby engages the Artist, and the Artist agrees to perform a professional live musical showcase for the production titled <strong>"{contract.gigTitle || "Live Performance Showcase"}"</strong> on the date of <strong>{contract.date}</strong>.
            </p>
            <p>
              <strong>SECTION 2. TIMELINES & PUNCTUALITY</strong><br />
              The Artist agrees to report on site for equipment setup and acoustic sound check precisely as outlined in the logistics profiles. Failure to comply with the Soundcheck window may void late-arrival security buffers.
            </p>
            <p>
              <strong>SECTION 3. COMPENSATION & TAXES</strong><br />
              In consideration for full and satisfactory performance, the Client agrees to authorize a total guaranteed flat payment of <strong>${contract.compensation}.00 USD</strong>. All payments will clear through the GigBuddy Escrow mechanism. No direct cash deals are supported under this legal contract.
            </p>
            <p>
              <strong>SECTION 4. FORCE MAJEURE & CANCELLATION</strong><br />
              Either party may cancel this engagement without liability if performance is rendered impossible due to natural disasters, acts of war, sudden venue closures, or other unforeseen acts of God, provided notice is sent through GigBuddy at least 48 hours prior.
            </p>
          </div>

          {/* Signatures Status */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
              <span className="text-zinc-500 block mb-2 uppercase tracking-wider text-[10px]">Client Signature (Planner)</span>
              {contract.organizerSignature ? (
                <div className="space-y-1">
                  <span className="text-zinc-100 font-bold italic text-sm font-display text-violet-400">✗ {contract.organizerSignature}</span>
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
                  <span className="text-zinc-100 font-bold italic text-sm font-display text-emerald-400">✗ {contract.musicianSignature}</span>
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
          {isAlreadySignedByRole ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>You have officially signed this Memorandum of Agreement!</span>
            </div>
          ) : (
            <form onSubmit={handleSign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Type your Legal Full Name to sign electronically:
                </label>
                <input
                  id="moa-signature-input"
                  type="text"
                  placeholder="e.g. Leo Mercer"
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
                  className="mt-0.5 rounded border-zinc-800 bg-zinc-900 text-violet-600 focus:ring-violet-500/50 focus:ring-offset-zinc-950 cursor-pointer"
                />
                <span className="text-xs text-zinc-400 select-none">
                  I certify that I am authorized to execute this agreement, and understand that GigBuddy will locked/secure budget funds in an escrow transaction state.
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
