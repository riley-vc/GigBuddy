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

import Message      from './models/Message.js';
import Conversation from './models/Conversation.js';

dotenv.config();

const app        = express();
const httpServer = createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'GigBag API is running 🎸' });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins,
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
  // Payload: { conversationId, senderId, senderRole, senderName, content }
  socket.on('chat:send', async (payload, ack) => {
    try {
      const { conversationId, senderId, senderRole, senderName, content } = payload;
      if (!content?.trim()) return;

      // Persist to DB
      const message = new Message({
        conversationId,
        senderId,
        senderRole,
        senderName,
        content: content.trim(),
      });
      await message.save();

      // Update conversation preview + increment unread for the OTHER party
      const unreadField = senderRole === 'organizer' ? 'unreadMusician' : 'unreadOrganizer';
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage:   content.trim(),
        lastMessageAt: message.sentAt,
        $inc: { [unreadField]: 1 },
      });

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
  // Payload: { conversationId, role }
  socket.on('chat:read', async ({ conversationId, role }) => {
    try {
      const update = role === 'organizer' ? { unreadOrganizer: 0 } : { unreadMusician: 0 };
      await Conversation.findByIdAndUpdate(conversationId, update);
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
