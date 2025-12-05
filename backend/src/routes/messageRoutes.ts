import { Router } from 'express';
import { fetchMessages, sendMessage } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All message routes require authentication
router.get('/:channelId', authMiddleware, fetchMessages);
router.post('/:channelId', authMiddleware, sendMessage);

export default router;
