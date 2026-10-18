import { PrismaClient } from '@prisma/client';
import { orders as fallbackOrders } from '../data/mockData.js';
import { authorizeLocalPayment, PaymentError } from '../utils/localPayments.js';

const prisma = new PrismaClient();

// Development-only receipt output. A mail provider is not configured.
const logReceiptEmail = (order) => {
  console.log('\n======================================================');
  console.log(`🧾 [RECEIPT PREVIEW] Prepared for: ${order.customerEmail}`);
  console.log(`📋 Order Reference: ${order.id}`);
  console.log(`👤 Customer: ${order.customerName}`);
  console.log(`💳 Payment: ${order.paymentMethod} (ending in ${order.cardLast4 || '4242'})`);
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

export const createOrder = async (req, res) => {
  const {
    items,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    isSubscription,
    savePayment,
    paymentType,
    savedPaymentId,
    cardDetails
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({
      success: false,
      message: 'At least one order item is required'
    });
  }

  let payment;
  try {
    payment = await authorizeLocalPayment({
      prisma,
      userId: req.authUser.id,
      paymentType,
      savedPaymentId,
      cardDetails
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('Local payment authorization failed:', err.message);
    return res.status(503).json({ success: false, message: 'The payment service is unavailable. Please try again.' });
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        customerName: req.authUser.name,
        customerEmail: req.authUser.email,
        userId: req.authUser.id,
        subtotal: Number(subtotal || totalAmount || 0),
        discountAmount: Number(discountAmount || 0),
        taxAmount: Number(taxAmount || 0),
        totalAmount: Number(totalAmount || 0),
        paymentMethod: paymentType === 'saved' ? `Saved Card (${payment.cardBrand})` : payment.cardBrand,
        paymentProvider: payment.provider,
        paymentReference: payment.reference,
        paymentStatus: payment.status,
        cardLast4: payment.last4,
        isSubscription: Boolean(isSubscription),
        receiptEmailed: false,
        status: 'confirmed',
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            variant: i.variant || null,
            quantity: Number(i.quantity) || 1,
            price: Number(i.price) || 0
          }))
        }
      },
      include: {
        items: true
      }
    });

    if (savePayment && paymentType === 'new' && cardDetails) {
      try {
        await prisma.savedPayment.create({
          data: {
            userId: req.authUser.id,
            cardBrand: payment.cardBrand,
            last4: payment.last4,
            cardholderName: typeof cardDetails.cardholderName === 'string' && cardDetails.cardholderName.trim()
              ? cardDetails.cardholderName.trim()
              : req.authUser.name,
            expMonth: cardDetails.expiry.slice(0, 2),
            expYear: `20${cardDetails.expiry.slice(3)}`,
            isDefault: true
          }
        });
      } catch (saveErr) {
        console.warn('Could not save authorized test payment method:', saveErr.message);
      }
    }

    logReceiptEmail(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully; receipt generated locally (email delivery is not configured)',
      receiptEmailed: false,
      data: newOrder
    });
  } catch (err) {
    console.error('Authorized payment could not be recorded as an order:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Payment was authorized, but the order could not be saved. No real card was charged; please retry.'
    });
  }
};
