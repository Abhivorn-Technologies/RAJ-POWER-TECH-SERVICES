import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import {
  findProductById,
  atomicDeductStock,
  atomicRestoreStock,
  createOrderRecord,
  findOrderById,
  updateOrderRecord,
  createPaymentRecord,
  listOrders,
  getPlatformSettings,
  findVendorById,
} from '@/lib/db/data-store';
import { dispatchOrderNotifications } from '@/lib/notifications/order-events';
import { Order, OrderItem, CreateOrderInput } from '@/types/order';

/**
 * GET: List all orders (Admin or Super Admin)
 */
export async function GET(request: Request) {
  try {
    await requireAdminPermission('manage_orders', request);
    const orders = await listOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

/**
 * POST: Create multi-vendor customer order.
 * - Concurrency-safe: atomically reserves stock for every item.
 * - Rollback on failure: if any item lacks stock, reverts all previously deducted items.
 * - Freezes historical purchase price on the OrderItem records.
 */
export async function POST(request: Request) {
  const allocatedDeductions: { productId: string; quantity: number }[] = [];

  try {
    const body = (await request.json()) as CreateOrderInput;
    const { customer, items, paymentMethod, notes } = body;

    // Validation
    if (!customer || !customer.fullName || !customer.phone || !customer.line1 || !customer.city || !customer.pincode) {
      return NextResponse.json(
        { error: 'Complete customer shipping address is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one product item' }, { status: 400 });
    }

    const platformSettings = await getPlatformSettings();

    // 2. PIN-Code Serviceability Verification
    const formattedPincode = customer.pincode.trim();
    const matchedPincodeRule = platformSettings.eligiblePincodes?.find(
      (r) => r.pincode === formattedPincode && r.active
    );

    if (!matchedPincodeRule) {
      return NextResponse.json(
        {
          error: `Delivery address with PIN code ${formattedPincode} is not currently serviceable. Please enter an eligible delivery PIN code or contact our support team.`,
        },
        { status: 400 }
      );
    }

    // 3. Payment Method Validation
    const chosenMethod = (paymentMethod || 'cod').toLowerCase();
    if (chosenMethod === 'cod' && platformSettings.codEnabled === false) {
      return NextResponse.json({ error: 'Cash on Delivery is currently disabled by platform policy.' }, { status: 400 });
    }
    if (chosenMethod === 'online_gateway' && platformSettings.onlinePaymentEnabled === false) {
      return NextResponse.json({ error: 'Online payment gateway is currently disabled by platform policy.' }, { status: 400 });
    }

    const orderItems: OrderItem[] = [];
    const involvedVendorIds = new Set<string>();
    let subtotal = 0;

    const now = new Date().toISOString();
    const orderNumber = `RPS-ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const orderId = `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // 4. Concurrency-safe validation and atomic inventory deduction loop
    for (let i = 0; i < items.length; i++) {
      const { productId, quantity } = items[i];

      if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        throw new Error(`Invalid item specification at index ${i}`);
      }

      const product = await findProductById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Check if product belongs to an active vendor
      if (product.vendorId) {
        const vendor = await findVendorById(product.vendorId);
        if (vendor && vendor.status === 'suspended') {
          throw new Error(`Product "${product.name}" is currently unavailable from vendor.`);
        }
      }

      // Atomic inventory deduction
      const deducted = await atomicDeductStock(productId, quantity);
      if (!deducted) {
        throw new Error(`Insufficient stock for product "${product.name}". Available stock could not fulfill ${quantity} units.`);
      }

      // Keep track of deduction for rollback if any subsequent item fails
      allocatedDeductions.push({ productId, quantity });

      const unitPrice = product.price ?? 0;
      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;

      const vendorId = product.vendorId || 'ven-platform';
      const vendorName = product.vendorName || 'Raj Power Tech Services';
      involvedVendorIds.add(vendorId);

      // Snapshot commission rate agreed between Super Admin and Vendor
      const vendorRecord = await findVendorById(vendorId);
      const commissionRate = vendorRecord?.commissionRate !== undefined ? vendorRecord.commissionRate : 0;
      const commissionAmount = (itemTotal * commissionRate) / 100;
      const vendorEarnings = itemTotal - commissionAmount;

      const orderItem: OrderItem = {
        id: `itm-${orderId}-${i + 1}`,
        orderId,
        orderNumber,
        vendorId,
        vendorName,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productCategory: product.category,
        productImage: product.imageUrl,
        quantity,
        unitPrice, // Historical price frozen
        totalPrice: itemTotal,
        fulfilmentStatus: 'pending',
        settlementStatus: 'pending',
        commissionRateApplied: commissionRate,
        commissionAmount,
        vendorEarnings,
        createdAt: now,
        updatedAt: now,
      };

      orderItems.push(orderItem);
    }

    // Server-controlled delivery fee calculation
    let deliveryFee = matchedPincodeRule.deliveryFeeINR ?? platformSettings.flatDeliveryFeeINR;
    if (
      platformSettings.minimumOrderValueForFreeDeliveryINR &&
      subtotal >= platformSettings.minimumOrderValueForFreeDeliveryINR
    ) {
      deliveryFee = 0;
    }

    const totalAmount = subtotal + deliveryFee;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim(),
        line1: customer.line1.trim(),
        line2: customer.line2?.trim(),
        landmark: customer.landmark?.trim(),
        city: customer.city.trim(),
        district: matchedPincodeRule.district || customer.district || customer.city.trim(),
        state: customer.state?.trim() || matchedPincodeRule.state || 'India',
        pincode: formattedPincode,
      },
      paymentStatus: 'pending', // Distinct payment status (Never marked paid solely because browser requests)
      paymentMethod: chosenMethod === 'online_gateway' ? 'Online Payment Gateway (Staged)' : 'Cash on Delivery (COD)',
      orderStatus: 'placed', // Distinct overall order status
      subtotal,
      deliveryFee,
      totalAmount,
      currency: 'INR',
      items: orderItems,
      vendorIds: Array.from(involvedVendorIds),
      notes,
      createdAt: now,
      updatedAt: now,
    };

    const created = await createOrderRecord(newOrder);

    // 5. Create Separate Payment Record for Financial Auditing
    const paymentRecord = {
      id: `pay-${orderId}`,
      orderId,
      orderNumber,
      amount: totalAmount,
      currency: 'INR' as const,
      method: chosenMethod === 'online_gateway' ? ('online_gateway' as const) : ('cod' as const),
      gatewayProvider: chosenMethod === 'online_gateway' ? platformSettings.paymentGatewayProvider : ('manual_cod' as const),
      status: 'pending' as const,
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email?.trim(),
      createdAt: now,
      updatedAt: now,
    };
    await createPaymentRecord(paymentRecord);

    // 6. Dispatch Isolated Multi-Vendor Notification Events
    await dispatchOrderNotifications(created);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully with atomic stock allocation',
      order: created,
      paymentRecord,
    });
  } catch (error) {
    // Rollback any stock deducted prior to failure
    for (const alloc of allocatedDeductions) {
      await atomicRestoreStock(alloc.productId, alloc.quantity);
    }

    const message = error instanceof Error ? error.message : 'Failed to place order';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PATCH: Admin payment status update (e.g. Confirming COD cash collection)
 */
export async function PATCH(request: Request) {
  try {
    await requireAdminPermission('manage_orders', request);
    const body = await request.json();
    const { orderId, paymentStatus, orderStatus } = body;

    if (!orderId || !paymentStatus) {
      return NextResponse.json({ error: 'Order ID and paymentStatus are required' }, { status: 400 });
    }

    const order = await findOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updates: Partial<Order> = {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    if (orderStatus) {
      updates.orderStatus = orderStatus;
    }

    const updated = await updateOrderRecord(orderId, updates);
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update order payment' }, { status: 500 });
  }
}
