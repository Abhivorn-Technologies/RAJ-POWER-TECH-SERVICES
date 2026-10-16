import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/server-guard';
import { listVendorOrderItems, updateOrderItemFulfilment } from '@/lib/db/data-store';
import { ItemFulfilmentStatus } from '@/types/order';

/**
 * GET: List order items for the current authenticated vendor.
 * Data isolation: Vendors cannot see items belonging to another vendor!
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    if (user.role === 'vendor') {
      if (!user.vendorId) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 400 });
      }
      const items = await listVendorOrderItems(user.vendorId);
      return NextResponse.json({ success: true, items });
    }

    // Admin / Super Admin can pass vendorId in query params
    const { searchParams } = new URL(request.url);
    const targetVendorId = searchParams.get('vendorId');
    if (!targetVendorId) {
      return NextResponse.json({ error: 'Admin must specify vendorId parameter' }, { status: 400 });
    }

    const items = await listVendorOrderItems(targetVendorId);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve vendor order items' }, { status: 500 });
  }
}

/**
 * PATCH: Update fulfilment status of a vendor's order item.
 * Supports: 'allocated' | 'dispatched' | 'delivered' | 'cancelled'.
 * If cancelled, stock is atomically released back into inventory.
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { orderId, itemId, status, trackingNumber } = body;

    if (!orderId || !itemId || !status) {
      return NextResponse.json(
        { error: 'orderId, itemId, and status are required' },
        { status: 400 }
      );
    }

    const validStatuses: ItemFulfilmentStatus[] = ['pending', 'allocated', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    let vendorIdToMatch: string;

    if (user.role === 'vendor') {
      if (!user.vendorId) {
        return NextResponse.json({ error: 'Active vendor account required' }, { status: 403 });
      }
      vendorIdToMatch = user.vendorId;
    } else if (user.role === 'super_admin' || (user.role === 'admin' && user.permissions.includes('manage_orders'))) {
      if (!body.vendorId) {
        return NextResponse.json({ error: 'Admin must supply vendorId of the target item' }, { status: 400 });
      }
      vendorIdToMatch = body.vendorId;
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updatedItem = await updateOrderItemFulfilment(
      orderId,
      itemId,
      vendorIdToMatch,
      status,
      trackingNumber
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Order item not found or you are not authorized to update this item' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Item fulfilment updated to ${status}`,
      item: updatedItem,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update item fulfilment' }, { status: 500 });
  }
}
