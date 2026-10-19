import { createHmac, timingSafeEqual } from 'node:crypto';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export class StripeConfigurationError extends Error {
  constructor(message = 'Stripe is not configured on this server.') {
    super(message);
    this.status = 503;
  }
}

export const stripeRequest = async (path, params, method = 'POST', requestOptions = {}) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new StripeConfigurationError();

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  if (requestOptions.idempotencyKey) options.headers = { ...options.headers, 'Idempotency-Key': requestOptions.idempotencyKey };
  if (params && method !== 'GET') options.body = new URLSearchParams(params);
  const response = await fetch(`${STRIPE_API_BASE}${path}`, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error?.message || 'Stripe request failed.');
    error.status = response.status;
    throw error;
  }
  return result;
};

export const verifyStripeWebhook = (rawBody, signatureHeader) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new StripeConfigurationError('STRIPE_WEBHOOK_SECRET is not configured.');

  const parts = String(signatureHeader || '').split(',').map((part) => part.trim().split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!/^\d+$/.test(timestamp || '') || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw new Error('Invalid or expired Stripe webhook signature.');
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest();
  const valid = signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
  });
  if (!valid) throw new Error('Invalid Stripe webhook signature.');
  return JSON.parse(rawBody.toString('utf8'));
};
