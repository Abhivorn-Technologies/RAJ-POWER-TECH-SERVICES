import { NextRequest, NextResponse, connection } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import {
  listCategorySortConfigs,
  getCategorySortConfig,
  saveCategorySortConfig,
} from '@/lib/db/data-store';

/**
 * GET /api/admin/categories/sorting
 * Query category brand and product sorting configs.
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    await requireAdminPermission('manage_products', request);
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    if (categoryId) {
      const config = await getCategorySortConfig(categoryId);
      return NextResponse.json({ success: true, config });
    }

    const configs = await listCategorySortConfigs();
    return NextResponse.json({ success: true, configs });
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Failed to get category sorting:', error);
    return NextResponse.json({ error: 'Failed to fetch category sorting' }, { status: 500 });
  }
}

/**
 * POST /api/admin/categories/sorting
 * Set brand priority and product ordering for a specific category.
 * Strictly protected for admins only.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireAdminPermission('manage_products', request);
    const body = await request.json();
    const { categoryId, brandOrder, productOrder } = body;

    if (!categoryId || !Array.isArray(brandOrder)) {
      return NextResponse.json(
        { error: 'Valid categoryId and brandOrder array are required.' },
        { status: 400 }
      );
    }

    const saved = await saveCategorySortConfig({
      categoryId,
      brandOrder,
      productOrder: productOrder || {},
      updatedBy: admin.email,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath(`/categories/${categoryId}`);
      revalidatePath('/categories/[slug]', 'page');
    } catch (e) {
      console.warn('Revalidation note:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Category sorting updated for "${categoryId}".`,
      config: saved,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Failed to update category sorting:', error);
    return NextResponse.json({ error: 'Failed to update category sorting' }, { status: 500 });
  }
}

