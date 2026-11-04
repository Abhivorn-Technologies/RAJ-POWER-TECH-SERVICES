import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import { updateProductRecord, findProductById, listProducts } from '@/lib/db/data-store';

/**
 * POST /api/admin/products/reorder
 * Admin-only endpoint to set or adjust product display priorities (sortOrder).
 * Lower numbers (1, 2, 3...) appear first on the public storefront.
 */
export async function POST(request: Request) {
  try {
    // Strictly require admin permission to manage products
    await requireAdminPermission('manage_products', request);

    const body = await request.json();
    const { productId, sortOrder, updates } = body;

    // Handle batch reordering
    if (Array.isArray(updates) && updates.length > 0) {
      for (const item of updates) {
        if (item.id && typeof item.sortOrder === 'number') {
          await updateProductRecord(item.id, { sortOrder: item.sortOrder });
        }
      }

      try {
        revalidatePath('/', 'layout');
        revalidatePath('/shop');
      } catch (e) {
        console.warn('Revalidation note:', e);
      }

      return NextResponse.json({
        success: true,
        message: `Updated display order for ${updates.length} products.`,
      });
    }

    // Handle single product sortOrder update
    if (!productId || typeof sortOrder !== 'number') {
      return NextResponse.json(
        { error: 'Valid productId and numeric sortOrder are required.' },
        { status: 400 }
      );
    }

    const existing = await findProductById(productId);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const updated = await updateProductRecord(productId, { sortOrder });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
    } catch (e) {
      console.warn('Revalidation note:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Product "${existing.name}" priority set to #${sortOrder}.`,
      product: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Failed to update product display order:', error);
    return NextResponse.json({ error: 'Failed to update product display order.' }, { status: 500 });
  }
}

