import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password securely using bcryptjs
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare plain text password against a stored bcrypt hash
 */
export async function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}
