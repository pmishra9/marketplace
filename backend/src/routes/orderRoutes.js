import { Router } from 'express';
import { getOrders, createOrder } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, getOrders);
router.post('/', requireAuth, createOrder);

export default router;
