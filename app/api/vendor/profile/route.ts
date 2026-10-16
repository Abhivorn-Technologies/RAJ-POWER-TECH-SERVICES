import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/server-guard';
import { findVendorById, listCategories } from '@/lib/db/data-store';

/**
 * GET /api/vendor/profile
 * Returns vendor business details, authorized categories, and platform categories list.
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json({ error: 'Vendor profile not accessible' }, { status: 403 });
    }

    const vendor = await findVendorById(user.vendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor record not found' }, { status: 404 });
    }

    const allCategories = await listCategories();

    return NextResponse.json({
      success: true,
      vendor,
      categories: allCategories,
      allowedCategories: vendor.allowedCategories || [],
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve vendor profile' }, { status: 500 });
  }
}
