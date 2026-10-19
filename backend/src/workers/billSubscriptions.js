import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { stripeRequest } from '../utils/stripe.js';

dotenv.config();

const prisma = new PrismaClient();
const addOneMonth = (date) => {
  const next = new Date(date);
  const day = next.getUTCDate();
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(Math.min(day, new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)).getUTCDate()));
  return next;
};
const monthKey = (date) => date.toISOString().slice(0, 7);

const run = async () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is required to run subscription billing.');
  const due = await prisma.subscription.findMany({
    where: { status: 'active', nextBillingAt: { lte: new Date() } },
    orderBy: { nextBillingAt: 'asc' },
    include: { user: true }
  });

  for (const subscription of due) {
    if (!subscription.stripeCustomerId || !subscription.stripePaymentMethodId) {
      await prisma.subscription.updateMany({
        where: { id: subscription.id, status: 'active', billingAttempt: subscription.billingAttempt },
        data: { status: 'needs_payment_method' }
      });
      continue;
    }

    const period = monthKey(subscription.nextBillingAt);
    const attempt = subscription.billingAttempt + 1;
    const claim = await prisma.subscription.updateMany({
      where: {
        id: subscription.id,
        status: 'active',
        billingAttempt: subscription.billingAttempt,
        nextBillingAt: subscription.nextBillingAt
      },
      data: { billingAttempt: attempt }
    });
    if (!claim.count) continue;

    const orderId = `SUB-${subscription.id}-${period}`;
    const subtotal = subscription.items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
    const originalSubtotal = subscription.items.reduce((sum, item) => sum + Number(item.originalUnitPrice || item.unitPrice) * Number(item.quantity), 0);
    const orderData = {
      customerName: subscription.user.name,
      customerEmail: subscription.user.email,
      userId: subscription.userId,
      subtotal,
      discountAmount: Math.max(0, originalSubtotal - subtotal),
      taxAmount: Number(subscription.amount) - subtotal,
      totalAmount: Number(subscription.amount),
      paymentMethod: 'Stripe off-session',
      paymentProvider: 'stripe',
      paymentStatus: 'pending',
      isSubscription: true,
      subscriptionId: subscription.id,
      billingPeriod: period,
      status: 'pending',
      items: {
        create: subscription.items.map((item) => ({
          productId: item.productId,
          variant: item.variant || null,
          quantity: Number(item.quantity),
          price: Number(item.unitPrice)
        }))
      }
    };

    let order;
    let successfulPaymentIntent = null;
    try {
      order = await prisma.order.upsert({
        where: { id: orderId },
        create: { id: orderId, ...orderData },
        update: { paymentStatus: 'pending', status: 'pending' },
        include: { user: true }
      });
      const stillActive = await prisma.subscription.findFirst({ where: { id: subscription.id, status: 'active' } });
      if (!stillActive) {
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'canceled', status: 'canceled' } });
        continue;
      }
      const paymentIntent = await stripeRequest('/payment_intents', {
        amount: String(Math.round(Number(subscription.amount) * 100)),
        currency: subscription.currency,
        customer: subscription.stripeCustomerId,
        payment_method: subscription.stripePaymentMethodId,
        confirm: 'true',
        off_session: 'true',
        description: `Monthly subscription renewal ${period}`,
        'metadata[subscriptionId]': subscription.id,
        'metadata[orderId]': order.id,
        'metadata[billingPeriod]': period
      }, 'POST', { idempotencyKey: `subscription-${subscription.id}-${period}` });

      if (paymentIntent.status !== 'succeeded') throw new Error(`Stripe renewal payment is ${paymentIntent.status}.`);
      successfulPaymentIntent = paymentIntent;
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentReference: paymentIntent.id, paymentStatus: 'paid', status: 'confirmed' }
        }),
        prisma.subscription.updateMany({
          where: { id: subscription.id, status: 'active', nextBillingAt: subscription.nextBillingAt },
          data: {
            nextBillingAt: addOneMonth(new Date()),
            billingAttempt: 0,
            lastPaymentIntentId: paymentIntent.id
          }
        })
      ]);
      console.log(`Subscription ${subscription.id} renewed for period ${period}.`);
    } catch (error) {
      console.error(`Subscription ${subscription.id} renewal failed:`, error.message);
      if (successfulPaymentIntent?.status === 'succeeded') continue;
      if (!error.status || error.status === 429 || error.status >= 500) continue;
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'failed', status: 'payment_failed' }
        }).catch(() => {});
      }
      await prisma.subscription.updateMany({
        where: { id: subscription.id, status: 'active', nextBillingAt: subscription.nextBillingAt },
        data: { status: 'past_due' }
      });
    }
  }
};

run()
  .catch((error) => {
    console.error('Subscription billing job failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
