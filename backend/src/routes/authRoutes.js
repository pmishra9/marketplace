import { Router } from 'express';
import {
  signup,
  signin,
  getCurrentUser,
  signout,
  getSavedPayments
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', requireAuth, getCurrentUser);
router.post('/signout', requireAuth, signout);
router.get('/users/:userId/payments', requireAuth, getSavedPayments);

export default router;
