import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { orders as fallbackOrders } from '../data/mockData.js';
import { StripeConfigurationError, stripeRequest } from '../utils/stripe.js';

const prisma = new PrismaClient();

// Development-only receipt output. A mail provider is not configured.
const logReceiptEmail = (order) => {
  console.log('\n======================================================');
  console.log(`🧾 [RECEIPT PREVIEW] Prepared for: ${order.customerEmail}`);
  console.log(`📋 Order Reference: ${order.id}`);
  console.log(`👤 Customer: ${order.customerName}`);
  console.log(`💳 Payment: ${order.paymentMethod}${order.cardLast4 ? ` (ending in ${order.cardLast4})` : ''}`);
  console.log('------------------------------------------------------');
  console.log(`Subtotal:  $${Number(order.subtotal || 0).toFixed(2)}`);
  console.log(`Discounts: -$${Number(order.discountAmount || 0).toFixed(2)}`);
  console.log(`Tax:       $${Number(order.taxAmount || 0).toFixed(2)}`);
  console.log(`TOTAL:     $${Number(order.totalAmount || 0).toFixed(2)}`);
  console.log('------------------------------------------------------');
  console.log('Items:');
  order.items?.forEach((item, idx) => {
    console.log(`  ${idx + 1}. Product: ${item.productId} (${item.variant || 'Standard'}) x ${item.quantity} @ $${item.price}`);
  });
  console.log('Status: Receipt generated locally; no email was sent.');
  console.log('======================================================\n');
};

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.authUser.id },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.warn('Database query fallback to mockData:', err.message);
    const userOrders = fallbackOrders.filter((order) => order.userId === req.authUser.id);
    return res.json({
      success: true,
      count: userOrders.length,
      data: userOrders
    });
  }
};

const getStorefrontUrl = () => (process.env.STOREFRONT_URL || 'http://localhost:3000').replace(/\/+$/, '');

const flattenCheckoutItems = (items) => {
  const params = {};
  items.forEach((item, index) => {
    const prefix = `line_items[${index}]`;
    for (const [key, value] of Object.entries(item)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (nestedValue && typeof nestedValue === 'object') {
            for (const [detailKey, detailValue] of Object.entries(nestedValue)) {
              params[`${prefix}[${key}][${nestedKey}][${detailKey}]`] = String(detailValue);
            }
          } else {
            params[`${prefix}[${key}][${nestedKey}]`] = String(nestedValue);
          }
        }
      } else {
        params[`${prefix}[${key}]`] = String(value);
      }
    }
  });
  return params;
};

export const createCheckoutSession = async (req, res) => {
  const requestedItems = req.body?.items;
  if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
    return res.status(400).json({ success: false, message: 'Add between 1 and 50 items before checkout.' });
  }

  const normalizedItems = [];
  for (const item of requestedItems) {
    const quantity = Number(item?.quantity);
    if (typeof item?.productId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return res.status(400).json({ success: false, message: 'The cart contains an invalid product or quantity.' });
    }
    normalizedItems.push({
      productId: item.productId,
      variant: typeof item.variant === 'string' ? item.variant : null,
      quantity,
      discountSelected: item.discountSelected === true
    });
  }

  let createdOrder;
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: [...new Set(normalizedItems.map((item) => item.productId))] } }
    });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const pricedItems = [];

    for (const item of normalizedItems) {
      const product = productsById.get(item.productId);
      if (!product) return res.status(400).json({ success: false, message: 'A product in your cart is no longer available.' });
      if (item.variant && Array.isArray(product.variants) && product.variants.length) {
        const variantExists = product.variants.some((variant) => (typeof variant === 'string' ? variant : variant?.name) === item.variant);
        if (!variantExists) return res.status(400).json({ success: false, message: `${product.title} no longer has that variant.` });
      }

      const basePriceCents = Math.round(Number(product.price) * 100);
      const unitPriceCents = item.discountSelected ? Math.round(basePriceCents * 0.9) : basePriceCents;
      const originalPriceCents = Math.round(Number(product.originalPrice || product.price) * 100);
      pricedItems.push({
        ...item,
        product,
        unitPriceCents,
        originalPriceCents,
        lineTotalCents: unitPriceCents * item.quantity
      });
    }

    const subtotalCents = pricedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const rawSubtotalCents = pricedItems.reduce((sum, item) => sum + item.originalPriceCents * item.quantity, 0);
    const discountCents = Math.max(0, rawSubtotalCents - subtotalCents);
    const taxCents = Math.round(subtotalCents * 0.085);
    const totalCents = subtotalCents + taxCents;
    const orderId = `ORD-${randomUUID().replaceAll('-', '').toUpperCase()}`;
    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    const itemsForCheckout = pricedItems.map((item) => ({
      price_data: {
        currency,
        unit_amount: item.unitPriceCents,
        product_data: { name: item.product.title }
      },
      quantity: item.quantity
    }));
    if (taxCents > 0) {
      itemsForCheckout.push({
        price_data: {
          currency,
          unit_amount: taxCents,
          product_data: { name: 'Estimated sales tax (8.5%)' }
        },
        quantity: 1
      });
    }

    createdOrder = await prisma.order.create({
      data: {
        id: orderId,
        customerName: req.authUser.name,
        customerEmail: req.authUser.email,
        userId: req.authUser.id,
        subtotal: subtotalCents / 100,
        discountAmount: discountCents / 100,
        taxAmount: taxCents / 100,
        totalAmount: totalCents / 100,
        paymentMethod: 'Stripe Checkout',
        paymentProvider: 'stripe',
        paymentStatus: 'pending',
        isSubscription: false,
        receiptEmailed: false,
        status: 'pending',
        items: {
          create: pricedItems.map((item) => ({
            productId: item.productId,
            variant: item.variant,
            quantity: item.quantity,
            price: item.unitPriceCents / 100
          }))
        }
      }
    });

    const storefrontUrl = getStorefrontUrl();
    const sessionParams = {
      mode: 'payment',
      'payment_method_types[0]': 'card',
      customer_email: req.authUser.email,
      client_reference_id: orderId,
      'metadata[orderId]': orderId,
      'metadata[userId]': req.authUser.id,
      success_url: `${storefrontUrl}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${storefrontUrl}/checkout?payment_cancelled=1`,
      submit_type: 'pay',
      billing_address_collection: 'auto',
      'shipping_address_collection[allowed_countries][0]': 'CA',
      'shipping_address_collection[allowed_countries][1]': 'US',
      ...flattenCheckoutItems(itemsForCheckout)
    };
    const session = await stripeRequest('/checkout/sessions', sessionParams);
    try {
      await prisma.order.update({ where: { id: orderId }, data: { paymentReference: session.id } });
    } catch (err) {
      // Keep the pending order so the session metadata can still be reconciled by the webhook.
      console.error('Could not save Stripe Checkout session reference:', err.message);
    }

    return res.status(201).json({ success: true, data: { orderId, checkoutUrl: session.url } });
  } catch (err) {
    if (createdOrder) {
      await prisma.order.delete({ where: { id: createdOrder.id } }).catch(() => {});
    }
    if (err instanceof StripeConfigurationError) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Could not create Stripe Checkout session:', err.message);
    return res.status(503).json({ success: false, message: 'Secure checkout is temporarily unavailable. Please try again.' });
  }
};

const confirmPaidCheckout = async (session) => {
  if (session.payment_status !== 'paid' || !session.metadata?.orderId) return null;
  const updateData = { paymentStatus: 'paid', status: 'confirmed', paymentMethod: 'Stripe Checkout' };
  if (session.shipping_details) updateData.shippingAddress = session.shipping_details;
  const updated = await prisma.order.updateMany({
    where: {
      id: session.metadata.orderId,
      userId: session.metadata.userId,
      paymentProvider: 'stripe',
      paymentStatus: 'pending'
    },
    data: updateData
  });
  const order = await prisma.order.findFirst({
    where: { id: session.metadata.orderId, userId: session.metadata.userId },
    include: { items: true }
  });
  return order ? { order, newlyConfirmed: updated.count > 0 } : null;
};

export const getCheckoutSessionOrder = async (req, res) => {
  try {
    const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(req.params.sessionId)}`, null, 'GET');
    if (session.metadata?.userId !== req.authUser.id) {
      return res.status(404).json({ success: false, message: 'Checkout session not found.' });
    }
    const result = await confirmPaidCheckout(session);
    if (!result) return res.status(202).json({ success: true, paymentStatus: session.payment_status, data: null });
    if (result.newlyConfirmed) logReceiptEmail(result.order);
    return res.json({ success: true, paymentStatus: session.payment_status, data: result.order });
  } catch (err) {
    if (err instanceof StripeConfigurationError) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Could not verify Stripe Checkout session:', err.message);
    return res.status(503).json({ success: false, message: 'Unable to verify payment yet. Please refresh shortly.' });
  }
};

export const handleStripeWebhookEvent = async (event) => {
  const session = event.data?.object;
  if (!session?.id || !session?.metadata?.orderId) return;

  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    const result = await confirmPaidCheckout(session);
    if (result?.newlyConfirmed) logReceiptEmail(result.order);
    return;
  }

  if (['checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) {
    await prisma.order.updateMany({
      where: {
        id: session.metadata.orderId,
        userId: session.metadata.userId,
        paymentProvider: 'stripe',
        paymentStatus: 'pending'
      },
      data: { paymentStatus: 'failed', status: 'payment_failed' }
    });
  }
};
