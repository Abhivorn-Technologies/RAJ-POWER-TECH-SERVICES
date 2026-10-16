export type QuotationStatus =
  | 'submitted'
  | 'under_review'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'closed';

export interface QuotationStatusHistoryItem {
  status: QuotationStatus;
  timestamp: string;
  note?: string;
  updatedBy: string; // User ID or 'system' / 'customer'
  updatedByName?: string;
}

export interface QuotationRequest {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  cityOrDistrict: string; // Customer City / District
  fullAddress?: string;
  category: 'inverters' | 'batteries' | 'ups' | 'combo' | 'custom';
  productId?: string;
  productName?: string;
  targetedVendorId?: string; // If requested for a specific vendor's product
  assignedVendorIds: string[]; // Vendors authorized to review/fulfill this quote
  estimatedRunningWatts?: number;
  expectedBackupHours?: number;
  notes?: string;
  status: QuotationStatus;
  quotedAmount?: number;
  quotedDetails?: string;
  validUntil?: string;
  statusHistory: QuotationStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}
