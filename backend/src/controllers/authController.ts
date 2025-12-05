import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

// REGISTER USER
export async function registerUser(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, passwordHash: hashed }
    });

    return res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


// LOGIN USER
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Missing email or password' });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
    });

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


// REFRESH TOKEN
export async function refreshToken(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });

    const payload = verifyRefreshToken(token) as any;

    const exists = await prisma.refreshToken.findUnique({ where: { token } });
    if (!exists) return res.status(403).json({ error: 'Invalid refresh token' });

    const newAccess = signAccessToken(payload.userId);
    return res.json({ accessToken: newAccess });

  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
}
