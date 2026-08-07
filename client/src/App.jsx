import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Briefcase,
  Users,
  Compass,
  Sparkles,
  Store,
} from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';

import { getGigs, createGig, updateGig, updateGigStatus } from './api/gigs.js';
import { getApplications, createApplication, updateApplicationStatus } from './api/applications.js';
import {
  getContracts, createContract, signContract, fundContract,
  configurePayoutSplits, respondToPayoutSplit,
  confirmAttendance, reportNoShow, reportConcern, cancelContract, paySecondInstallment,
  updateEscrowTerms,
} from './api/contracts.js';
import { getReviews, createReview } from './api/reviews.js';
import { getUsers, updatePremium, updateProfile } from './api/users.js';
import { getRecommendations } from './api/recommendations.js';
import { getTeams, getTeam, createTeam, updateTeam } from './api/teams.js';
import { updateTeamMember } from './api/teamMembers.js';
import { createTeamInvite, getTeamInvites, updateTeamInviteStatus } from './api/teamInvites.js';
import { getConversations, createConversation, getMessages, markConversationRead } from './api/conversations.js';
import {
  getDirectConversations,
  openDirectConversation,
  markDirectConversationRead,
} from './api/directConversations.js';
import {
  getSessionBands,
  createSessionBand,
  inviteToSessionBand,
  respondToSessionBandInvite,
  removeSessionBandMember,
} from './api/sessionBands.js';

import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import HelpModal from './components/HelpModal.jsx';
import MoaContractModal from './components/MoaContractModal.jsx';
import SessionLineupBoard from './components/SessionLineupBoard.jsx';
import PaymentPortalModal from './components/PaymentPortalModal.jsx';
import RateGigModal from './components/RateGigModal.jsx';
import GigCreatorForm from './components/GigCreatorForm.jsx';
import OrganizerDashboard from './components/OrganizerDashboard.jsx';
import MusicianDashboard from './components/MusicianDashboard.jsx';
import GigMarketplace from './components/GigMarketplace.jsx';
import ArtistMarketplace from './components/ArtistMarketplace.jsx';
import ChatDrawer from './components/ChatDrawer.jsx';
import DirectChatDrawer from './components/DirectChatDrawer.jsx';
import MusicianSocialPage from './components/MusicianSocialPage.jsx';
import BandPage from './components/BandPage.jsx';
import OrganizerProfilePage from './components/OrganizerProfilePage.jsx';

// ─── Auth ─────────────────────────────────────────────────────────────────────
// currentUser now comes from AuthContext (set by LoginPage / RegisterPage).
// ──────────────────────────────────────────────────────────────────────────────

import { SOCKET_URL } from './api/config.js';

export default function App() {
  const { currentUser, login, logout } = useAuth();

  // ── Role & Navigation ─────────────────────────────────────────────────────
  const [role, setRole] = useState(currentUser.role);
  const [organizerTab, setOrganizerTab] = useState('dashboard');
  const [musicianTab, setMusicianTab] = useState('find_gigs');

  // ── GigBag Recommends (recommender entity) ──────────────────────────────
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [focusGigId, setFocusGigId] = useState(null);
  const [focusMusicianId, setFocusMusicianId] = useState(null);

  // ── Remote Data ───────────────────────────────────────────────────────────
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [musicians, setMusicians] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // every seeded user, for the sandbox switcher
  const [teams, setTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]); // teams where currentUser is an active member
  const [pendingTeamInvites, setPendingTeamInvites] = useState([]); // team invites awaiting currentUser's response
  const [sessionBands, setSessionBands] = useState([]); // session bands where currentUser is creator or member
  const [conversations, setConversations] = useState([]);
  const [directConversations, setDirectConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Chat State ────────────────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatConvoId, setActiveChatConvoId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]); // messages for the active conversation
  const [chatLoading, setChatLoading] = useState(false);
  const socketRef = useRef(null);

  // ── Direct (musician-to-musician) Chat State ─────────────────────────────
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);
  const [activeDirectConvoId, setActiveDirectConvoId] = useState(null);
  const [directChatMessages, setDirectChatMessages] = useState([]);
  const [directChatLoading, setDirectChatLoading] = useState(false);
  const activeDirectConvoIdRef = useRef(null);
  useEffect(() => { activeDirectConvoIdRef.current = activeDirectConvoId; }, [activeDirectConvoId]);

  // ── Musician local profile state ─────────────────────────────────────────
  const [profile, setProfile] = useState(currentUser);

  // ── MoA Modal ─────────────────────────────────────────────────────────────
  const [isMoaModalOpen, setIsMoaModalOpen] = useState(false);
  const [draftContract, setDraftContract] = useState({});
  const [signingTargetAppId, setSigningTargetAppId] = useState(null);

  // ── Session Lineup Board ─────────────────────────────────────────────────
  const [isLineupOpen, setIsLineupOpen] = useState(false);
  const [lineupContract, setLineupContract] = useState({});

  const handleOpenLineup = (contract) => {
    setLineupContract(contract);
    setIsLineupOpen(true);
  };

  // ── Payment Portal Modal ──────────────────────────────────────────────────
  const [isPaymentPortalOpen, setIsPaymentPortalOpen] = useState(false);
  const [paymentPortalContract, setPaymentPortalContract] = useState(null);
  const [isRateGigOpen, setIsRateGigOpen] = useState(false);
  const [rateGigContract, setRateGigContract] = useState(null);

  // ── Help Modal ────────────────────────────────────────────────────────────
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // ── Initialise Socket.io ──────────────────────────────────────────────────
  useEffect(() => {
    // Send real userId + role from the logged-in user
    const socket = io(SOCKET_URL, {
      auth: { userId: currentUser._id, role: currentUser.role },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Incoming message from server — route to gig chat or direct chat by conversationId
    socket.on('chat:receive', (message) => {
      const cid = message.conversationId?.toString();
      const isDirect = cid === activeDirectConvoIdRef.current;
      const setter = isDirect ? setDirectChatMessages : setChatMessages;
      setter((prev) => {
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
      refreshDirectConversations();
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
      const [gigsData, appsData, contractsData, musiciansData, teamsData, allUsersData, reviewsData] = await Promise.all([
        getGigs(),
        getApplications(),
        getContracts(),
        getUsers({ role: 'musician' }),
        getTeams(),
        getUsers(),
        getReviews(),
      ]);

      setGigs(gigsData.map(normalizeId));
      setApplications(appsData.map(normalizeApp));
      setContracts(contractsData.map(normalizeId));
      setMusicians(musiciansData.map(normalizeId));
      setTeams(teamsData.map(normalizeId));
      setAllUsers(allUsersData.map(normalizeId));
      setReviews(reviewsData.map(normalizeId));

      // Load conversations for both users (mock: organizer + musician)
      await refreshConversations();
      await refreshDirectConversations();
      await refreshMyTeams();
      await refreshSessionBands();
      await refreshPendingTeamInvites();
    } catch (err) {
      setError('Could not connect to the GigBuddy API. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshConversations = async (asUser = currentUser) => {
    try {
      const param = asUser.role === 'organizer'
        ? { organizerId: asUser._id }
        : { musicianId: asUser._id };
      const convos = await getConversations(param);
      setConversations(convos);
    } catch (err) {
      console.warn('Could not load conversations:', err.message);
    }
  };

  // Musician-only data — harmless no-op-ish for organizers (empty results)
  const refreshDirectConversations = async (asUser = currentUser) => {
    try {
      setDirectConversations(await getDirectConversations({ musicianId: asUser._id }));
    } catch (err) {
      console.warn('Could not load direct conversations:', err.message);
    }
  };

  const refreshMyTeams = async (asUser = currentUser) => {
    try {
      setMyTeams(await getTeams({ musicianId: asUser._id }));
    } catch (err) {
      console.warn('Could not load my teams:', err.message);
    }
  };

  const refreshPendingTeamInvites = async (asUser = currentUser) => {
    try {
      setPendingTeamInvites(await getTeamInvites({ musicianId: asUser._id, status: 'pending' }));
    } catch (err) {
      console.warn('Could not load pending band invites:', err.message);
    }
  };

  const refreshSessionBands = async (asUser = currentUser) => {
    try {
      setSessionBands(await getSessionBands({ musicianId: asUser._id }));
    } catch (err) {
      console.warn('Could not load session bands:', err.message);
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
  const activeDirectConversation = directConversations.find((c) => c._id === activeDirectConvoId) || null;

  // ── Gigs the current musician is booked for (point of contact) — feeds the
  // "which event is this session band for" picker on Social/Band pages ──────
  // Only contracts that are actually confirmed count as "already booked" —
  // a still-pending_signatures contract could fall through, so it shouldn't
  // be eligible for attaching a session band yet.
  const myGigs = contracts
    .filter((c) => (c.musicianId?._id || c.musicianId)?.toString() === currentUser._id?.toString())
    .filter((c) => ['fully_signed', 'funded', 'partially_released', 'completed'].includes(c.status))
    .map((c) => gigs.find((g) => (g._id || g.id) === (c.gigId?._id || c.gigId)))
    .filter(Boolean);

  // Bands the current musician created — only they can apply to a gig on
  // the band's behalf (matches who can configure payout splits as manager)
  const myCreatedTeams = myTeams.filter(
    (t) => (t.createdBy?._id || t.createdBy)?.toString() === currentUser._id?.toString()
  );

  // ── Completed-events count for profile stats (musician: booked as performer;
  // organizer: gigs they ran) — feeds the read-only "events" stat on Profile ──
  const completedEventsCount = contracts.filter((c) => {
    if (c.status !== 'completed') return false;
    if (currentUser.role === 'musician') {
      return (c.musicianId?._id || c.musicianId)?.toString() === currentUser._id?.toString();
    }
    return (c.organizerId?._id || c.organizerId)?.toString() === currentUser._id?.toString();
  }).length;

  // ── Persist profile edits (name/bio/location/instruments) ─────────────────
  // Deliberately avoids the generic loadData() — it's a useCallback frozen at
  // mount time, so its internal refreshers (e.g. refreshMyTeams) would still
  // close over the ORIGINAL currentUser rather than the just-saved one.
  const handleSaveProfile = async (fields) => {
    const updated = await updateProfile(currentUser._id, fields);
    setProfile((prev) => ({ ...prev, ...updated }));
    login(updated);
    setMusicians((await getUsers({ role: 'musician' })).map(normalizeId));
    setAllUsers((await getUsers()).map(normalizeId));
    if (updated.role === 'musician') await refreshMyTeams(updated);
  };

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

  // Open the chat drawer to the list view (header bell)
  const handleOpenChatList = useCallback(() => {
    setActiveChatConvoId(null);
    setChatMessages([]);
    setIsChatOpen(true);
  }, []);

  // ── GigBag Recommends (recommender entity) ──────────────────────────────
  const handleOpenRecommendationsView = useCallback(async () => {
    setRecommendationsLoading(true);
    try {
      const data = await getRecommendations({ userId: currentUser._id, role: currentUser.role });
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err.message);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [currentUser]);

  const handleOpenRecommendationItem = useCallback((type, item) => {
    setIsChatOpen(false);
    const itemId = item._id || item.id;
    if (type === 'gig') {
      setFocusGigId(itemId);
      setMusicianTab('find_gigs');
    } else {
      setFocusMusicianId(itemId);
      setOrganizerTab('artist_marketplace');
    }
  }, []);

  const handleSimulateUpgrade = useCallback(async () => {
    const updated = await updatePremium(currentUser._id, true);
    login(updated);
  }, [currentUser, login]);

  // ── Sandbox user switcher — swap mock identity to any seeded user ─────────
  const handleUserSwitch = useCallback(async (targetUser) => {
    if (targetUser._id === currentUser._id) return; // already this user
    const selectedRole = targetUser.role;

    try {
      const match = targetUser;

      // Swap the logged-in user in AuthContext + localStorage
      login(match);

      // Reset UI state
      setRole(selectedRole);
      setProfile(match);
      setOrganizerTab('dashboard');
      setMusicianTab('find_gigs');
      setIsChatOpen(false);
      setActiveChatConvoId(null);
      setChatMessages([]);
      setConversations([]);

      // Re-fetch data under the new identity
      setLoading(true);
      const [gigsData, appsData, contractsData, musiciansData, teamsData] = await Promise.all([
        getGigs(),
        getApplications(),
        getContracts(),
        getUsers({ role: 'musician' }),
        getTeams(),
      ]);
      setGigs(gigsData.map(normalizeId));
      setApplications(appsData.map(normalizeApp));
      setContracts(contractsData.map(normalizeId));
      setMusicians(musiciansData.map(normalizeId));
      setTeams(teamsData.map(normalizeId));
      await refreshConversations(match);
      await refreshDirectConversations(match);
      await refreshMyTeams(match);
      await refreshSessionBands(match);
      await refreshPendingTeamInvites(match);
    } catch (err) {
      console.error('Failed to switch user:', err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, login]);

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

  // ── Direct chat (musician-to-musician, no gig/team context) ──────────────
  const handleOpenDirectChat = useCallback(async (otherMusician) => {
    try {
      const convo = await openDirectConversation({
        musicianId: currentUser._id,
        otherMusicianId: otherMusician._id || otherMusician.id,
        musicianName: currentUser.name,
        otherMusicianName: otherMusician.name,
      });
      setDirectConversations((prev) => (prev.some((c) => c._id === convo._id) ? prev : [convo, ...prev]));
      setActiveDirectConvoId(convo._id);
      setIsDirectChatOpen(true);
      setDirectChatLoading(true);
      try {
        setDirectChatMessages(await getMessages(convo._id));
      } finally {
        setDirectChatLoading(false);
      }
      if (socketRef.current) socketRef.current.emit('chat:join', convo._id);
      await markDirectConversationRead(convo._id, currentUser._id);
    } catch (err) {
      alert(`Could not open chat: ${err.message}`);
    }
  }, [currentUser]);

  const handleSelectDirectConversation = useCallback(async (conversationId) => {
    setActiveDirectConvoId(conversationId);
    setDirectChatLoading(true);
    try {
      setDirectChatMessages(await getMessages(conversationId));
    } catch (err) {
      console.error('Failed to load direct messages:', err.message);
      setDirectChatMessages([]);
    } finally {
      setDirectChatLoading(false);
    }
    if (socketRef.current) socketRef.current.emit('chat:join', conversationId);
    try {
      await markDirectConversationRead(conversationId, currentUser._id);
    } catch (err) {
      console.warn('Could not mark direct conversation as read:', err.message);
    }
  }, [currentUser]);

  const handleCloseDirectChat = useCallback(() => {
    if (activeDirectConvoId && socketRef.current) {
      socketRef.current.emit('chat:leave', activeDirectConvoId);
    }
    setIsDirectChatOpen(false);
    setActiveDirectConvoId(null);
    setDirectChatMessages([]);
  }, [activeDirectConvoId]);

  const handleSendDirectMessage = useCallback((content) => {
    if (!activeDirectConvoId || !socketRef.current) return;
    return new Promise((resolve, reject) => {
      socketRef.current.emit(
        'chat:send',
        {
          conversationId: activeDirectConvoId,
          senderId: currentUser._id,
          senderRole: 'musician',
          senderName: currentUser.name,
          content,
          contextType: 'direct',
        },
        (ack) => {
          if (ack?.success) resolve(ack.data);
          else reject(new Error(ack?.error || 'Send failed'));
        }
      );
    });
  }, [activeDirectConvoId, currentUser]);

  // ── Band / Team roster management ─────────────────────────────────────────
  const handleCreateTeam = async ({ name, bio }) => {
    await createTeam({ name, bio, createdBy: currentUser._id });
    await refreshMyTeams();
    await loadData(); // the global (unfiltered) teams list also needs the new band
  };

  const handleInviteToRoster = async (teamId, musicianId, instrument) => {
    await createTeamInvite({ teamId, invitedBy: currentUser._id, musicianId, instrument });
  };

  const handleRemoveTeamMember = async (teamMemberId) => {
    await updateTeamMember(teamMemberId, { status: 'removed' });
  };

  // Current payout manager hands the role to a different active roster member
  const handleSetPayoutManager = async (teamId, musicianId) => {
    await updateTeam(teamId, { defaultPayoutManagerId: musicianId });
    await refreshMyTeams();
  };

  const handleRespondTeamInvite = async (inviteId, status) => {
    await updateTeamInviteStatus(inviteId, status);
    setPendingTeamInvites((prev) => prev.filter((inv) => inv._id !== inviteId));
    if (status === 'accepted') await refreshMyTeams();
  };

  // ── Session bands ──────────────────────────────────────────────────────────
  const handleCreateSessionBandOnly = async ({ name, gigId, members }) => {
    await createSessionBand({ name, gigId, createdBy: currentUser._id, members });
    await refreshSessionBands();
  };

  const handleInviteToTeamFromSocial = async (teamId, musician, instrument) => {
    await createTeamInvite({ teamId, invitedBy: currentUser._id, musicianId: musician._id || musician.id, instrument });
  };

  const handleInviteToSessionBandFromSocial = async (sessionBandId, musician, instrument) => {
    await inviteToSessionBand(sessionBandId, { musicianId: musician._id || musician.id, instrument });
    await refreshSessionBands();
  };

  const handleCreateSessionBandAndInvite = async (bandData, musician, instrument) => {
    const band = await createSessionBand({ ...bandData, createdBy: currentUser._id });
    await inviteToSessionBand(band._id, { musicianId: musician._id || musician.id, instrument });
    await refreshSessionBands();
  };

  const handleRespondSessionBandInvite = async (sessionBandId, status) => {
    await respondToSessionBandInvite(sessionBandId, currentUser._id, status);
    await refreshSessionBands();
  };

  const handleRemoveSessionBandMemberAction = async (sessionBandId, musicianId) => {
    await removeSessionBandMember(sessionBandId, musicianId);
    await refreshSessionBands();
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  // 1. Musician: Apply for a gig
  // applyAsTeam: pass a Team object to apply on the band's behalf (only
  // available to the band's creator) — the creator stays the point of
  // contact, teamId just rides along for display + downstream payout wiring
  const handleApply = async (gigId, instrument, coverNote, skills, applyAsTeam = null) => {
    try {
      const app = await createApplication({
        gigId,
        musicianId: currentUser._id,
        musicianName: applyAsTeam ? applyAsTeam.name : currentUser.name,
        musicianAvatar: applyAsTeam ? (applyAsTeam.avatar || '') : (currentUser.avatar || ''),
        instrument,
        skills,
        coverNote,
        sampleVideoUrl: currentUser.videoUrl || '',
        initiatedBy: 'musician',
        organizerId: currentUser._id,
        organizerName: currentUser.name,
        ...(applyAsTeam && { teamId: applyAsTeam._id }),
      });
      setApplications((prev) => [normalizeApp(app), ...prev]);
      // Refresh conversations so musician sees their sent application thread
      await refreshConversations();
    } catch (err) {
      alert(`Failed to submit application: ${err.message}`);
    }
  };

  // 2. Organizer: Approve application — opens MoA draft modal
  const handleApproveApplication = async (appId) => {
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

    // Band application — pull the roster so the contract seeds one payout
    // split row per member, defaulting to the team's usual payout mode
    const appTeamId = application.teamId?._id || application.teamId;
    if (appTeamId) {
      try {
        const team = await getTeam(appTeamId);
        drafted.teamId = appTeamId;
        drafted.payoutMode = team.defaultPayoutMode || 'lump_sum';
        drafted.participants = (team.roster || []).map((m) => ({
          musicianId: m.musicianId?._id || m.musicianId,
        }));
      } catch (err) {
        console.error('Failed to load team roster for contract draft:', err.message);
      }
    }

    setDraftContract(drafted);
    setSigningTargetAppId(appId);
    setIsMoaModalOpen(true);
  };

  // 3. Sign contract — POSTs a brand-new draft, or PATCHes an existing one
  // (the latter is required for band contracts, where the server gates the
  // manager's signature on every payout split being approved first)
  const handleSignContract = async (signature) => {
    try {
      if (draftContract._id) {
        await signContract(draftContract._id, role, signature);
      } else {
        const organizerSignature = role === 'organizer' ? signature : (draftContract.organizerSignature || '');
        const musicianSignature = role === 'musician' ? signature : (draftContract.musicianSignature || '');
        const bothSigned = !!organizerSignature && !!musicianSignature;
        await createContract({
          ...draftContract,
          organizerSignature,
          musicianSignature,
          status: bothSigned ? 'fully_signed' : 'pending_signatures',
          signedAt: bothSigned ? new Date().toLocaleDateString() : '',
        });
      }

      await loadData();

      setIsMoaModalOpen(false);
      setDraftContract({});
      setSigningTargetAppId(null);
      if (role === 'organizer') setOrganizerTab('dashboard');
    } catch (err) {
      alert(`Failed to sign contract: ${err.message}`);
    }
  };

  // Manager configures the band's payout split (fixed ₱ or % per member).
  // Before the first signature, the contract only exists as a local draft
  // (no _id yet — see handleApproveApplication) — there's no DB row to PATCH,
  // so mirror the server's amount math locally and merge it into the draft.
  // It's persisted for real once createContract() fires at sign time.
  const handleConfigurePayoutSplits = async (contractId, payload) => {
    if (!contractId) {
      const { method, splits, payoutMode } = payload;
      const compensation = draftContract.compensation || 0;
      const amounts = method === 'fixed'
        ? splits.map((s) => Number(s.rawValue || 0))
        : (() => {
            const pct = splits.map((s) => Math.floor((compensation * Number(s.rawValue || 0)) / 100));
            const remainder = compensation - pct.reduce((a, b) => a + b, 0);
            pct[pct.length - 1] += remainder;
            return pct;
          })();
      const managerId = (draftContract.musicianId || '').toString();
      const updated = {
        ...draftContract,
        payoutMode: payoutMode || draftContract.payoutMode || 'per_member',
        payoutSplits: splits.map((s, i) => ({
          musicianId: s.musicianId,
          amount: amounts[i],
          method,
          rawValue: Number(s.rawValue || 0),
          status: s.musicianId?.toString() === managerId ? 'approved' : 'pending',
        })),
      };
      setDraftContract(updated);
      return updated;
    }
    try {
      const updated = await configurePayoutSplits(contractId, payload);
      setDraftContract(updated);
      await loadData();
      return updated;
    } catch (err) {
      alert(`Failed to save payout splits: ${err.message}`);
      return null;
    }
  };

  // A band member approves or declines their share
  const handleRespondToPayoutSplit = async (contractId, musicianId, status) => {
    try {
      const updated = await respondToPayoutSplit(contractId, musicianId, status);
      setDraftContract(updated);
      await loadData();
      return updated;
    } catch (err) {
      alert(`Failed to respond: ${err.message}`);
      return null;
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
      const normalized = normalizeId(gig);
      setGigs((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      alert(`Failed to create gig: ${err.message}`);
      return null;
    }
  };

  // 7b. Edit gig (open gigs only)
  const handleEditGig = async (gigId, fields) => {
    try {
      const updated = await updateGig(gigId, fields);
      setGigs((prev) => prev.map((g) => (g.id === gigId ? normalizeId(updated) : g)));
    } catch (err) {
      alert(`Failed to update gig: ${err.message}`);
    }
  };

  // 7c. Start chat from Review Candidates — find existing or create a new conversation
  const handleStartChatWithApplicant = useCallback(async (app, associatedGig) => {
    try {
      // Check if a conversation already exists in local state
      let convo = conversations.find(
        (c) => c.applicationId?.toString() === (app._id || app.id)?.toString()
      );

      if (!convo) {
        // Create one (server guards against duplicates)
        convo = await createConversation({
          applicationId: app._id || app.id,
          gigId: associatedGig?.id || associatedGig?._id,
          organizerId: currentUser._id,
          musicianId: app.musicianId?._id || app.musicianId,
          gigTitle: associatedGig?.title || '',
          venueName: associatedGig?.venueName || '',
          gigBudget: associatedGig?.budget || 0,
          organizerName: currentUser.name,
          musicianName: app.musicianName || '',
        });
        // Add to local conversations list
        setConversations((prev) => [...prev, convo]);
      }

      handleOpenChat(convo._id);
    } catch (err) {
      console.error('Failed to start chat:', err.message);
    }
  }, [conversations, currentUser, handleOpenChat]);

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

  // Pushes a freshly-updated contract into every piece of state that might
  // be holding a stale copy — both PaymentPortalModal and MoaContractModal
  // can be looking at the same contract, from either role.
  const syncContractEverywhere = (updated) => {
    const uid = (updated._id || updated.id)?.toString();
    setContracts((prev) => prev.map((c) => ((c._id || c.id)?.toString() === uid ? normalizeId(updated) : c)));
    setDraftContract((prev) => ((prev._id || prev.id)?.toString() === uid ? updated : prev));
    setPaymentPortalContract((prev) => (prev && (prev._id || prev.id)?.toString() === uid ? updated : prev));
  };

  // Either party proposes the escrow split ratio / due-date window before
  // anyone signs — the "dispute" mechanism is just that nothing's locked in
  // until both sides are happy enough to sign.
  const handleUpdateEscrowTerms = async (contractId, terms) => {
    // Before the first signature the contract is only a local draft (no _id
    // yet — see handleApproveApplication), so there's no DB row to PATCH.
    // Just merge into the draft; it's sent along once createContract() fires
    // at sign time.
    if (!contractId) {
      const updated = { ...draftContract, ...terms };
      setDraftContract(updated);
      return updated;
    }
    try {
      const updated = await updateEscrowTerms(contractId, terms);
      syncContractEverywhere(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  // 10. Gig-day mutual confirmation — either party confirms; the first
  // installment only auto-releases once both have (server-enforced)
  const handleConfirmAttendance = async (contractId, role) => {
    try {
      const updated = await confirmAttendance(contractId, role);
      syncContractEverywhere(updated);
      await loadData();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const handleReportNoShow = async (contractId, reportedBy) => {
    try {
      const updated = await reportNoShow(contractId, reportedBy);
      syncContractEverywhere(updated);
      await loadData();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const handleReportConcern = async (contractId, role, note) => {
    try {
      const updated = await reportConcern(contractId, role, note);
      syncContractEverywhere(updated);
      await loadData();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const handleCancelContract = async (contractId, role) => {
    try {
      const updated = await cancelContract(contractId, role);
      syncContractEverywhere(updated);
      await loadData();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  // Pay the remaining 50% (+ any accrued late surcharge, computed server-side)
  const handlePaySecondInstallment = async (contractId) => {
    try {
      const updated = await paySecondInstallment(contractId);
      syncContractEverywhere(updated);
      await loadData();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const handleSubmitReview = async (reviewData) => {
    await createReview(reviewData); // let RateGigModal show its own inline error on failure
    await loadData();
  };

  const handleOpenRateGig = (contract) => {
    setRateGigContract(contract);
    setIsRateGigOpen(true);
  };

  const hasReviewed = (contractId) =>
    reviews.some(
      (r) => (r.contractId?._id || r.contractId)?.toString() === (contractId?._id || contractId)?.toString()
        && (r.raterId?._id || r.raterId)?.toString() === currentUser._id?.toString()
    );

  const rateeForContract = (contract) => {
    if (!contract) return null;
    if (role === 'organizer') {
      return musicians.find((m) => (m._id || m.id)?.toString() === (contract.musicianId?._id || contract.musicianId)?.toString());
    }
    return allUsers.find((u) => (u._id || u.id)?.toString() === (contract.organizerId?._id || contract.organizerId)?.toString());
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

  // Invite a whole band — point of contact is the team's payout manager,
  // teamId rides along on the Application purely for display (organizer
  // sees "The Roadside Combo applied" instead of just the manager's name).
  const handleInviteTeam = async (gigId, team, note) => {
    try {
      const app = await createApplication({
        gigId,
        musicianId: team.defaultPayoutManagerId,
        musicianName: team.name,
        musicianAvatar: team.avatar || '',
        instrument: '',
        skills: [],
        coverNote: note || `Direct invitation from event planner ${currentUser.name} for ${team.name}.`,
        initiatedBy: 'organizer',
        organizerId: currentUser._id,
        organizerName: currentUser.name,
        teamId: team._id || team.id,
      });
      setApplications((prev) => [normalizeApp(app), ...prev]);
      await refreshConversations();
      return app;
    } catch (err) {
      if (err.message?.includes('Already applied')) return null;
      alert(`Failed to send invitation: ${err.message}`);
      return null;
    }
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
    <div id="gigbuddy-app-root" className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* 1. Header */}
      <Header
        role={role}
        userName={displayUser.name}
        userAvatar={displayUser.avatar}
        userRating={displayUser.rating}
        userRatingCount={displayUser.ratingCount}
        escrowTotal={escrowTotal}
        unreadMessages={unreadMessages}
        allUsers={allUsers}
        currentUserId={currentUser._id}
        onSwitchUser={handleUserSwitch}
        onOpenChat={handleOpenChatList}
        onOpenHelp={() => setIsHelpOpen(true)}
        onLogout={logout}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 mb-bottom-nav md:mb-0">

        {/* Nav Tabs — desktop only; mobile uses BottomNav */}
        <div id="role-dependent-tabs" className="hidden md:flex bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80 items-center justify-between gap-4">
          <div className="flex gap-1">
            {role === 'organizer' ? (
              <>
                <button
                  id="tab-organizer-dashboard"
                  onClick={() => setOrganizerTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${organizerTab === 'dashboard'
                    ? 'bg-zinc-800 text-zinc-50 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Planner Dashboard
                </button>
                <button
                  id="tab-organizer-artists"
                  onClick={() => setOrganizerTab('artist_marketplace')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${organizerTab === 'artist_marketplace'
                    ? 'bg-zinc-800 text-zinc-50 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                >
                  <Store className="w-3.5 h-3.5 text-fuchsia-400" />
                  Artist Marketplace
                </button>
                <button
                  id="tab-organizer-create"
                  onClick={() => setOrganizerTab('create_gig')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${organizerTab === 'create_gig'
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${musicianTab === 'find_gigs'
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
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${musicianTab === 'dashboard'
                    ? 'bg-zinc-800 text-zinc-50 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Musician Dashboard
                  {musicianUnread > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 bg-violet-600 text-white text-[9px] font-bold rounded-full">
                      {musicianUnread}
                    </span>
                  )}
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
                conversations={conversations}
                musicians={musicians}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
                onCancelGig={handleCancelGig}
                onEditGig={handleEditGig}
                onStartChat={handleStartChatWithApplicant}
                onOpenContract={handleOpenExistingContract}
                onOpenPayment={handleOpenPaymentPortal}
                onRateGig={handleOpenRateGig}
                hasReviewed={hasReviewed}
              />
            ) : organizerTab === 'artist_marketplace' ? (
              <ArtistMarketplace
                musicians={musicians}
                teams={teams}
                gigs={gigs}
                applications={applications}
                contracts={contracts}
                onInvite={handleInviteMusician}
                onInviteTeam={handleInviteTeam}
                onOpenInviteChat={handleOpenChat}
                initialFocusMusicianId={focusMusicianId}
              />
            ) : organizerTab === 'profile' ? (
              <OrganizerProfilePage
                profile={profile}
                contracts={contracts}
                musicians={musicians}
                onSaveProfile={handleSaveProfile}
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
                contracts={contracts}
                profile={profile}
                myCreatedTeams={myCreatedTeams}
                onApply={handleApply}
                initialFocusGigId={focusGigId}
              />
            ) : musicianTab === 'social' ? (
              <MusicianSocialPage
                musicians={musicians}
                profile={profile}
                myTeams={myTeams}
                mySessionBands={sessionBands}
                myGigs={myGigs}
                onOpenDirectChat={handleOpenDirectChat}
                onInviteToTeam={handleInviteToTeamFromSocial}
                onInviteToSessionBand={handleInviteToSessionBandFromSocial}
                onCreateSessionBandAndInvite={handleCreateSessionBandAndInvite}
              />
            ) : musicianTab === 'band' ? (
              <BandPage
                profile={profile}
                myTeams={myTeams}
                myCreatedTeams={myCreatedTeams}
                mySessionBands={sessionBands}
                musicians={musicians}
                myGigs={myGigs}
                contracts={contracts}
                pendingTeamInvites={pendingTeamInvites}
                completedEventsCount={completedEventsCount}
                onSaveProfile={handleSaveProfile}
                onCreateTeam={handleCreateTeam}
                onInviteToRoster={handleInviteToRoster}
                onRemoveTeamMember={handleRemoveTeamMember}
                onSetPayoutManager={handleSetPayoutManager}
                onConfigureSplits={handleConfigurePayoutSplits}
                onRespondSplit={handleRespondToPayoutSplit}
                onCreateSessionBand={handleCreateSessionBandOnly}
                onRespondSessionBandInvite={handleRespondSessionBandInvite}
                onRemoveSessionBandMember={handleRemoveSessionBandMemberAction}
                onRespondTeamInvite={handleRespondTeamInvite}
              />
            ) : (
              <MusicianDashboard
                profile={profile}
                gigs={gigs}
                applications={applications}
                contracts={contracts}
                conversations={conversations}
                onOpenChat={handleOpenChat}
                onOpenContract={handleOpenExistingContract}
                onOpenLineup={handleOpenLineup}
                onRateGig={handleOpenRateGig}
                hasReviewed={hasReviewed}
              />
            )
          )}
        </div>

        {/* Refresh Data — compact button replacing old sandbox panel */}
        <div className="flex justify-end">
          <button
            id="btn-refresh-data"
            onClick={loadData}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </main>

      {/* MoA Modal */}
      <MoaContractModal
        isOpen={isMoaModalOpen}
        onClose={() => setIsMoaModalOpen(false)}
        contract={draftContract}
        onSign={handleSignContract}
        role={role}
        currentUser={currentUser}
        musicians={musicians}
        onConfigureSplits={handleConfigurePayoutSplits}
        onRespondSplit={handleRespondToPayoutSplit}
        onConfirmAttendance={handleConfirmAttendance}
        onReportConcern={handleReportConcern}
        onCancelContract={handleCancelContract}
        onUpdateEscrowTerms={handleUpdateEscrowTerms}
      />

      <SessionLineupBoard
        isOpen={isLineupOpen}
        onClose={() => setIsLineupOpen(false)}
        contract={lineupContract}
        musicians={musicians}
      />

      {/* Payment Portal Modal */}
      <PaymentPortalModal
        isOpen={isPaymentPortalOpen}
        onClose={() => { setIsPaymentPortalOpen(false); setPaymentPortalContract(null); }}
        contract={paymentPortalContract}
        musicians={musicians}
        onFund={handleFundContract}
        onConfirmAttendance={handleConfirmAttendance}
        onReportNoShow={handleReportNoShow}
        onReportConcern={handleReportConcern}
        onCancelContract={handleCancelContract}
        onPaySecondInstallment={handlePaySecondInstallment}
      />

      <RateGigModal
        isOpen={isRateGigOpen}
        onClose={() => { setIsRateGigOpen(false); setRateGigContract(null); }}
        contract={rateGigContract}
        currentUser={currentUser}
        role={role}
        ratee={rateeForContract(rateGigContract)}
        onSubmit={handleSubmitReview}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        conversations={conversations}
        conversation={activeConversation}
        messages={chatMessages}
        currentUserId={currentUser._id}
        currentRole={role}
        onSend={handleSendMessage}
        onSelectConversation={handleOpenChat}
        loading={chatLoading}
        isPremiumUser={!!currentUser.isPremium}
        recommendations={recommendations}
        recommendationsLoading={recommendationsLoading}
        onOpenRecommendationsView={handleOpenRecommendationsView}
        onOpenRecommendationItem={handleOpenRecommendationItem}
        onSimulateUpgrade={handleSimulateUpgrade}
      />

      <DirectChatDrawer
        isOpen={isDirectChatOpen}
        onClose={handleCloseDirectChat}
        conversations={directConversations}
        conversation={activeDirectConversation}
        messages={directChatMessages}
        currentUserId={currentUser._id}
        onSend={handleSendDirectMessage}
        onSelectConversation={handleSelectDirectConversation}
        loading={directChatLoading}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Bottom Navigation — mobile only */}
      <BottomNav
        role={role}
        organizerTab={organizerTab}
        musicianTab={musicianTab}
        unreadMessages={unreadMessages}
        onOrganizerTab={setOrganizerTab}
        onMusicianTab={setMusicianTab}
        onOpenChat={handleOpenChatList}
        onOrganizerProfile={() => setOrganizerTab('profile')}
      />

      {/* Footer — hidden on mobile to save space */}
      <footer id="app-footer" className="hidden sm:block border-t border-zinc-800 bg-zinc-950 py-5 text-center text-[10px] font-mono text-zinc-600">
        <div className="max-w-7xl mx-auto px-4">
          <span>GigBag Entertainment Marketplace • MERN Stack • Phase 1 MVP</span>
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
