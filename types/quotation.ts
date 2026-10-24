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
  companyName?: string; // Client Firm / Business Name
  gstin?: string; // Client GSTIN for commercial tax invoice
  cityOrDistrict: string; // Customer City / District
  fullAddress?: string;
  category: 'inverters' | 'batteries' | 'ups' | 'combo' | 'custom';
  productId?: string;
  productName?: string;
  quantity?: number; // Commercial / Bulk units required
  targetedVendorId?: string; // If requested for a specific vendor's product
  assignedVendorIds: string[]; // Vendors authorized to review/fulfill this quote
  estimatedRunningWatts?: number;
  expectedBackupHours?: number;
  notes?: string;
  status: QuotationStatus;

  // Product Quotation Pricing Breakdown
  unitPrice?: number; // Quoted Unit Price (INR)
  subtotal?: number; // Base Taxable Value
  gstPercent?: number; // e.g. 18% or 28%
  gstAmount?: number; // Calculated GST
  deliveryCharges?: number; // Freight / Dispatch
  installationCharges?: number; // Site Commissioning & Wiring
  quotedAmount?: number; // Total Quoted Value (INR)
  quotedDetails?: string; // Proposal / Equipment Scope
  paymentTerms?: string; // e.g. "50% Advance with PO, balance against delivery"
  warrantyTerms?: string; // e.g. "36 Months on-site manufacturer warranty"
  deliveryLeadTime?: string; // e.g. "2 to 3 Business Days"
  validUntil?: string; // Quote Expiry Date
  validityDays?: number; // e.g. 15 or 30 days
  statusHistory: QuotationStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}
