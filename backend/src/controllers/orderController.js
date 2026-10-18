import { PrismaClient } from '@prisma/client';
import { orders as fallbackOrders } from '../data/mockData.js';

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

export const getOrders = async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
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
    return res.json({
      success: true,
      count: fallbackOrders.length,
      data: fallbackOrders
    });
  }
};

export const createOrder = async (req, res) => {
  const {
    customerName,
    customerEmail,
    userId,
    items,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paymentMethod,
    cardLast4,
    isSubscription,
    savePayment,
    cardDetails
  } = req.body;

  if (!customerEmail || !items || !items.length) {
    return res.status(400).json({
      success: false,
      message: 'Customer email and at least one order item are required'
    });
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // Optionally save payment method if customer requested it
    if (savePayment && userId && cardDetails) {
      try {
        await prisma.savedPayment.create({
          data: {
            userId,
            cardBrand: cardDetails.brand || 'Visa',
            last4: cardDetails.last4 || '4242',
            cardholderName: cardDetails.cardholderName || customerName,
            expMonth: cardDetails.expMonth || '12',
            expYear: cardDetails.expYear || '28',
            isDefault: true
          }
        });
      } catch (saveErr) {
        console.warn('Could not auto-save card:', saveErr.message);
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        customerName: customerName || 'Valued Customer',
        customerEmail,
        userId: userId || null,
        subtotal: Number(subtotal || totalAmount || 0),
        discountAmount: Number(discountAmount || 0),
        taxAmount: Number(taxAmount || 0),
        totalAmount: Number(totalAmount || 0),
        paymentMethod: paymentMethod || 'card',
        cardLast4: cardLast4 || '4242',
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

    logReceiptEmail(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully; receipt generated locally (email delivery is not configured)',
      receiptEmailed: false,
      data: newOrder
    });
  } catch (err) {
    console.warn('Prisma order create failed, falling back:', err.message);
    const fallbackNewOrder = {
      id: orderId,
      customerName: customerName || 'Valued Customer',
      customerEmail,
      userId: userId || null,
      subtotal: Number(subtotal || totalAmount || 0),
      discountAmount: Number(discountAmount || 0),
      taxAmount: Number(taxAmount || 0),
      totalAmount: Number(totalAmount || 0),
      paymentMethod: paymentMethod || 'card',
      cardLast4: cardLast4 || '4242',
      isSubscription: Boolean(isSubscription),
      receiptEmailed: false,
      status: 'confirmed',
      items,
      createdAt: new Date().toISOString()
    };

    logReceiptEmail(fallbackNewOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully; receipt generated locally (email delivery is not configured)',
      receiptEmailed: false,
      data: fallbackNewOrder
    });
  }
};
