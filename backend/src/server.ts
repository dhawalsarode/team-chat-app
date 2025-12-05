import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env';
import { prisma } from './config/prisma';

// Routes
import authRoutes from './routes/authRoutes';
import channelRoutes from './routes/channelRoutes';
import messageRoutes from './routes/messageRoutes';

// Events
import { messageEvents, MESSAGE_CREATED_EVENT } from './events/messageEvents';
import type { Message } from '@prisma/client';

type UserId = string;

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true
  })
);

// Health Check
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));
app.get('/health/db', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'reachable' });
  } catch {
    res.status(500).json({ status: 'db unreachable' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Create HTTP Server
const httpServer = http.createServer(app);

// Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Presence Map
const onlineUsers: Map<UserId, Set<string>> = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected →', socket.id);

  // Identify user session
  socket.on('identify', (userId: string) => {
    if (!userId) return;
    const existing = onlineUsers.get(userId) ?? new Set<string>();
    existing.add(socket.id);
    onlineUsers.set(userId, existing);

    io.emit('presence:update', { userId, online: true, connections: existing.size });
  });

  // Join channel room
  socket.on('join:channel', (channelId: string) => {
    socket.join(channelId);
  });

  // Leave channel
  socket.on('leave:channel', (channelId: string) => {
    socket.leave(channelId);
  });

  // 🔥 Typing event → broadcast to others
  socket.on("typing", (channelId: string, username: string) => {
    socket.to(channelId).emit("typing", username);
  });

  // Disconnect Handling
  socket.on('disconnect', () => {
    for (const [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        io.emit('presence:update', {
          userId,
          online: sockets.size > 0,
          connections: sockets.size
        });
        if (sockets.size === 0) onlineUsers.delete(userId);
        break;
      }
    }
    console.log('Socket disconnected →', socket.id);
  });
});

// 🔥 Broadcast new messages (from HTTP API)
messageEvents.on(MESSAGE_CREATED_EVENT, (msg: Message) => {
  io.to(msg.channelId).emit('message:new', msg);
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port}`);
});
