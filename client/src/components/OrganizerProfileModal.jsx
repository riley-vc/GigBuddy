import { useState } from 'react';
import { X, User, Save, Loader2 } from 'lucide-react';

export default function OrganizerProfileModal({ isOpen, onClose, currentUser, onSave }) {
  const [name, setName]   = useState(currentUser?.name || '');
  const [bio, setBio]     = useState(currentUser?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), bio: bio.trim() });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 900);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      id="organizer-profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="organizer-profile-modal"
        className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-50 text-base leading-tight">Edit Profile</h3>
              <p className="text-[11px] text-zinc-500">Update your organizer info</p>
            </div>
          </div>
          <button
            id="organizer-profile-modal-close"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Avatar preview */}
          <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || currentUser?.name || 'EP')}&background=a21caf&color=fff&size=80`}
              alt="avatar preview"
              className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
            />
            <div>
              <p className="text-xs font-semibold text-zinc-300">{name || currentUser?.name || 'Your Name'}</p>
              <p className="text-[10px] text-fuchsia-400 font-mono">Event Planner</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Avatar auto-generated from name</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="op-name" className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              id="op-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Santos"
              required
              className="w-full bg-zinc-800/60 border border-zinc-700/60 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500/70 transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Bio / Description */}
          <div className="space-y-1.5">
            <label htmlFor="op-bio" className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Description <span className="text-zinc-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              id="op-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell musicians about your events, venue, and what you look for in performers..."
              className="w-full bg-zinc-800/60 border border-zinc-700/60 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500/70 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              id="op-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors cursor-pointer border border-zinc-700"
            >
              Cancel
            </button>
            <button
              id="op-save-btn"
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-fuchsia-900 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-900/30 cursor-pointer"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : saved ? (
                '✓ Saved!'
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        </form>

        {/* Safe area */}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
