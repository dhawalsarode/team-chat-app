import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { MESSAGE_CREATED_EVENT, messageEvents } from '../events/messageEvents';

// Fetch paginated messages for a given channel.
// Query params:
//   limit  -> number of messages (default 20, max 50)
//   cursor -> message id; load messages older than this one
export async function fetchMessages(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { channelId } = req.params;
    const { cursor, limit } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    // Check membership: user must be part of this channel
    const membership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this channel' });
    }

    const take = Math.min(Number(limit) || 20, 50);

    let cursorCreatedAt: Date | null = null;

    if (cursor && typeof cursor === 'string') {
      const cursorMessage = await prisma.message.findUnique({
        where: { id: cursor }
      });

      if (cursorMessage) {
        cursorCreatedAt = cursorMessage.createdAt;
      }
    }

    // If no cursor or invalid cursor, start from "now"
    const beforeDate = cursorCreatedAt ?? new Date();

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        createdAt: {
          lt: beforeDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take
    });

    // Determine next cursor (oldest message from this page)
    const nextCursor = messages.length === take ? messages[messages.length - 1].id : null;

    // For UI convenience, return messages oldest -> newest
    const ordered = [...messages].reverse();

    return res.json({
      messages: ordered,
      nextCursor
    });
  } catch (err) {
    console.error('fetchMessages error:', err);
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}

// Send a message into a channel
export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { channelId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!channelId) {
      return res.status(400).json({ error: 'channelId is required' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Ensure user is a member of the channel
    const membership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this channel' });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId,
        channelId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // Notify WebSocket layer that a new message has been created
    messageEvents.emit(MESSAGE_CREATED_EVENT, message);

    return res.status(201).json({ message });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
