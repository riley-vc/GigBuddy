import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Briefcase,
  Users,
  Compass,
  Sparkles,
  PlayCircle,
  Store,
  LogOut,
} from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';

import { getGigs, createGig, updateGigStatus } from './api/gigs.js';
import { getApplications, createApplication, updateApplicationStatus } from './api/applications.js';
import { getContracts, createContract, signContract, fundContract, releasePayment } from './api/contracts.js';
import { getUsers } from './api/users.js';
import { getConversations, getMessages, markConversationRead } from './api/conversations.js';

import RoleToggle from './components/RoleToggle.jsx';
import Header from './components/Header.jsx';
import MoaContractModal from './components/MoaContractModal.jsx';
import PaymentPortalModal from './components/PaymentPortalModal.jsx';
import GigCreatorForm from './components/GigCreatorForm.jsx';
import OrganizerDashboard from './components/OrganizerDashboard.jsx';
import MusicianDashboard from './components/MusicianDashboard.jsx';
import GigMarketplace from './components/GigMarketplace.jsx';
import ArtistMarketplace from './components/ArtistMarketplace.jsx';
import ChatDrawer from './components/ChatDrawer.jsx';

// ─── Auth ─────────────────────────────────────────────────────────────────────
// currentUser now comes from AuthContext (set by LoginPage / RegisterPage).
// ──────────────────────────────────────────────────────────────────────────────

// Socket singleton — created once, reused across re-renders
const SOCKET_URL = 'http://localhost:4000';

export default function App() {
  const { currentUser, logout } = useAuth();

  // ── Role & Navigation ─────────────────────────────────────────────────────
  const [role, setRole] = useState(currentUser.role);
  const [organizerTab, setOrganizerTab] = useState('dashboard');
  const [musicianTab, setMusicianTab] = useState('find_gigs');

  // ── Remote Data ───────────────────────────────────────────────────────────
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [musicians, setMusicians] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Chat State ────────────────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatConvoId, setActiveChatConvoId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]); // messages for the active conversation
  const [chatLoading, setChatLoading] = useState(false);
  const socketRef = useRef(null);

  // ── Musician local profile state ─────────────────────────────────────────
  const [profile, setProfile] = useState(currentUser);

  // ── MoA Modal ─────────────────────────────────────────────────────────────
  const [isMoaModalOpen, setIsMoaModalOpen] = useState(false);
  const [draftContract, setDraftContract] = useState({});
  const [signingTargetAppId, setSigningTargetAppId] = useState(null);

  // ── Payment Portal Modal ──────────────────────────────────────────────────
  const [isPaymentPortalOpen, setIsPaymentPortalOpen] = useState(false);
  const [paymentPortalContract, setPaymentPortalContract] = useState(null);

  // ── Initialise Socket.io ──────────────────────────────────────────────────
  useEffect(() => {
    // Send real userId + role from the logged-in user
    const socket = io(SOCKET_URL, {
      auth: { userId: currentUser._id, role: currentUser.role },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Incoming message from server — append to active chat
    socket.on('chat:receive', (message) => {
      setChatMessages((prev) => {
        // Avoid duplicates (can happen if sender is also in the room)
        if (prev.some((m) => m._id === message._id?.toString())) return prev;
        return [...prev, message];
      });
    });

    // Conversation metadata changed (unread counts etc.) — refresh conversation list
    socket.on('conversation:updated', ({ conversationId }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== conversationId) return c;
          // Optimistic clear of unread for the current role if this convo is open
          if (activeChatConvoId === conversationId) {
            return {
              ...c,
              unreadOrganizer: role === 'organizer' ? 0 : c.unreadOrganizer,
              unreadMusician: role === 'musician' ? 0 : c.unreadMusician,
            };
          }
          return c;
        })
      );
      // Full refresh happens on loadData — do a lightweight conversations-only refresh
      refreshConversations();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]); // Re-connect with new role when user toggles

  // ── Load all data from the API ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [gigsData, appsData, contractsData, musiciansData] = await Promise.all([
        getGigs(),
        getApplications(),
        getContracts(),
        getUsers({ role: 'musician' }),
      ]);

      setGigs(gigsData.map(normalizeId));
      setApplications(appsData.map(normalizeApp));
      setContracts(contractsData.map(normalizeId));
      setMusicians(musiciansData.map(normalizeId));

      // Load conversations for both users (mock: organizer + musician)
      await refreshConversations();
    } catch (err) {
      setError('Could not connect to the GigBuddy API. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshConversations = async () => {
    try {
      const param = currentUser.role === 'organizer'
        ? { organizerId: currentUser._id }
        : { musicianId: currentUser._id };
      const convos = await getConversations(param);
      setConversations(convos);
    } catch (err) {
      console.warn('Could not load conversations:', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Compute escrow total ──────────────────────────────────────────────────
  const escrowTotal = contracts
    .filter((c) => c.status === 'fully_signed')
    .reduce((sum, c) => sum + (c.compensation || 0), 0);

  // ── Compute unread message count for current role ─────────────────────────
  const unreadMessages = conversations.reduce((sum, c) => {
    return sum + (role === 'organizer' ? (c.unreadOrganizer || 0) : (c.unreadMusician || 0));
  }, 0);

  // ── Active conversation object ────────────────────────────────────────────
  const activeConversation = conversations.find((c) => c._id === activeChatConvoId) || null;

  // ── Open chat drawer ──────────────────────────────────────────────────────
  const handleOpenChat = useCallback(async (conversationId) => {
    setActiveChatConvoId(conversationId);
    setIsChatOpen(true);
    setChatLoading(true);

    try {
      const msgs = await getMessages(conversationId);
      setChatMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err.message);
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }

    // Join socket room
    if (socketRef.current) {
      socketRef.current.emit('chat:join', conversationId);
    }

    // Mark as read
    try {
      await markConversationRead(conversationId, role);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? {
              ...c, unreadOrganizer: role === 'organizer' ? 0 : c.unreadOrganizer,
              unreadMusician: role === 'musician' ? 0 : c.unreadMusician
            }
            : c
        )
      );
      if (socketRef.current) {
        socketRef.current.emit('chat:read', { conversationId, role });
      }
    } catch (err) {
      console.warn('Could not mark conversation as read:', err.message);
    }
  }, [role]);

  const handleCloseChat = useCallback(() => {
    if (activeChatConvoId && socketRef.current) {
      socketRef.current.emit('chat:leave', activeChatConvoId);
    }
    setIsChatOpen(false);
    setActiveChatConvoId(null);
    setChatMessages([]);
  }, [activeChatConvoId]);

  // Open the most-recently-active conversation (header bell)
  const handleOpenMostRecentChat = useCallback(() => {
    const sorted = [...conversations].sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );
    if (sorted.length > 0) {
      handleOpenChat(sorted[0]._id);
    }
  }, [conversations, handleOpenChat]);

  // ── Send a chat message ───────────────────────────────────────────────────
  const handleSendMessage = useCallback((content) => {
    if (!activeChatConvoId || !socketRef.current) return;

    return new Promise((resolve, reject) => {
      socketRef.current.emit(
        'chat:send',
        {
          conversationId: activeChatConvoId,
          senderId: currentUser._id,
          senderRole: currentUser.role,
          senderName: currentUser.name,
          content,
        },
        (ack) => {
          if (ack?.success) resolve(ack.data);
          else reject(new Error(ack?.error || 'Send failed'));
        }
      );
    });
  }, [activeChatConvoId, currentUser]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // 1. Musician: Apply for a gig
  const handleApply = async (gigId, instrument, coverNote, skills) => {
    try {
      const app = await createApplication({
        gigId,
        musicianId: currentUser._id,
        musicianName: currentUser.name,
        musicianAvatar: currentUser.avatar || '',
        instrument,
        skills,
        coverNote,
        sampleVideoUrl: currentUser.videoUrl || '',
        initiatedBy: 'musician',
        organizerId: currentUser._id,
        organizerName: currentUser.name,
      });
      setApplications((prev) => [normalizeApp(app), ...prev]);
      // Refresh conversations so musician sees their sent application thread
      await refreshConversations();
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
      organizerId: currentUser._id,
      gigTitle: associatedGig.title,
      venueName: associatedGig.venueName,
      date: associatedGig.date ? new Date(associatedGig.date).toLocaleDateString() : '',
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
      await createContract({
        ...draftContract,
        organizerSignature: role === 'organizer' ? signature : (draftContract.organizerSignature || ''),
        musicianSignature: role === 'musician' ? signature : (draftContract.musicianSignature || ''),
        status: 'fully_signed',
        signedAt: new Date().toLocaleDateString(),
      });

      await loadData();

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
        organizerId: currentUser._id,
      });
      setGigs((prev) => [normalizeId(gig), ...prev]);
    } catch (err) {
      alert(`Failed to create gig: ${err.message}`);
    }
  };

  // 8. Open Payment Portal
  const handleOpenPaymentPortal = (contract) => {
    setPaymentPortalContract(contract);
    setIsPaymentPortalOpen(true);
  };

  // 9. Fund contract (organizer deposits into escrow)
  const handleFundContract = async (contractId) => {
    try {
      const updated = await fundContract(contractId);
      setContracts((prev) =>
        prev.map((c) => (c._id === contractId || c.id === contractId ? { ...normalizeId(updated) } : c))
      );
      setPaymentPortalContract(normalizeId(updated));
      await loadData();
    } catch (err) {
      throw err; // re-throw so PaymentPortalModal can show the error
    }
  };

  // 10. Release payment (organizer releases to artist)
  const handleReleasePayment = async (contractId) => {
    try {
      const updated = await releasePayment(contractId);
      setContracts((prev) =>
        prev.map((c) => (c._id === contractId || c.id === contractId ? { ...normalizeId(updated) } : c))
      );
      setIsPaymentPortalOpen(false);
      setPaymentPortalContract(null);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  // 11. Organizer invites a musician directly
  // Returns the result (with conversationId) so ArtistMarketplace can open chat
  const handleInviteMusician = async (gigId, musician, note) => {
    try {
      const app = await createApplication({
        gigId,
        musicianId: musician._id || musician.id,
        musicianName: musician.name,
        musicianAvatar: musician.avatar || '',
        instrument: (musician.instruments || [])[0] || '',
        skills: [],
        coverNote: note || `Direct invitation from event planner ${currentUser.name}.`,
        initiatedBy: 'organizer',
        organizerId: currentUser._id,
        organizerName: currentUser.name,
      });
      setApplications((prev) => [normalizeApp(app), ...prev]);
      await refreshConversations();
      // Return app so caller can extract conversationId
      return app;
    } catch (err) {
      if (err.message?.includes('Already applied')) return null;
      alert(`Failed to send invitation: ${err.message}`);
      return null;
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

  const displayUser = role === 'organizer' ? currentUser : profile;

  // Musician tab unread badge
  const musicianUnread = conversations
    .filter((c) => c.musicianId?.toString() === currentUser._id)
    .reduce((s, c) => s + (c.unreadMusician || 0), 0);

  return (
    <div id="gigbuddy-app-root" className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* 1. Header */}
      <Header
        role={role}
        userName={displayUser.name}
        userAvatar={displayUser.avatar}
        escrowTotal={escrowTotal}
        unreadMessages={unreadMessages}
        onOpenChat={handleOpenMostRecentChat}
      />

      {/* Logout button — top-right overlay */}
      <div className="fixed top-3 right-4 z-50">
        <button
          id="btn-logout"
          onClick={logout}
          title="Log out"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-600 text-xs font-semibold rounded-lg backdrop-blur-sm transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Role Toggle */}
        <RoleToggle role={role} onChange={(selected) => setRole(selected)} />

        {/* Nav Tabs */}
        <div id="role-dependent-tabs" className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {role === 'organizer' ? (
              <>
                <button
                  id="tab-organizer-dashboard"
                  onClick={() => setOrganizerTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${organizerTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Planner Dashboard
                </button>
                <button
                  id="tab-organizer-artists"
                  onClick={() => setOrganizerTab('artist_marketplace')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${organizerTab === 'artist_marketplace'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  Artist Marketplace
                </button>
                <button
                  id="tab-organizer-create"
                  onClick={() => setOrganizerTab('create_gig')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${organizerTab === 'create_gig'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Publish Open Gig Call
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-musician-marketplace"
                  onClick={() => setMusicianTab('find_gigs')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${musicianTab === 'find_gigs'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Find Live Gigs
                </button>
                <button
                  id="tab-musician-dashboard"
                  onClick={() => setMusicianTab('dashboard')}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${musicianTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Musician Dashboard
                  {musicianUnread > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full">
                      {musicianUnread}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-gray-400 font-mono hidden md:block">
            Mode: <span className="text-indigo-600 font-semibold">{role === 'organizer' ? 'Planner Portal' : 'Artist Feed'}</span>
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
                onOpenPayment={handleOpenPaymentPortal}
              />
            ) : organizerTab === 'artist_marketplace' ? (
              <ArtistMarketplace
                musicians={musicians}
                gigs={gigs}
                applications={applications}
                onInvite={handleInviteMusician}
                onOpenInviteChat={handleOpenChat}
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
                conversations={conversations}
                onUpdateAvailability={handleUpdateAvailability}
                onAddBand={handleAddBand}
                onRemoveBand={handleRemoveBand}
                onOpenChat={handleOpenChat}
              />
            )
          )}
        </div>

        {/* Interactive Sandbox Guide */}
        <div id="sandbox-walkthrough-panel" className="bg-white border border-gray-200 p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-500" />
              Sandbox Interactive Flow Guide
            </h4>
            <button
              id="btn-refresh-data"
              onClick={loadData}
              className="text-[10px] font-mono text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {[
              ['01. INVITE ARTIST', 'Go to Artist Marketplace → pick a musician → Send Direct Invitation with a personal note.'],
              ['02. OPEN CHAT', 'After inviting, click "Open Chat" to start a real-time conversation with that artist.'],
              ['03. SWITCH TO MUSICIAN', 'Toggle role to Live Musician → Musician Dashboard → check Planner Invitations inbox.'],
              ['04. REPLY IN INBOX', 'Open the invitation card — the chat drawer opens. Reply to the planner in real-time!'],
              ['05. SIGN THE MoA', 'Back in Planner mode, approve the application → Draft MoA → Sign to lock escrow.'],
            ].map(([step, desc]) => (
              <div key={step} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-1">
                <span className="font-mono text-indigo-600 font-bold block">{step}</span>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
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

      {/* Payment Portal Modal */}
      <PaymentPortalModal
        isOpen={isPaymentPortalOpen}
        onClose={() => { setIsPaymentPortalOpen(false); setPaymentPortalContract(null); }}
        contract={paymentPortalContract}
        onFund={handleFundContract}
        onRelease={handleReleasePayment}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        conversation={activeConversation}
        messages={chatMessages}
        currentUserId={currentUser._id}
        currentRole={role}
        onSend={handleSendMessage}
        loading={chatLoading}
      />

      {/* Footer */}
      <footer id="app-footer" className="border-t border-gray-200 bg-white py-5 text-center text-[10px] font-mono text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <span>GigBag Entertainment Marketplace Systems • MERN Stack • Phase 1 MVP</span>
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
  return {
    ...base,
    gigId: app.gigId?._id || app.gigId,
    musicianId: app.musicianId?._id || app.musicianId,
  };
}
