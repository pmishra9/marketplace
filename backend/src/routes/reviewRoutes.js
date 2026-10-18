import { Router } from 'express';
import { createProductReview, getProductReviews } from '../controllers/reviewController.js';
import { optionalAuth, requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/products/:productId', optionalAuth, getProductReviews);
router.post('/products/:productId', requireAuth, createProductReview);

export default router;
