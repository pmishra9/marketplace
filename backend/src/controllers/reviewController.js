import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const completedPurchaseStatuses = ['confirmed', 'shipped', 'delivered', 'completed'];

const findPurchase = (userId, productId) => prisma.orderItem.findFirst({
  where: {
    productId,
    order: {
      userId,
      paymentStatus: 'authorized',
      status: { in: completedPurchaseStatuses }
    }
  },
  select: { orderId: true }
});

export const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const [reviews, purchase, existingReview] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      req.authUser ? findPurchase(req.authUser.id, productId) : null,
      req.authUser ? prisma.review.findUnique({
        where: { userId_productId: { userId: req.authUser.id, productId } }
      }) : null
    ]);

    return res.json({
      success: true,
      data: reviews,
      eligibility: req.authUser ? {
        canReview: Boolean(purchase) && !existingReview,
        alreadyReviewed: Boolean(existingReview),
        purchased: Boolean(purchase)
      } : null
    });
  } catch (err) {
    console.error('Review lookup failed:', err.message);
    return res.status(503).json({ success: false, message: 'Reviews are unavailable right now.' });
  }
};

export const createProductReview = async (req, res) => {
  const { productId } = req.params;
  const rating = Number(req.body.rating);
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';

  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !body || body.length > 4000 || title.length > 120) {
    return res.status(400).json({
      success: false,
      message: 'Provide a 1–5 star rating, review text up to 4,000 characters, and a title up to 120 characters.'
    });
  }

  try {
    const purchase = await findPurchase(req.authUser.id, productId);
    if (!purchase) {
      return res.status(403).json({ success: false, message: 'You can review this product after purchasing it.' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.authUser.id,
        productId,
        orderId: purchase.orderId,
        rating,
        title: title || null,
        body
      },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } }
      }
    });
    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
    }
    if (err.code === 'P2003' || err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    console.error('Review creation failed:', err.message);
    return res.status(503).json({ success: false, message: 'Your review could not be saved right now.' });
  }
};
