import { randomUUID } from 'node:crypto';

const ALLOWED_LOCAL_CARD = '4242424242424242';

export class PaymentError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const normalizeCardNumber = (value) => typeof value === 'string'
  ? value.replace(/[\s-]/g, '')
  : '';

const isFutureExpiry = (value) => {
  if (typeof value !== 'string' || !/^\d{2}\/\d{2}$/.test(value)) return false;
  const [monthText, yearText] = value.split('/');
  const month = Number(monthText);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(yearText);
  return new Date(year, month, 0, 23, 59, 59, 999).getTime() >= Date.now();
};

export const authorizeLocalPayment = async ({ prisma, userId, paymentType, savedPaymentId, cardDetails }) => {
  if (process.env.NODE_ENV === 'production' || (process.env.PAYMENT_MODE && process.env.PAYMENT_MODE !== 'mock')) {
    throw new PaymentError(503, 'No payment provider is configured for this environment.');
  }

  let last4;
  let cardBrand = 'Visa';
  if (paymentType === 'saved') {
    const savedPayment = await prisma.savedPayment.findFirst({
      where: { id: savedPaymentId, userId }
    });
    if (!savedPayment || savedPayment.last4 !== ALLOWED_LOCAL_CARD.slice(-4)) {
      throw new PaymentError(402, 'This saved payment method is not on the local test-card allowlist.');
    }
    if (!isFutureExpiry(`${savedPayment.expMonth}/${String(savedPayment.expYear).slice(-2)}`)) {
      throw new PaymentError(402, 'The saved test card has expired.');
    }
    last4 = savedPayment.last4;
    cardBrand = savedPayment.cardBrand || cardBrand;
  } else {
    const cardNumber = normalizeCardNumber(cardDetails?.number);
    if (cardNumber !== ALLOWED_LOCAL_CARD) {
      throw new PaymentError(402, 'Card declined. For local testing, use 4242 4242 4242 4242.');
    }
    if (!isFutureExpiry(cardDetails?.expiry) || !/^\d{3,4}$/.test(cardDetails?.cvc || '')) {
      throw new PaymentError(402, 'The test card expiry date or security code is invalid.');
    }
    last4 = cardNumber.slice(-4);
  }

  return {
    provider: 'local-mock',
    reference: `mock_${randomUUID()}`,
    status: 'authorized',
    cardBrand,
    last4
  };
};
