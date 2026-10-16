export * from './server-guard';

import { requireRole, AuthError } from './server-guard';
import { findVendorById } from '@/lib/db/data-store';
import { Vendor } from '@/types/vendor';

/**
 * Convenience guard for vendor endpoints:
 * Validates vendor role, retrieves vendor profile, and checks active status.
 */
export async function requireVendorAuth(request?: Request): Promise<{ vendor: Vendor }> {
  const user = await requireRole(['vendor'], request);
  if (!user.vendorId) {
    throw new AuthError('Vendor account not associated with session user', 403);
  }
  const vendor = await findVendorById(user.vendorId);
  if (!vendor || vendor.status === 'suspended') {
    throw new AuthError('Vendor account is inactive or suspended', 403);
  }
  return { vendor };
}
