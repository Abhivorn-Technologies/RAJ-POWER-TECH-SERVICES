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
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(`Access denied. Requires one of roles: ${allowedRoles.join(', ')}`, 403);
  }
  return user;
}

/**
 * Require an Admin permission.
 * Super Admin bypasses and automatically possesses all permissions.
 * Admins must have the explicit permission granted.
 */
export async function requireAdminPermission(permission: AdminPermission, request?: Request): Promise<SessionUser> {
  const user = await requireAuth(request);
  
  if (user.role === 'super_admin') {
    return user;
  }

  if (user.role === 'admin' && user.permissions.includes(permission)) {
    return user;
  }

  throw new AuthError(`Access denied. Missing required permission: ${permission}`, 403);
}

/**
 * Require vendor resource ownership:
 * Ensures the session vendor matches the target vendorId.
 * Super Admin or authorized Admin can also access.
 */
export async function requireVendorOwnership(targetVendorId: string, request?: Request): Promise<SessionUser> {
  const user = await requireAuth(request);

  if (user.role === 'super_admin') {
    return user;
  }

  if (user.role === 'admin' && user.permissions.includes('manage_vendors')) {
    return user;
  }

  if (user.role === 'vendor' && user.vendorId === targetVendorId) {
    return user;
  }

  throw new AuthError('Access denied. You do not own this vendor resource.', 403);
}
