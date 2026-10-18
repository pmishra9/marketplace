import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `$scrypt$${salt}$${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password, storedPassword) => {
  if (!storedPassword.startsWith('$scrypt$')) {
    // Upgrade existing demo accounts that stored plaintext passwords.
    return { valid: password === storedPassword, needsUpgrade: password === storedPassword };
  }

  const [, algorithm, salt, storedKey] = storedPassword.split('$');
  if (algorithm !== 'scrypt' || !salt || !storedKey) return { valid: false, needsUpgrade: false };

  const expected = Buffer.from(storedKey, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return {
    valid: actual.length === expected.length && timingSafeEqual(actual, expected),
    needsUpgrade: false
  };
};
