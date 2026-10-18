import { Router } from 'express';
import {
  signup,
  signin,
  getSavedPayments,
  addSavedPayment
} from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/users/:userId/payments', getSavedPayments);
router.post('/users/:userId/payments', addSavedPayment);

export default router;
