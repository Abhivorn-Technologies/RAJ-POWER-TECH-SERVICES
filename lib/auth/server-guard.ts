import { cookies } from 'next/headers';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';
import { findUserById, findVendorById } from '@/lib/db/data-store';
import { SessionUser, UserRole, AdminPermission } from '@/types/auth';

/**
 * Retrieve and authenticate the current session user on the server.
 * Verifies JWT signature, user status, and vendor status in the database.
 */
export async function getAuthenticatedUser(request?: Request): Promise<SessionUser | null> {
  let token: string | undefined;

  // 1. Check Authorization header if request object provided
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // 2. Check HTTP-only cookie
  if (!token) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
      if (sessionCookie) {
        token = sessionCookie.value;
      }
    } catch {
      // Ignore cookies() error if called outside request lifecycle
    }
  }

  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload || !payload.userId) return null;

  // Verify user still exists and is not suspended or blocked
  const user = await findUserById(payload.userId);
  if (!user || user.status === 'suspended' || user.status === 'blocked') {
    return null;
  }

  // If vendor role, verify vendor business account is not suspended or blocked
  if (user.role === 'vendor' && user.vendorId) {
    const vendor = await findVendorById(user.vendorId);
    if (!vendor || vendor.status === 'suspended' || vendor.status === 'blocked') {
      return null;
    }
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    permissions: user.permissions || [],
    vendorId: user.vendorId,
    requiresPasswordChange: user.requiresPasswordChange,
  };
}

export async function getSessionDetails(request?: Request): Promise<{
  user: SessionUser;
  exp?: number;
  iat?: number;
  expiresAt?: string;
} | null> {
  let token: string | undefined;

  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
      if (sessionCookie) {
        token = sessionCookie.value;
      }
    } catch {
      // Ignore
    }
  }

  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload || !payload.userId) return null;

  const user = await findUserById(payload.userId);
  if (!user || user.status === 'suspended' || user.status === 'blocked') {
    return null;
  }

  if (user.role === 'vendor' && user.vendorId) {
    const vendor = await findVendorById(user.vendorId);
    if (!vendor || vendor.status === 'suspended' || vendor.status === 'blocked') {
      return null;
    }
  }

  const sessionUser: SessionUser = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    permissions: user.permissions || [],
    vendorId: user.vendorId,
    requiresPasswordChange: user.requiresPasswordChange,
  };

  return {
    user: sessionUser,
    exp: payload.exp,
    iat: payload.iat,
    expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined,
  };
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Require valid authenticated user or throw AuthError
 */
export async function requireAuth(request?: Request): Promise<SessionUser> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new AuthError('Authentication required. Please sign in.', 401);
  }
  return user;
}

/**
 * Require specific user role (e.g. 'super_admin', 'admin', 'vendor')
 */
export async function requireRole(allowedRoles: UserRole[], request?: Request): Promise<SessionUser> {
  const user = await requireAuth(request);
  const isReqAdmin = allowedRoles.includes('admin') || allowedRoles.includes('super_admin');
  const isUserAdmin = user.role === 'admin' || user.role === 'super_admin';
  if ((isReqAdmin && isUserAdmin) || allowedRoles.includes(user.role)) {
    return user;
  }
  throw new AuthError(`Access denied. Requires one of roles: ${allowedRoles.join(', ')}`, 403);
}

/**
 * Require an Admin permission.
 * Admin and Super Admin possess all platform management permissions.
 */
export async function requireAdminPermission(permission?: AdminPermission, request?: Request): Promise<SessionUser> {
  const user = await requireAuth(request);
  
  if (user.role === 'admin' || user.role === 'super_admin') {
    return user;
  }

  throw new AuthError('Access denied. Administrator privileges required.', 403);
}

/**
 * Require resource ownership:
 * Admins have access to all store resources.
 */
export async function requireVendorOwnership(targetVendorId: string, request?: Request): Promise<SessionUser> {
  const user = await requireAuth(request);

  if (user.role === 'admin' || user.role === 'super_admin') {
    return user;
  }

  if (user.role === 'vendor' && user.vendorId === targetVendorId) {
    return user;
  }

  throw new AuthError('Access denied. Administrator privileges required.', 403);
}
