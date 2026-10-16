export type PaymentMethodType = 'cod' | 'online_gateway';

export type PaymentTransactionStatus =
  | 'pending'
  | 'captured'
  | 'failed'
  | 'refunded';

export interface PaymentRecord {
  id: string; // pay-xxx
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: 'INR';
  method: PaymentMethodType;
  gatewayProvider: 'razorpay' | 'phonepe' | 'manual_cod' | 'unconfigured';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  status: PaymentTransactionStatus;
  idempotencyKey?: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  capturedAt?: string;
}
