import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/auth';

const TOKEN_EXPIRY = '7d';

export const AUTH_COOKIE_NAME = 'rps_session_token';

/**
 * Retrieve and strictly validate JWT secret.
 * In production (NODE_ENV === 'production'), missing JWT_SECRET immediately throws a fatal error.
 * In development, a fallback is permitted for local offline developer testing without exposing secrets.
 */
function getValidatedJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL SECURITY CONFIGURATION: JWT_SECRET environment variable is missing in production. Application will not issue or verify tokens without a validated secret.'
      );
    }
    return 'rps_ecommerce_dev_jwt_secret_phase_2_only';
  }

  if (secret.length < 16 && process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL SECURITY CONFIGURATION: JWT_SECRET in production must be at least 16 characters long for cryptographic security.'
    );
  }

  return secret;
}

export const DEFAULT_ADMIN_SESSION_MINUTES = 15;
export const DEFAULT_VENDOR_SESSION_HOURS = 24;

/**
 * Sign a new JWT session token with user identity and authorization claims
 */
export function signAuthToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn: string | number = TOKEN_EXPIRY
): string {
  const secret = getValidatedJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify a JWT session token and return the typed payload
 */
export function verifyAuthToken(token: string): JWTPayload | null {
  try {
    const secret = getValidatedJwtSecret();
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
