export type NotificationRecipientType = 'admin' | 'vendor' | 'customer';

export type NotificationEventType =
  | 'order_placed'
  | 'order_dispatched'
  | 'order_delivered'
  | 'quotation_requested';

export interface OrderNotificationEvent {
  id: string; // notif-xxx
  orderId: string;
  orderNumber: string;
  recipientType: NotificationRecipientType;
  recipientId: string; // admin user ID, vendorId (e.g. ven-rps-primary), or customer phone
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  // Isolated multi-vendor payload:
  // For vendors, this payload contains ONLY their own items and zero data from other vendors!
  payload: {
    orderNumber: string;
    itemCount: number;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      vendorEarnings?: number;
    }[];
    totalVendorAmount?: number;
    deliveryCity: string;
    deliveryDistrict: string;
    deliveryPincode: string;
    customerName: string;
  };
  channel: 'in_app' | 'whatsapp_staged' | 'email_staged';
  status: 'staged' | 'delivered';
  createdAt: string;
}
