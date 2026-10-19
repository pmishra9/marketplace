import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { handleStripeWebhookEvent } from './controllers/orderController.js';
import { StripeConfigurationError, verifyStripeWebhook } from './utils/stripe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  let event;
  try {
    event = verifyStripeWebhook(req.body, req.get('stripe-signature'));
  } catch (err) {
    console.error('Stripe webhook signature rejected:', err.message);
    if (err instanceof StripeConfigurationError) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: 'Invalid Stripe webhook signature.' });
  }

  try {
    await handleStripeWebhookEvent(event);
    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing failed:', err.message);
    return res.status(500).json({ success: false, message: 'Stripe webhook could not be processed.' });
  }
});
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'marketplace-backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Root fallback
app.get('/', (_req, res) => {
  res.json({
    message: 'Marketplace API Server running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/products',
      '/api/products/categories',
      '/api/orders'
    ]
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Marketplace Backend running on http://localhost:${PORT}`);
});
