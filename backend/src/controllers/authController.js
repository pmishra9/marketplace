import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/passwords.js';

const prisma = new PrismaClient();

export const signup = async (req, res) => {
  const { name, username, email, password } = req.body;

  if ([name, username, email, password].some((value) => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Name, username, email, and password are required'
    });
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(normalizedUsername)) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 3–32 characters and use only letters, numbers, or underscores'
    });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.username === normalizedUsername
          ? 'That username is already taken'
          : 'An account with this email already exists'
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        username: normalizedUsername,
        email: normalizedEmail,
        password: await hashPassword(password)
      },
      include: {
        savedPayments: true
      }
    });

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userSafe
    });
  } catch (err) {
    console.error('Signup database error:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Account service is unavailable. Please try again later.'
    });
  }
};

export const signin = async (req, res) => {
  const { username, email, password } = req.body;
  const login = String(username || email || '').trim().toLowerCase();

  if (!login || typeof password !== 'string' || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username or email and password are required'
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] },
      include: { savedPayments: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    const passwordCheck = await verifyPassword(password, user.password);
    if (!passwordCheck.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    if (passwordCheck.needsUpgrade) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(password) }
      });
    }

    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: 'Signed in successfully',
      user: userSafe
    });
  } catch (err) {
    console.error('Signin database error:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Account service is unavailable. Please try again later.'
    });
  }
};

export const getSavedPayments = async (req, res) => {
  const { userId } = req.params;

  try {
    const payments = await prisma.savedPayment.findMany({
      where: { userId }
    });
    return res.json({ success: true, data: payments });
  } catch (err) {
    return res.json({ success: true, data: [] });
  }
};

export const addSavedPayment = async (req, res) => {
  const { userId } = req.params;
  const { cardBrand, last4, cardholderName, expMonth, expYear, isDefault } = req.body;

  if (!last4 || !cardBrand) {
    return res.status(400).json({
      success: false,
      message: 'Card details are incomplete'
    });
  }

  try {
    const payment = await prisma.savedPayment.create({
      data: {
        userId,
        cardBrand,
        last4,
        cardholderName: cardholderName || 'Cardholder',
        expMonth: expMonth || '12',
        expYear: expYear || '28',
        isDefault: Boolean(isDefault)
      }
    });

    return res.status(201).json({ success: true, data: payment });
  } catch (err) {
    console.warn('Save payment error:', err.message);
    return res.status(201).json({
      success: true,
      data: {
        id: `pay-${Date.now().toString().slice(-4)}`,
        userId,
        cardBrand,
        last4,
        cardholderName: cardholderName || 'Cardholder',
        expMonth: expMonth || '12',
        expYear: expYear || '28',
        isDefault: true
      }
    });
  }
};
