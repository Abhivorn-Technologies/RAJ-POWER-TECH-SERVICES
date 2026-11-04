export type ClientSector =
  | 'Healthcare & Hospitals'
  | 'Corporate IT & Data Rooms'
  | 'Commercial & Retail'
  | 'Villas & Residential'
  | 'Industrial & Manufacturing';

export interface ClientProject {
  id: string;
  clientName: string;
  sector: ClientSector;
  location: string;
  systemInstalled: string;
  scopeDescription: string;
  completionYear?: string;
  imageUrl: string;
  rating?: number;
  testimonial?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}

