import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Users,
  Compass,
  Sparkles,
  PlayCircle,
  Check,
} from 'lucide-react';

import { getGigs, createGig, updateGigStatus } from './api/gigs.js';
import { getApplications, createApplication, updateApplicationStatus } from './api/applications.js';
import { getContracts, createContract, signContract } from './api/contracts.js';

import RoleToggle from './components/RoleToggle.jsx';
import Header from './components/Header.jsx';
import MoaContractModal from './components/MoaContractModal.jsx';
import GigCreatorForm from './components/GigCreatorForm.jsx';
import OrganizerDashboard from './components/OrganizerDashboard.jsx';
import MusicianDashboard from './components/MusicianDashboard.jsx';
import GigMarketplace from './components/GigMarketplace.jsx';

// ─── Phase 1 Mock Auth ─────────────────────────────────────────────────────────
// These IDs are printed by seed.js — swap them after running the seed script.
// In Phase 2 they will come from JWT / auth context.
const MOCK_ORGANIZER = {
  _id: '6a3bf5118387e5b0180c199e',
  name: 'Sarah Jenkins',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  role: 'organizer',
};

const MOCK_MUSICIAN = {
  _id: '6a3bf5118387e5b0180c199f',
  name: 'Leo Mercer',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  primaryInstrument: 'Electric Bass & Synthesizer',
  skills: ['Groove pocket', 'Fretless bass', 'Sight-reading charts', 'MIDI routing', 'Stage presence'],
  bio: 'Professional multi-instrumentalist based in Chicago. Specializes in thick bass grooves, synth bass layers, and rhythmic syncopation for funk, jazz-fusion, and premium corporate cover bands.',
  videoUrl: 'https://www.youtube.com/watch?v=sample-bass-reel',
  availability: {
    Monday: 'available',
    Tuesday: 'busy',
    Wednesday: 'available',
    Thursday: 'tentative',
    Friday: 'available',
    Saturday: 'available',
    Sunday: 'busy',
  },
  bands: ['The Chicago Groove Syndicate', 'Velvet Slate Duo', 'RetroWave Orchestra'],
  role: 'musician',
};
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Role & Navigation ─────────────────────────────────────────────────────
  const [role, setRole] = useState('organizer');
  const [organizerTab, setOrganizerTab] = useState('dashboard');
  const [musicianTab, setMusicianTab] = useState('find_gigs');

  // ── Remote Data ───────────────────────────────────────────────────────────
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Musician local profile state (Phase 1 — will come from DB in Phase 2) ─
  const [profile, setProfile] = useState(MOCK_MUSICIAN);

  // ── MoA Modal ─────────────────────────────────────────────────────────────
  const [isMoaModalOpen, setIsMoaModalOpen] = useState(false);
  const [draftContract, setDraftContract] = useState({});
  const [signingTargetAppId, setSigningTargetAppId] = useState(null);

  // ── Load all data from the API ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [gigsData, appsData, contractsData] = await Promise.all([
        getGigs(),
        getApplications(),
        getContracts(),
      ]);

      // Normalize _id → id for component compatibility
      setGigs(gigsData.map(normalizeId));
      setApplications(appsData.map(normalizeApp));
      setContracts(contractsData.map(normalizeId));
    } catch (err) {
      setError('Could not connect to the GigBuddy API. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Compute escrow total ──────────────────────────────────────────────────
  const escrowTotal = contracts
    .filter((c) => c.status === 'fully_signed')
    .reduce((sum, c) => sum + (c.compensation || 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // 1. Musician: Apply for a gig
  const handleApply = async (gigId, instrument, coverNote, skills) => {
    try {
      const app = await createApplication({
        gigId,
        musicianId: profile._id,
        musicianName: profile.name,
        musicianAvatar: profile.avatar,
        instrument,
        skills,
        coverNote,
        sampleVideoUrl: profile.videoUrl || '',
        initiatedBy: 'musician',
      });
      setApplications((prev) => [normalizeApp(app), ...prev]);
    } catch (err) {
      alert(`Failed to submit application: ${err.message}`);
    }
  };

  // 2. Organizer: Approve application — opens MoA draft modal
  const handleApproveApplication = (appId) => {
    const application = applications.find((a) => a.id === appId);
    if (!application) return;

    const associatedGig = gigs.find((g) => g.id === (application.gigId?._id || application.gigId));
    if (!associatedGig) return;

    const drafted = {
      gigId: associatedGig.id,
      applicationId: appId,
      musicianId: application.musicianId?._id || application.musicianId,
      organizerId: MOCK_ORGANIZER._id,
      gigTitle: associatedGig.title,
      venueName: associatedGig.venueName,
      date: associatedGig.date
        ? new Date(associatedGig.date).toLocaleDateString()
        : '',
      compensation: associatedGig.budget,
      organizerSignature: '',
      musicianSignature: '',
      status: 'pending_signatures',
    };

    setDraftContract(drafted);
    setSigningTargetAppId(appId);
    setIsMoaModalOpen(true);
  };

  // 3. Sign contract — creates DB record, updates application + gig status
  const handleSignContract = async (signature) => {
    try {
      const newContract = await createContract({
        ...draftContract,
        organizerSignature: role === 'organizer' ? signature : (draftContract.organizerSignature || ''),
        musicianSignature: role === 'musician' ? signature : (draftContract.musicianSignature || ''),
        status: 'fully_signed',
        signedAt: new Date().toLocaleDateString(),
      });

      await loadData(); // Refresh all data from server

      setIsMoaModalOpen(false);
      setDraftContract({});
      setSigningTargetAppId(null);
      setOrganizerTab('dashboard');
    } catch (err) {
      alert(`Failed to sign contract: ${err.message}`);
    }
  };

  // 4. View existing contract
  const handleOpenExistingContract = (existing) => {
    setDraftContract(existing);
    setSigningTargetAppId(null);
    setIsMoaModalOpen(true);
  };

  // 5. Reject application
  const handleRejectApplication = async (appId) => {
    try {
      await updateApplicationStatus(appId, 'rejected');
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'rejected' } : app))
      );
    } catch (err) {
      alert(`Failed to reject application: ${err.message}`);
    }
  };

  // 6. Cancel gig
  const handleCancelGig = async (gigId) => {
    try {
      await updateGigStatus(gigId, 'cancelled');
      setGigs((prev) =>
        prev.map((g) => (g.id === gigId ? { ...g, status: 'cancelled' } : g))
      );
    } catch (err) {
      alert(`Failed to cancel gig: ${err.message}`);
    }
  };

  // 7. Create gig
  const handleCreateGig = async (newGigData) => {
    try {
      const gig = await createGig({
        ...newGigData,
        organizerId: MOCK_ORGANIZER._id,
      });
      setGigs((prev) => [normalizeId(gig), ...prev]);
    } catch (err) {
      alert(`Failed to create gig: ${err.message}`);
    }
  };

  // 8–10. Local musician profile mutations (Phase 1 — no DB call yet)
  const handleUpdateAvailability = (day, status) => {
    setProfile((prev) => ({
      ...prev,
      availability: { ...prev.availability, [day]: status },
    }));
  };

  const handleAddBand = (bandName) => {
    if (!profile.bands.includes(bandName)) {
      setProfile((prev) => ({ ...prev, bands: [...prev.bands, bandName] }));
    }
  };

  const handleRemoveBand = (bandName) => {
    setProfile((prev) => ({
      ...prev,
      bands: prev.bands.filter((b) => b !== bandName),
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm font-mono">Connecting to GigBuddy API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-400 text-xl">⚡</span>
          </div>
          <h2 className="font-bold text-zinc-50">API Connection Failed</h2>
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-zinc-50 text-sm font-semibold rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const currentUser = role === 'organizer' ? MOCK_ORGANIZER : profile;

  return (
    <div id="gigbuddy-app-root" className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* 1. Header */}
      <Header
        role={role}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
        escrowTotal={escrowTotal}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Role Toggle */}
        <RoleToggle role={role} onChange={(selected) => setRole(selected)} />

        {/* Nav Tabs */}
        <div id="role-dependent-tabs" className="bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {role === 'organizer' ? (
              <>
                <button
                  id="tab-organizer-dashboard"
                  onClick={() => setOrganizerTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    organizerTab === 'dashboard'
                      ? 'bg-zinc-800 text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Planner Dashboard
                </button>
                <button
                  id="tab-organizer-create"
                  onClick={() => setOrganizerTab('create_gig')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    organizerTab === 'create_gig'
                      ? 'bg-zinc-800 text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Publish Open Gig Call
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-musician-marketplace"
                  onClick={() => setMusicianTab('find_gigs')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    musicianTab === 'find_gigs'
                      ? 'bg-zinc-800 text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Find Live Gigs
                </button>
                <button
                  id="tab-musician-dashboard"
                  onClick={() => setMusicianTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    musicianTab === 'dashboard'
                      ? 'bg-zinc-800 text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Musician Dashboard
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-zinc-500 font-mono hidden md:block">
            Mode: <span className="text-violet-400 font-semibold">{role === 'organizer' ? 'Planner Portal' : 'Artist Feed'}</span>
          </div>
        </div>

        {/* Screen Body */}
        <div id="active-screen-render" className="space-y-4">
          {role === 'organizer' ? (
            organizerTab === 'dashboard' ? (
              <OrganizerDashboard
                gigs={gigs}
                applications={applications}
                contracts={contracts}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
                onCancelGig={handleCancelGig}
                onOpenContract={handleOpenExistingContract}
              />
            ) : (
              <GigCreatorForm
                onCreateGig={handleCreateGig}
                onSuccess={() => setOrganizerTab('dashboard')}
              />
            )
          ) : (
            musicianTab === 'find_gigs' ? (
              <GigMarketplace
                gigs={gigs}
                applications={applications}
                profile={profile}
                onApply={handleApply}
              />
            ) : (
              <MusicianDashboard
                profile={profile}
                gigs={gigs}
                applications={applications}
                contracts={contracts}
                onUpdateAvailability={handleUpdateAvailability}
                onAddBand={handleAddBand}
                onRemoveBand={handleRemoveBand}
              />
            )
          )}
        </div>

        {/* Interactive Sandbox Guide */}
        <div id="sandbox-walkthrough-panel" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-violet-400" />
              Sandbox Interactive Flow Guide
            </h4>
            <button
              id="btn-refresh-data"
              onClick={loadData}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {[
              ['01. PLANNER PORTAL', 'Click Review Candidates on the Planner tab. Inspect applications & cover notes.'],
              ['02. SIGN THE MoA', 'Click Approve & Draft MoA. Type your name, agree, and sign to lock escrow!'],
              ['03. SWITCH TO MUSICIAN', 'Use the top switch to toggle role to Live Musician.'],
              ['04. APPLY IN FEED', 'Go to Find Live Gigs, select a gig, and apply with your active profile.'],
              ['05. RE-VET CANDIDATES', 'Switch back to Planner. Your new application appears instantly to review!'],
            ].map(([step, desc]) => (
              <div key={step} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                <span className="font-mono text-violet-400 font-bold block">{step}</span>
                <p className="text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MoA Modal */}
      <MoaContractModal
        isOpen={isMoaModalOpen}
        onClose={() => setIsMoaModalOpen(false)}
        contract={draftContract}
        onSign={handleSignContract}
        role={role}
      />

      {/* Footer */}
      <footer id="app-footer" className="border-t border-zinc-800 bg-zinc-950 py-5 text-center text-[10px] font-mono text-zinc-600">
        <div className="max-w-7xl mx-auto px-4">
          <span>GigBuddy Entertainment Marketplace Systems • MERN Stack • Phase 1 MVP</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function normalizeId(obj) {
  if (!obj) return obj;
  return { ...obj, id: obj._id || obj.id };
}

function normalizeApp(app) {
  const base = normalizeId(app);
  // Resolve populated gigId object or plain ID string
  return {
    ...base,
    gigId: app.gigId?._id || app.gigId,
    musicianId: app.musicianId?._id || app.musicianId,
  };
}
