export interface EligiblePincodeRule {
  pincode: string; // 6-digit Indian Postal Code
  district: string; // District / City area
  state: string; // Serviceable State
  deliveryFeeINR: number;
  active: boolean;
  notes?: string;
}

export interface PlatformSettings {
  id: 'platform_config';
  // Commission and fee configuration (Configurable, not hardcoded)
  defaultVendorCommissionPercent: number; // e.g. 5.0%
  platformProcessingFeePercent?: number; // e.g. 1.5%
  flatDeliveryFeeINR: number; // Configurable standard delivery surcharge
  minimumOrderValueForFreeDeliveryINR: number; // e.g. 50000 INR
  
  // Eligible delivery PIN codes and serviceability rules
  eligiblePincodes: EligiblePincodeRule[];

  // Payment method eligibility & gateway configuration
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  paymentGatewayProvider: 'razorpay' | 'phonepe' | 'unconfigured';
  
  // Settlement & payout schedule policies (Configurable)
  settlementPayoutCycleDays: number; // e.g. 7 or 14 days post-delivery
  settlementHoldPeriodDays: number; // Days after delivery before funds become ready for payout
  
  // Order cancellation and return windows (Configurable)
  customerCancellationWindowMinutes: number; // e.g. 120 mins before dispatch
  returnWindowDays: number; // e.g. 7 days for defective power equipment
  allowItemLevelCancellation: boolean; // True: individual order items can be cancelled

  // Administrative Session & Security Policies
  adminSessionTimeoutMinutes?: number; // Inactivity / maximum session timeout in minutes (default: 15)
  
  // Custom product attribute definitions configured by Admin
  customProductAttributes: {
    name: string;
    key: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    category?: 'inverters' | 'batteries' | 'ups' | 'all';
    required?: boolean;
  }[];
  
  updatedAt: string;
  updatedBy?: string;
}
