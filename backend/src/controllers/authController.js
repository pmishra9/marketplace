import { PrismaClient } from '@prisma/client';
import { users as fallbackUsers } from '../data/mockData.js';

const prisma = new PrismaClient();

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password // For demo simplicity; in production bcrypt would be used
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
    console.warn('Signup DB fallback:', err.message);
    const mockUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name,
      email: email.toLowerCase(),
      savedPayments: []
    };
    return res.status(201).json({
      success: true,
      message: 'Account created successfully (local)',
      user: mockUser
    });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { savedPayments: true }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: 'Signed in successfully',
      user: userSafe
    });
  } catch (err) {
    console.warn('Signin DB fallback:', err.message);
    const found = fallbackUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      const { password: _, ...userSafe } = found;
      return res.json({ success: true, user: userSafe });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
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
