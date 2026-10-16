export type OrderPaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type OverallOrderStatus =
  | 'placed'
  | 'processing'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'cancelled';

export type ItemFulfilmentStatus =
  | 'pending'
  | 'allocated'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type ItemSettlementStatus =
  | 'pending'
  | 'ready_for_payout'
  | 'settled'
  | 'withheld';

export interface CustomerShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  productSku?: string;
  productCategory: string;
  productImage?: string;
  quantity: number;
  unitPrice: number; // Frozen historical purchase price
  totalPrice: number; // quantity * unitPrice
  fulfilmentStatus: ItemFulfilmentStatus;
  settlementStatus: ItemSettlementStatus;
  commissionRateApplied?: number; // Snapshot of platform/vendor commission %
  commissionAmount?: number;
  vendorEarnings?: number; // totalPrice - commissionAmount
  trackingNumber?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerShippingAddress;
  paymentStatus: OrderPaymentStatus;
  paymentMethod?: string;
  orderStatus: OverallOrderStatus;
  subtotal: number;
  deliveryFee?: number;
  taxAmount?: number;
  totalAmount: number;
  currency: 'INR';
  items: OrderItem[];
  vendorIds: string[]; // Distinct list of vendors involved in this order
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customer: CustomerShippingAddress;
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod?: string;
  notes?: string;
}
