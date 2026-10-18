import { PrismaClient } from '@prisma/client';
import { readAccessToken } from '../utils/tokens.js';

const prisma = new PrismaClient();

const tokenFromRequest = (req) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
};

export const optionalAuth = async (req, res, next) => {
  const token = tokenFromRequest(req);
  if (!token) return next();

  try {
    const payload = readAccessToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Your session is invalid or has expired. Please sign in again.' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.tokenVersion !== payload.ver) {
      return res.status(401).json({ success: false, message: 'Your session is invalid or has expired. Please sign in again.' });
    }
    req.authUser = user;
    return next();
  } catch (err) {
    console.error('Authentication check failed:', err.message);
    return res.status(503).json({ success: false, message: 'Account service is unavailable. Please try again later.' });
  }
};

export const requireAuth = (req, res, next) => optionalAuth(req, res, (err) => {
  if (err) return next(err);
  if (!req.authUser) {
    return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  }
  return next();
});
