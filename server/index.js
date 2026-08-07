import { createServer } from 'http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';

import gigRoutes          from './routes/gigs.js';
import applicationRoutes  from './routes/applications.js';
import userRoutes         from './routes/users.js';
import contractRoutes     from './routes/contracts.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes      from './routes/messages.js';
import authRoutes         from './routes/auth.js';
import landingRoutes      from './routes/landing.js';
import teamRoutes         from './routes/teams.js';
import teamMemberRoutes   from './routes/teamMembers.js';
import teamInviteRoutes   from './routes/teamInvites.js';
import sessionSlotRoutes  from './routes/sessionSlots.js';
import directConversationRoutes from './routes/directConversations.js';
import sessionBandRoutes  from './routes/sessionBands.js';
import recommendationRoutes from './routes/recommendations.js';
import reviewRoutes from './routes/reviews.js';

import Message           from './models/Message.js';
import Conversation      from './models/Conversation.js';
import DirectConversation from './models/DirectConversation.js';

import { runSeed } from './seed.js';

dotenv.config();

const app        = express();
const httpServer = createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Production: allow origins from ALLOWED_ORIGINS env var (comma-separated)
// Development: allow localhost + any LAN device (phones on same Wi-Fi)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : [];

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (curl, Postman, same-origin)

  // Check explicit allowed list (production Vercel URL, custom domains, etc.)
  if (allowedOrigins.includes(origin)) return true;

  // Local dev: localhost + LAN addresses for phone testing
  const isLocal =
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    /^http:\/\/192\.168\.\d+\.\d+/.test(origin) ||
    /^http:\/\/10\.\d+\.\d+\.\d+/.test(origin)  ||
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/.test(origin);

  return isLocal;
}

app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/gigs',          gigRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/contracts',     contractRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/landing',       landingRoutes);
app.use('/api/teams',         teamRoutes);
app.use('/api/team-members',  teamMemberRoutes);
app.use('/api/team-invites',  teamInviteRoutes);
app.use('/api/session-slots', sessionSlotRoutes);
app.use('/api/direct-conversations', directConversationRoutes);
app.use('/api/session-bands', sessionBandRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);

// Temporary seed endpoint since Render free tier has no shell
app.get('/api/seed', async (req, res) => {
  try {
    await runSeed();
    res.json({ success: true, message: '✅ Database seeded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'GigBag API is running 🎸' });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  // Phase 1: userId + role sent from client mock auth
  // Phase 2: verify JWT here instead
  const { userId, role } = socket.handshake.auth;
  console.log(`🔌 Socket connected: ${socket.id} | role=${role} | userId=${userId}`);

  // ── Join a conversation room ──────────────────────────────────────────────
  socket.on('chat:join', (conversationId) => {
    socket.join(conversationId);
    console.log(`   ↳ Joined room: ${conversationId}`);
  });

  // ── Leave a conversation room ─────────────────────────────────────────────
  socket.on('chat:leave', (conversationId) => {
    socket.leave(conversationId);
  });

  // ── Send a message ─────────────────────────────────────────────────────────
  // Payload: { conversationId, senderId, senderRole, senderName, content, contextType }
  // contextType: 'gig' (default, Conversation) | 'direct' (DirectConversation)
  socket.on('chat:send', async (payload, ack) => {
    try {
      const { conversationId, senderId, senderRole, senderName, content, contextType = 'gig' } = payload;
      if (!content?.trim()) return;

      // Persist to DB — Message is generic (plain ObjectId ref), works for both
      const message = new Message({
        conversationId,
        senderId,
        senderRole,
        senderName,
        content: content.trim(),
      });
      await message.save();

      if (contextType === 'direct') {
        const convo = await DirectConversation.findById(conversationId);
        if (convo) {
          const senderIsA = convo.musicianAId.toString() === senderId?.toString();
          const unreadField = senderIsA ? 'unreadB' : 'unreadA';
          await DirectConversation.findByIdAndUpdate(conversationId, {
            lastMessage:   content.trim(),
            lastMessageAt: message.sentAt,
            $inc: { [unreadField]: 1 },
          });
        }
      } else {
        // Update conversation preview + increment unread for the OTHER party
        const unreadField = senderRole === 'organizer' ? 'unreadMusician' : 'unreadOrganizer';
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage:   content.trim(),
          lastMessageAt: message.sentAt,
          $inc: { [unreadField]: 1 },
        });
      }

      // Broadcast to everyone in the room (including sender for confirmation)
      io.to(conversationId).emit('chat:receive', message);

      // Also emit a conversation-updated event so the inbox list can refresh
      io.to(conversationId).emit('conversation:updated', { conversationId });

      if (ack) ack({ success: true, data: message });
    } catch (err) {
      console.error('chat:send error:', err.message);
      if (ack) ack({ success: false, error: err.message });
    }
  });

  // ── Mark conversation as read ─────────────────────────────────────────────
  // Payload: { conversationId, role, contextType, musicianId }
  socket.on('chat:read', async ({ conversationId, role, contextType = 'gig', musicianId }) => {
    try {
      if (contextType === 'direct') {
        const convo = await DirectConversation.findById(conversationId);
        if (convo) {
          const isA = convo.musicianAId.toString() === musicianId?.toString();
          await DirectConversation.findByIdAndUpdate(conversationId, isA ? { unreadA: 0 } : { unreadB: 0 });
        }
      } else {
        const update = role === 'organizer' ? { unreadOrganizer: 0 } : { unreadMusician: 0 };
        await Conversation.findByIdAndUpdate(conversationId, update);
      }
      // Notify room so both sides can update badge counts
      io.to(conversationId).emit('conversation:updated', { conversationId });
    } catch (err) {
      console.error('chat:read error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── MongoDB + Start ──────────────────────────────────────────────────────────
const PORT      = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server + Socket.io running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
