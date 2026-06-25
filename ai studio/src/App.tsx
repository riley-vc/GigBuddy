import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Compass, 
  HelpCircle, 
  Sparkles, 
  PlayCircle, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

import { Gig, Application, MusicianProfile, MoaContract } from './types';
import { INITIAL_GIGS, INITIAL_APPLICATIONS, DEFAULT_MUSICIAN_PROFILE, INITIAL_CONTRACTS } from './data';

// Import components
import RoleToggle from './components/RoleToggle';
import Header from './components/Header';
import MoaContractModal from './components/MoaContractModal';
import GigCreatorForm from './components/GigCreatorForm';
import OrganizerDashboard from './components/OrganizerDashboard';
import MusicianDashboard from './components/MusicianDashboard';
import GigMarketplace from './components/GigMarketplace';

export default function App() {
  // Global User State
  const [role, setRole] = useState<'organizer' | 'musician'>('organizer');
  
  // Navigation tabs (changes depending on the active role)
  const [organizerTab, setOrganizerTab] = useState<'dashboard' | 'create_gig'>('dashboard');
  const [musicianTab, setMusicianTab] = useState<'dashboard' | 'find_gigs'>('find_gigs');

  // Database core state (restored from localStorage if present)
  const [gigs, setGigs] = useState<Gig[]>(() => {
    const saved = localStorage.getItem('gb_gigs');
    return saved ? JSON.parse(saved) : INITIAL_GIGS;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('gb_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [contracts, setContracts] = useState<MoaContract[]>(() => {
    const saved = localStorage.getItem('gb_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [profile, setProfile] = useState<MusicianProfile>(() => {
    const saved = localStorage.getItem('gb_profile');
    return saved ? JSON.parse(saved) : DEFAULT_MUSICIAN_PROFILE;
  });

  // MoA Draft Contract State
  const [isMoaModalOpen, setIsMoaModalOpen] = useState(false);
  const [draftContract, setDraftContract] = useState<Partial<MoaContract>>({});
  const [signingTargetAppId, setSigningTargetAppId] = useState<string | null>(null);

  // Sync state to localStorage on every change
  useEffect(() => {
    localStorage.setItem('gb_gigs', JSON.stringify(gigs));
  }, [gigs]);

  useEffect(() => {
    localStorage.setItem('gb_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('gb_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('gb_profile', JSON.stringify(profile));
  }, [profile]);

  // Calculate Total locked in escrow for Header display
  const escrowTotal = contracts
    .filter((c) => c.status === 'fully_signed')
    .reduce((sum, curr) => sum + curr.compensation, 0);

  // --- Handlers & State Updaters ---

  // 1. Musician: Apply for a gig
  const handleApply = (gigId: string, instrument: string, coverNote: string, skills: string[]) => {
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      gigId,
      musicianId: profile.id,
      musicianName: profile.name,
      musicianAvatar: profile.avatar,
      instrument,
      skills,
      sampleVideoUrl: profile.videoUrl,
      coverNote,
      status: 'pending',
      appliedAt: new Date().toLocaleDateString(),
    };

    setApplications((prev) => [newApplication, ...prev]);
  };

  // 2. Organizer: Initiating MoA Draft
  const handleApproveApplication = (appId: string) => {
    const application = applications.find((a) => a.id === appId);
    if (!application) return;

    const associatedGig = gigs.find((g) => g.id === application.gigId);
    if (!associatedGig) return;

    // Draft the contract parameters
    const drafted: Partial<MoaContract> = {
      id: `moa-${Date.now()}`,
      gigId: associatedGig.id,
      gigTitle: associatedGig.title,
      venueName: associatedGig.venueName,
      date: associatedGig.date,
      compensation: associatedGig.budget,
      organizerSignature: '',
      musicianSignature: '',
      status: 'pending_signatures',
    };

    setDraftContract(drafted);
    setSigningTargetAppId(appId);
    setIsMoaModalOpen(true);
  };

  // 3. Complete signature & approve application (moves application to approved, gig to filled, signs MoA)
  const handleSignContract = (signature: string) => {
    if (!draftContract.id || !signingTargetAppId) return;

    // A. Update application status
    setApplications((prev) =>
      prev.map((app) =>
        app.id === signingTargetAppId ? { ...app, status: 'approved' } : app
      )
    );

    // B. Update gig status to filled
    const targetApp = applications.find((a) => a.id === signingTargetAppId);
    if (targetApp) {
      setGigs((prev) =>
        prev.map((gig) =>
          gig.id === targetApp.gigId ? { ...gig, status: 'filled' } : gig
        )
      );
    }

    // C. Complete and save Moa Contract
    const completedContract: MoaContract = {
      ...(draftContract as MoaContract),
      organizerSignature: role === 'organizer' ? signature : (draftContract.organizerSignature || 'Sarah Jenkins (Skylight Lounge)'),
      musicianSignature: role === 'musician' ? signature : (draftContract.musicianSignature || profile.name),
      signedAt: new Date().toLocaleDateString(),
      status: 'fully_signed',
    };

    setContracts((prev) => [completedContract, ...prev]);
    setIsMoaModalOpen(false);
    setDraftContract({});
    setSigningTargetAppId(null);
    
    // Redirect Organizer back to contracts list or refresh
    setOrganizerTab('dashboard');
  };

  // View existing Signed MoA Contract
  const handleOpenExistingContract = (existing: Partial<MoaContract>) => {
    setDraftContract(existing);
    setSigningTargetAppId(null); // No active sign target
    setIsMoaModalOpen(true);
  };

  // 4. Organizer: Reject Application
  const handleRejectApplication = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, status: 'rejected' } : app
      )
    );
  };

  // 5. Organizer: Cancel Open Gig Call
  const handleCancelGig = (gigId: string) => {
    setGigs((prev) =>
      prev.map((g) => (g.id === gigId ? { ...g, status: 'cancelled' } : g))
    );
  };

  // 6. Organizer: Create a Gig Call
  const handleCreateGig = (newGigData: Omit<Gig, 'id' | 'createdAt' | 'status' | 'organizerId'>) => {
    const newGig: Gig = {
      ...newGigData,
      id: `gig-${Date.now()}`,
      status: 'open',
      organizerId: 'org-1',
      createdAt: new Date().toLocaleDateString(),
    };

    setGigs((prev) => [newGig, ...prev]);
  };

  // 7. Musician: Update availability status
  const handleUpdateAvailability = (day: string, status: 'available' | 'busy' | 'tentative') => {
    setProfile((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: status,
      },
    }));
  };

  // 8. Musician: Add band
  const handleAddBand = (bandName: string) => {
    if (!profile.bands.includes(bandName)) {
      setProfile((prev) => ({
        ...prev,
        bands: [...prev.bands, bandName],
      }));
    }
  };

  // 9. Musician: Remove band
  const handleRemoveBand = (bandName: string) => {
    setProfile((prev) => ({
      ...prev,
      bands: prev.bands.filter((b) => b !== bandName),
    }));
  };

  // Reset all sandbox data back to default
  const handleResetSandbox = () => {
    localStorage.removeItem('gb_gigs');
    localStorage.removeItem('gb_applications');
    localStorage.removeItem('gb_contracts');
    localStorage.removeItem('gb_profile');
    setGigs(INITIAL_GIGS);
    setApplications(INITIAL_APPLICATIONS);
    setContracts(INITIAL_CONTRACTS);
    setProfile(DEFAULT_MUSICIAN_PROFILE);
    setRole('organizer');
    setOrganizerTab('dashboard');
    setMusicianTab('find_gigs');
  };

  return (
    <div id="gigbuddy-app-root" className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col justify-between selection:bg-violet-600/30">
      
      {/* 1. Header Navigation Bar */}
      <Header 
        role={role} 
        userName={role === 'organizer' ? 'Sarah Jenkins' : profile.name} 
        userAvatar={role === 'organizer' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' : profile.avatar} 
        escrowTotal={escrowTotal}
      />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Role Toggle Switcher */}
        <RoleToggle role={role} onChange={(selected) => setRole(selected)} />

        {/* Dynamic Nav Tabs Bar */}
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

        {/* 3. Screen Body Render Router */}
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

        {/* 4. Interactive Sandbox Tutorial walkthrough card */}
        <div id="sandbox-walkthrough-panel" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="font-display font-bold text-sm text-zinc-200 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-violet-400" />
              Sandbox Interactive Flow Guide
            </h4>
            <button
              id="btn-reset-sandbox"
              onClick={handleResetSandbox}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              Reset Sandbox Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
              <span className="font-mono text-violet-400 font-bold block">01. PLANNER PORTAL</span>
              <p className="text-zinc-400 leading-relaxed">
                Click <strong className="text-zinc-200">Review Candidates</strong> on the Planner tab. Inspect Clara's resume & video.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
              <span className="font-mono text-violet-400 font-bold block">02. SIGN THE MoA</span>
              <p className="text-zinc-400 leading-relaxed">
                Click <strong className="text-zinc-200">Approve & Draft MoA</strong>. Type your name, agree, and sign to lock the escrow!
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
              <span className="font-mono text-violet-400 font-bold block">03. SWITCH TO MUSICIAN</span>
              <p className="text-zinc-400 leading-relaxed">
                Use the top switch to toggle role to <strong className="text-zinc-200">Live Musician</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
              <span className="font-mono text-violet-400 font-bold block">04. APPLY IN FEED</span>
              <p className="text-zinc-400 leading-relaxed">
                Go to <strong className="text-zinc-200">Find Live Gigs</strong>, select the Rock Festival, and apply with your active profile.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1">
              <span className="font-mono text-violet-400 font-bold block">05. RE-VET CANDIDATES</span>
              <p className="text-zinc-400 leading-relaxed">
                Switch back to Planner. Your newly submitted application appears instantly to review and sign!
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* 5. Sticky MOA Contract Drawer/Modal Layer */}
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
          <span>GigBuddy Entertainment Marketplace Systems • Developed on Cloud Native Sandbox</span>
        </div>
      </footer>

    </div>
  );
}
