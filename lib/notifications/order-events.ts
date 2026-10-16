import { Order } from '@/types/order';
import { OrderNotificationEvent } from '@/types/notification';
import { saveOrderNotification } from '@/lib/db/data-store';

/**
 * Dispatches multi-vendor order notifications with strict vendor isolation.
 * - Admin receives overall order summary with all involved vendors.
 * - Each vendor receives ONLY their own items and delivery city/district/pincode.
 * - Customer receives confirmation for their complete power backup equipment order.
 */
export async function dispatchOrderNotifications(order: Order): Promise<{
  adminEvent: OrderNotificationEvent;
  vendorEvents: OrderNotificationEvent[];
  customerEvent: OrderNotificationEvent;
}> {
  const now = new Date().toISOString();

  // 1. Admin Event: Global platform overview
  const adminEvent: OrderNotificationEvent = {
    id: `notif-adm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    recipientType: 'admin',
    recipientId: 'admin-platform',
    recipientName: 'RPS Operations Desk',
    eventType: 'order_placed',
    title: `New Order Placed: ${order.orderNumber} (₹${order.totalAmount.toLocaleString('en-IN')})`,
    message: `Order ${order.orderNumber} placed by ${order.customer.fullName} (${order.customer.phone}) in ${order.customer.city}, ${order.customer.state || 'India'}. Total items: ${order.items.length}. Payment: ${order.paymentMethod || 'COD'} (${order.paymentStatus}).`,
    payload: {
      orderNumber: order.orderNumber,
      itemCount: order.items.length,
      items: order.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        vendorEarnings: it.vendorEarnings,
      })),
      totalVendorAmount: order.subtotal,
      deliveryCity: order.customer.city,
      deliveryDistrict: order.customer.district,
      deliveryPincode: order.customer.pincode,
      customerName: order.customer.fullName,
    },
    channel: 'in_app',
    status: 'delivered',
    createdAt: now,
  };
  await saveOrderNotification(adminEvent);

  // 2. Vendor Events: Strictly isolated by vendorId
  const vendorEvents: OrderNotificationEvent[] = [];
  const itemsByVendor = new Map<string, typeof order.items>();

  for (const item of order.items) {
    const list = itemsByVendor.get(item.vendorId) || [];
    list.push(item);
    itemsByVendor.set(item.vendorId, list);
  }

  for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
    const vendorName = vendorItems[0]?.vendorName || 'Authorized Vendor';
    const totalVendorEarnings = vendorItems.reduce((acc, it) => acc + (it.vendorEarnings ?? it.totalPrice), 0);

    const vendorEvent: OrderNotificationEvent = {
      id: `notif-ven-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipientType: 'vendor',
      recipientId: vendorId,
      recipientName: vendorName,
      eventType: 'order_placed',
      title: `Fulfilment Required: ${order.orderNumber} (${vendorItems.length} items)`,
      message: `You have ${vendorItems.length} items to fulfill for order ${order.orderNumber} delivering to ${order.customer.city}, ${order.customer.district} (PIN: ${order.customer.pincode}). Net Earnings: ₹${totalVendorEarnings.toLocaleString('en-IN')}.`,
      payload: {
        orderNumber: order.orderNumber,
        itemCount: vendorItems.length,
        // Crucial security isolation: Only includes this vendor's items!
        items: vendorItems.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          vendorEarnings: it.vendorEarnings,
        })),
        totalVendorAmount: totalVendorEarnings,
        deliveryCity: order.customer.city,
        deliveryDistrict: order.customer.district,
        deliveryPincode: order.customer.pincode,
        customerName: order.customer.fullName,
      },
      channel: 'in_app',
      status: 'delivered',
      createdAt: now,
    };

    await saveOrderNotification(vendorEvent);
    vendorEvents.push(vendorEvent);
  }

  // 3. Customer Event: Confirmation
  const customerEvent: OrderNotificationEvent = {
    id: `notif-cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    recipientType: 'customer',
    recipientId: order.customer.phone,
    recipientName: order.customer.fullName,
    recipientPhone: order.customer.phone,
    recipientEmail: order.customer.email,
    eventType: 'order_placed',
    title: `Order Received: ${order.orderNumber}`,
    message: `Thank you for choosing RAJ POWER TECH SERVICES! Your power backup order ${order.orderNumber} has been received and scheduled for dispatch to ${order.customer.city}, ${order.customer.state || 'India'}.`,
    payload: {
      orderNumber: order.orderNumber,
      itemCount: order.items.length,
      items: order.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      totalVendorAmount: order.totalAmount,
      deliveryCity: order.customer.city,
      deliveryDistrict: order.customer.district,
      deliveryPincode: order.customer.pincode,
      customerName: order.customer.fullName,
    },
    channel: 'whatsapp_staged',
    status: 'staged', // Staged safely: real WhatsApp transmission requires approved WhatsApp API credentials
    createdAt: now,
  };
  await saveOrderNotification(customerEvent);

  return { adminEvent, vendorEvents, customerEvent };
}
