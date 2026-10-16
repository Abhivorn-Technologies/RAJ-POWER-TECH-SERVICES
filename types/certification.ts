export interface Certification {
  id: string;
  title: string;
  issuingAuthority: string;
  certificateNumber: string;
  description?: string;
  categoryScope?: string; // e.g. "Pure Sine Wave Inverter Standards", "ISO 9001 Quality Assurance"
  vendorId?: string; // Optional: specific to a vendor, or platform-wide (RPS) if undefined
  vendorName?: string;
  validFrom: string;
  validUntil?: string;
  status: 'active' | 'expired' | 'under_audit';
  isPublished: boolean;
  documentUrl?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
