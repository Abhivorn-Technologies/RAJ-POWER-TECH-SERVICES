import test from 'node:test';
import assert from 'node:assert/strict';
import { signAuthToken, verifyAuthToken, AUTH_COOKIE_NAME } from '../lib/auth/jwt';
import { hashPassword, comparePassword } from '../lib/auth/password';
import { JWTPayload, UserRole, AdminPermission } from '../types/auth';

test('AUTH: JWT signing and verification with valid payload', () => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: 'usr-super-admin-01',
    email: 'admin@rajpowertech.com',
    role: 'super_admin' as UserRole,
    status: 'active',
    permissions: ['manage_products', 'manage_orders', 'manage_vendors', 'manage_settings'] as AdminPermission[],
  };

  const token = signAuthToken(payload, '1h');
  assert.ok(typeof token === 'string' && token.length > 20, 'Token should be a non-empty string');

  const decoded = verifyAuthToken(token);
  assert.ok(decoded !== null, 'Decoded token should not be null');
  assert.strictEqual(decoded.userId, payload.userId);
  assert.strictEqual(decoded.email, payload.email);
  assert.strictEqual(decoded.role, payload.role);
  assert.strictEqual(decoded.status, 'active');
  assert.deepStrictEqual(decoded.permissions, payload.permissions);
  assert.ok(typeof decoded.exp === 'number', 'Token should have an expiration timestamp');
  assert.ok(typeof decoded.iat === 'number', 'Token should have an issued-at timestamp');
});

test('AUTH: JWT rejection on tampered token signature', () => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: 'usr-vendor-01',
    email: 'vendor@powertech.com',
    role: 'vendor' as UserRole,
    status: 'active',
  };

  const validToken = signAuthToken(payload, '1h');
  // Tamper with the payload part of the token
  const parts = validToken.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, role: 'super_admin' })).toString('base64url');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  const decoded = verifyAuthToken(tamperedToken);
  assert.strictEqual(decoded, null, 'Tampered token must fail verification and return null');
});

test('AUTH: JWT rejection on malformed tokens', () => {
  assert.strictEqual(verifyAuthToken(''), null);
  assert.strictEqual(verifyAuthToken('invalid.token'), null);
  assert.strictEqual(verifyAuthToken('random-gibberish-string'), null);
});

test('AUTH: JWT cookie constant', () => {
  assert.strictEqual(AUTH_COOKIE_NAME, 'rps_session_token');
});

test('AUTH: Password hashing and comparison', async () => {
  const plainPassword = 'SuperSecret@2026';
  const hashed = await hashPassword(plainPassword);

  assert.ok(hashed.startsWith('$2'), 'Bcrypt hash should start with $2');
  assert.notStrictEqual(hashed, plainPassword, 'Hash should not match plain text');

  const isMatch = await comparePassword(plainPassword, hashed);
  assert.strictEqual(isMatch, true, 'Valid password must match hash');

  const isWrongMatch = await comparePassword('WrongPassword123', hashed);
  assert.strictEqual(isWrongMatch, false, 'Invalid password must not match hash');
});

test('AUTH: Password hashing rejects short passwords', async () => {
  await assert.rejects(
    async () => {
      await hashPassword('12345');
    },
    /at least 6 characters/,
    'Password with less than 6 chars should throw'
  );

  await assert.rejects(
    async () => {
      await hashPassword('');
    },
    /at least 6 characters/,
    'Empty password should throw'
  );
});

test('AUTH: comparePassword gracefully handles empty inputs', async () => {
  const isMatch1 = await comparePassword('', '$2b$10$abcdef');
  assert.strictEqual(isMatch1, false);

  const isMatch2 = await comparePassword('mypassword', '');
  assert.strictEqual(isMatch2, false);
});
