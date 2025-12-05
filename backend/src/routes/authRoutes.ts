import { Router } from 'express';
import { registerUser, loginUser, refreshToken } from '../controllers/authController';

const router = Router();

// Auth flow — logic implemented in next steps
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

export default router;
