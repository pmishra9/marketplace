import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'local-development-only-marketplace-jwt-secret';
};

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signatureFor = (input) => createHmac('sha256', getSecret()).update(input).digest('base64url');

export const createAccessToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    sub: user.id,
    ver: user.tokenVersion,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  });
  const input = `${header}.${payload}`;
  return `${input}.${signatureFor(input)}`;
};

export const readAccessToken = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signature] = parts;
  const input = `${headerPart}.${payloadPart}`;
  const expected = Buffer.from(signatureFor(input));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    if (header.alg !== 'HS256' || typeof payload.sub !== 'string' || !Number.isInteger(payload.ver)) return null;
    if (!Number.isInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
