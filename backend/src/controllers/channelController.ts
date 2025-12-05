import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// helper: typed request with user id injected by auth middleware
interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

// GET /api/channels/list
export async function listChannels(_req: AuthedRequest, res: Response) {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { createdAt: 'asc' },
    });

    res.json({ channels });
  } catch (err) {
    console.error('listChannels error:', err);
    res.status(500).json({ error: 'Failed to list channels' });
  }
}

// POST /api/channels/create
export async function createChannel(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let { name, isPrivate } = req.body as { name: string; isPrivate?: boolean };

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    name = name.trim();
    if (!name.startsWith('#')) {
      name = `#${name}`;
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        isPrivate: Boolean(isPrivate),
        createdById: userId,
        // creator automatically becomes a member
        members: {
          create: {
            userId,
          },
        },
      },
    });

    res.status(201).json({ channel });
  } catch (err) {
    console.error('createChannel error:', err);
    res.status(500).json({ error: 'Failed to create channel' });
  }
}

// POST /api/channels/:channelId/join
export async function joinChannel(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { channelId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // check if already a member
    const existing = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId,
          channelId,
        },
      },
    });

    if (existing) {
      // already joined; not an error
      return res.status(200).json({ joined: true, alreadyMember: true });
    }

    await prisma.channelMember.create({
      data: {
        userId,
        channelId,
      },
    });

    res.status(201).json({ joined: true, alreadyMember: false });
  } catch (err) {
    console.error('joinChannel error:', err);
    res.status(500).json({ error: 'Failed to join channel' });
  }
}

// POST /api/channels/:channelId/leave
export async function leaveChannel(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { channelId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.channelMember.deleteMany({
      where: {
        userId,
        channelId,
      },
    });

    res.json({ left: true });
  } catch (err) {
    console.error('leaveChannel error:', err);
    res.status(500).json({ error: 'Failed to leave channel' });
  }
}
