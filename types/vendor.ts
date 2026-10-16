export type VendorStatus = 'active' | 'inactive' | 'suspended' | 'blocked';

export interface VendorAddress {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface VendorSettlementConfig {
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  accountHolderName?: string;
  upiId?: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  tradeName?: string;
  registrationNumber?: string; // GSTIN or Business registration
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: VendorAddress;
  status: VendorStatus;
  commissionRate?: number; // Configurable override (e.g. 8 for 8%), otherwise default platform rate applies
  allowedCategories?: string[]; // Specific solutions/categories vendor is authorized to sell
  settlementInfo?: VendorSettlementConfig;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorInput {
  businessName: string;
  tradeName?: string;
  registrationNumber?: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp?: string;
  password?: string; // Initial temporary password set by Super Admin
  address: VendorAddress;
  commissionRate?: number;
  allowedCategories?: string[]; // Authorized product solutions
}
