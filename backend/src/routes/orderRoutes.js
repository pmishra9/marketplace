import { Router } from 'express';
import { cancelSubscription, createCheckoutSession, getCheckoutSessionOrder, getOrders, getSubscriptions } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, getOrders);
router.get('/subscriptions', requireAuth, getSubscriptions);
router.delete('/subscriptions/:subscriptionId', requireAuth, cancelSubscription);
router.post('/checkout-session', requireAuth, createCheckoutSession);
router.get('/checkout-session/:sessionId', requireAuth, getCheckoutSessionOrder);

export default router;
