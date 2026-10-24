export type ProductCategory = 'inverters' | 'batteries' | 'ups' | (string & {});

export interface SolutionCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  features?: string[];
  createdAt?: string;
}

export type ProductAvailability = 'In Stock' | 'Available on Order' | 'Quotation Required';

export interface ProductSpecification {
  label: string;
  value: string;
}

/**
 * Category-specific technical specifications
 */
export interface InverterTechnicalSpecs {
  vaRating: number; // e.g. 1100
  wattageCapacity: number; // e.g. 900
  nominalBatteryVoltage: '12V' | '24V' | '48V' | '96V';
  waveform: 'Pure Sine Wave' | 'Square Wave' | 'Modified Sine Wave';
  maxChargingCurrentAmp?: number;
  solarCompatible?: boolean;
  displayType?: 'LCD Digital' | 'LED Status Icons';
}

export interface BatteryTechnicalSpecs {
  capacityAh: number; // e.g. 150
  nominalVoltage: '12V' | '2V' | '24V';
  plateTechnology: 'Tall Tubular' | 'Short Tubular' | 'Flat Plate' | 'SMF / VRLA';
  warrantyMonths: number; // e.g. 36, 48, 60
  waterLevelIndicators?: number; // e.g. 6 floats
  cycleLifeEstimated?: string;
  weightKg?: number;
}

export interface UpsTechnicalSpecs {
  topology: 'Online Double Conversion' | 'Line-Interactive' | 'Offline / Standby';
  capacityVa: number; // e.g. 1000
  capacityWatts: number; // e.g. 800
  transferTimeMs: number | string; // e.g. 0 (0ms) or "< 4ms"
  powerFactor: number; // e.g. 0.8, 0.9, 1.0 Unity
  batteryConfiguration?: string; // e.g. "Internal 2x 12V 9Ah" or "External Battery Bank"
  surgeProtectionJoules?: number;
}

export type CategorySpecificSpecs =
  | { category: 'inverters'; specs: InverterTechnicalSpecs }
  | { category: 'batteries'; specs: BatteryTechnicalSpecs }
  | { category: 'ups'; specs: UpsTechnicalSpecs };

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  categoryName: string;
  
  // Multi-vendor ownership
  vendorId?: string;
  vendorName?: string;
  
  // Pricing and inventory
  price?: number;
  comparePrice?: number;
  priceNote?: string;
  stock?: number;
  sku?: string;
  availability: ProductAvailability;
  
  // Content & images
  shortDescription: string;
  fullDescription?: string;
  imageUrl: string;
  additionalImages?: string[];
  
  // Specifications
  keySpecs: ProductSpecification[];
  technicalSpecs?: CategorySpecificSpecs;
  customAttributes?: Record<string, string | number | boolean>;
  
  // Status flags
  isPublished?: boolean;
  isFeatured?: boolean;
  warrantyPeriod?: string;
  capacity?: string;
  isDemo?: boolean;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface CategorySummary {
  id: ProductCategory;
  name: string;
  slug: string;
  description: string;
  features: readonly string[];
  href: string;
  imageUrl?: string;
}

export interface CreateProductInput {
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  shortDescription: string;
  fullDescription?: string;
  imageUrl: string;
  additionalImages?: string[];
  keySpecs?: ProductSpecification[];
  technicalSpecs?: CategorySpecificSpecs;
  customAttributes?: Record<string, string | number | boolean>;
}
