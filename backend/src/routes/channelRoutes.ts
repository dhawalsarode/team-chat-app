import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  listChannels,
  createChannel,
  joinChannel,
  leaveChannel,
} from '../controllers/channelController';

const router = Router();

// all channel routes require auth
router.use(authMiddleware);

// GET /api/channels/list  -> list all channels
router.get('/list', listChannels);

// for convenience also support GET /api/channels/
router.get('/', listChannels);

// POST /api/channels/create -> create a channel
router.post('/create', createChannel);

// POST /api/channels/:channelId/join -> join channel
router.post('/:channelId/join', joinChannel);

// POST /api/channels/:channelId/leave -> leave channel
router.post('/:channelId/leave', leaveChannel);

export default router;
