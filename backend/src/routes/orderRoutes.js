import { Router } from 'express';
import { createCheckoutSession, getCheckoutSessionOrder, getOrders } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, getOrders);
router.post('/checkout-session', requireAuth, createCheckoutSession);
router.get('/checkout-session/:sessionId', requireAuth, getCheckoutSessionOrder);

export default router;
