import { getDatabase, isMongoConfigured, registerDatabaseInitHook } from '@/lib/mongodb';
import { User, UserWithCredentials } from '@/types/auth';
import { Vendor } from '@/types/vendor';
import { Product, SolutionCategoryItem } from '@/types/product';
import { Order, OrderItem, ItemFulfilmentStatus } from '@/types/order';
import { QuotationRequest, QuotationStatus } from '@/types/quotation';
import { Certification } from '@/types/certification';
import { PlatformSettings, EligiblePincodeRule } from '@/types/settings';
import { PaymentRecord } from '@/types/payment';
import { OrderNotificationEvent } from '@/types/notification';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';

// ==========================================
// In-Memory Dev Store (Restricted strictly to local development)
// ==========================================

interface DevStore {
  users: Map<string, UserWithCredentials>;
  vendors: Map<string, Vendor>;
  categories: Map<string, SolutionCategoryItem>;
  products: Map<string, Product>;
  orders: Map<string, Order>;
  quotations: Map<string, QuotationRequest>;
  certifications: Map<string, Certification>;
  payments: Map<string, PaymentRecord>;
  notifications: Map<string, OrderNotificationEvent>;
  settings: PlatformSettings;
  initialized: boolean;
}

declare global {
  var _rpsDevStore: DevStore | undefined;
}

export const DEFAULT_ELIGIBLE_PINCODES: EligiblePincodeRule[] = [
  { pincode: '500009', district: 'Secunderabad', state: 'India', deliveryFeeINR: 0, active: true, notes: 'RPS Headquarters (Secunderabad - Picket / Vijaya Nagar Colony)' },
  { pincode: '500003', district: 'Secunderabad', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Secunderabad City Center' },
  { pincode: '500016', district: 'Hyderabad', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Begumpet / Prakash Nagar' },
  { pincode: '500028', district: 'Hyderabad', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Mehdipatnam / Asif Nagar' },
  { pincode: '500034', district: 'Hyderabad', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Banjara Hills / Jubilee Hills' },
  { pincode: '500072', district: 'Medchal-Malkajgiri', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Kukatpally / KPHB Colony' },
  { pincode: '500081', district: 'Rangareddy', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Madhapur / Hitec City / Cyberabad' },
  { pincode: '500084', district: 'Rangareddy', state: 'India', deliveryFeeINR: 0, active: true, notes: 'Kondapur / Gachibowli Corridor' },
];

const defaultDevSettings: PlatformSettings = {
  id: 'platform_config',
  defaultVendorCommissionPercent: 5.0,
  platformProcessingFeePercent: 1.5,
  flatDeliveryFeeINR: 0,
  minimumOrderValueForFreeDeliveryINR: 0,
  eligiblePincodes: DEFAULT_ELIGIBLE_PINCODES,
  codEnabled: true,
  onlinePaymentEnabled: true,
  paymentGatewayProvider: 'unconfigured',
  settlementPayoutCycleDays: 7,
  settlementHoldPeriodDays: 5,
  customerCancellationWindowMinutes: 120,
  returnWindowDays: 7,
  allowItemLevelCancellation: true,
  adminSessionTimeoutMinutes: 15,
  customProductAttributes: [
    { name: 'Pure Sine Wave Guarantee', key: 'sine_wave_guarantee', type: 'boolean', category: 'inverters' },
    { name: 'Tubular Plate Height (mm)', key: 'plate_height_mm', type: 'number', category: 'batteries' },
    { name: 'Cold Start Capable', key: 'cold_start', type: 'boolean', category: 'ups' },
  ],
  updatedAt: new Date().toISOString(),
};

const devStore: DevStore = globalThis._rpsDevStore ?? {
  users: new Map(),
  vendors: new Map(),
  categories: new Map(),
  products: new Map(),
  orders: new Map(),
  quotations: new Map(),
  certifications: new Map(),
  payments: new Map(),
  notifications: new Map(),
  settings: defaultDevSettings,
  initialized: false,
};

if (!globalThis._rpsDevStore) {
  globalThis._rpsDevStore = devStore;
}

if (!devStore.categories) {
  devStore.categories = new Map();
}

function ensureCategoriesSeeded() {
  if (!devStore.categories) {
    devStore.categories = new Map();
  }
  if (devStore.categories.size === 0) {
    devStore.categories.set('inverters', {
      id: 'inverters',
      name: 'Inverters',
      slug: 'inverters',
      description: 'Pure sine wave home & commercial inverters engineered for dependable continuous power during outages.',
      features: ['Pure Sine Wave Output', 'Smart Battery Management', 'Overload & Short Circuit Protection'],
      createdAt: new Date().toISOString(),
    });
    devStore.categories.set('batteries', {
      id: 'batteries',
      name: 'Batteries',
      slug: 'batteries',
      description: 'High-cycle tubular & SMF inverter batteries built for severe climate conditions and deep discharge longevity.',
      features: ['Tall Tubular Heavy Duty Plates', 'Ultra Low Maintenance', 'Fast Recharge Technology'],
      createdAt: new Date().toISOString(),
    });
    devStore.categories.set('ups', {
      id: 'ups',
      name: 'UPS Systems',
      slug: 'ups',
      description: 'Zero-transfer line-interactive & online UPS systems safeguarding critical computers, servers, and medical equipment.',
      features: ['Zero Transfer Switching Time', 'Voltage Spike Suppression', 'Generator Compatibility'],
      createdAt: new Date().toISOString(),
    });
  }
}
ensureCategoriesSeeded();

const devUsers = devStore.users;
const devVendors = devStore.vendors;
const devCategories = devStore.categories;
const devProducts = devStore.products;
const devOrders = devStore.orders;
const devQuotations = devStore.quotations;
const devCertifications = devStore.certifications;
const devPayments = devStore.payments;
const devNotifications = devStore.notifications;

export const DUMMY_CERT_IDS = [
  'cert-rps-iso-9001',
  'cert-rps-bis-16221',
  'cert-rps-bis-isi-01',
  'cert-rps-tspcb-lead',
];

import { AUTHENTIC_CERTIFICATIONS } from '@/lib/certifications-data';
export { AUTHENTIC_CERTIFICATIONS };

export function ensureAuthenticCertificationsSeeded() {
  for (const id of DUMMY_CERT_IDS) {
    devCertifications.delete(id);
  }
  for (const cert of AUTHENTIC_CERTIFICATIONS) {
    if (!devCertifications.has(cert.id)) {
      devCertifications.set(cert.id, cert);
    }
  }
}

/**
 * Ensures that if production environment is detected, operations will NOT
 * silently proceed without a configured MongoDB instance.
 */
function assertStorageMode(operationName: string) {
  if (!isMongoConfigured() && process.env.NODE_ENV === 'production') {
    throw new Error(
      `FATAL PERSISTENCE ERROR: MongoDB connection is missing in production. Operation '${operationName}' cannot execute without persistent database storage.`
    );
  }
}

// Seed initial Super Admin and sample vendor into dev store for local testing
function initDevStore() {
  if (devStore.initialized || devUsers.size > 0) return;
    // Admin: admin@rajpowertech.com | Password: Admin@2026
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'admin@rajpowertech.com';
    const adminHash = process.env.ADMIN_PASSWORD_HASH || process.env.SUPER_ADMIN_PASSWORD_HASH || '$2b$10$omtX0t/eYXvJVWgoVX3YWO8ytMxtTlqavymlc0mThdVz1wyx3Q.em';
    
    const superAdmin: UserWithCredentials = {
      id: 'usr-super-admin-01',
      email: adminEmail,
      name: 'Admin (RPS Executive)',
      role: 'admin',
      status: 'active',
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    devUsers.set(superAdmin.id, superAdmin);

    // Initial Vendor: vendor@powertech.com | Password: Vendor@2026
    const vendorEmail = process.env.VENDOR_EMAIL || 'vendor@powertech.com';
    const vendorHash = process.env.VENDOR_PASSWORD_HASH || '$2b$10$wExdYZhK9.bSlpOJmvPshODSXc0kkEQYzLo6Cu5uFcCKltCuiPZ4a';
    const sampleVendor: Vendor = {
      id: 'ven-rps-primary',
      businessName: 'RAJ POWER TECH ENTERPRISES',
      tradeName: 'RPS Power Systems',
      registrationNumber: '36ABCDE1234F1Z5',
      contactPerson: 'Mr. B. V. Raja Shekar Reddy',
      email: vendorEmail,
      phone: '9346021289',
      whatsapp: '919346021289',
      address: {
        line1: 'Plot No:12A, Vijaya Nagar Colony',
        city: 'Secunderabad',
        district: 'Hyderabad',
        state: 'India',
        pincode: '500009',
      },
      status: 'active',
      commissionRate: 5.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    devVendors.set(sampleVendor.id, sampleVendor);

    const vendorUser: UserWithCredentials = {
      id: 'usr-vendor-01',
      email: 'vendor@powertech.com',
      name: 'Mr. B. V. Raja Shekar Reddy (RPS)',
      role: 'vendor',
      status: 'active',
      vendorId: sampleVendor.id,
      passwordHash: vendorHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    devUsers.set(vendorUser.id, vendorUser);

    // Seed initial products for the vendor from verified 4-brand catalog with stock
    DEMO_FEATURED_PRODUCTS.forEach((item, index) => {
      const prod: Product = {
        ...item,
        vendorId: sampleVendor.id,
        vendorName: sampleVendor.businessName,
        stock: item.stock || (15 + index * 5),
        price: item.price || (item.category === 'inverters' ? 8500 : item.category === 'batteries' ? 12500 : 9500),
        comparePrice: item.comparePrice || item.price,
        sku: item.sku || `RPS-${item.category.substring(0, 3).toUpperCase()}-00${index + 1}`,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      devProducts.set(prod.id, prod);
    });

  // Seed authentic verified RPS certifications for public gallery
  ensureAuthenticCertificationsSeeded();

  // Seed default solution categories
  if (devCategories.size === 0) {
    devCategories.set('inverters', {
      id: 'inverters',
      name: 'Inverters',
      slug: 'inverters',
      description: 'Pure sine wave home & commercial inverters engineered for dependable continuous power during outages.',
      features: ['Pure Sine Wave Output', 'Smart Battery Management', 'Overload & Short Circuit Protection'],
      createdAt: new Date().toISOString(),
    });
    devCategories.set('batteries', {
      id: 'batteries',
      name: 'Batteries',
      slug: 'batteries',
      description: 'High-cycle tubular & SMF inverter batteries built for severe climate conditions and deep discharge longevity.',
      features: ['Tall Tubular Heavy Duty Plates', 'Ultra Low Maintenance', 'Fast Recharge Technology'],
      createdAt: new Date().toISOString(),
    });
    devCategories.set('ups', {
      id: 'ups',
      name: 'UPS Systems',
      slug: 'ups',
      description: 'Zero-transfer line-interactive & online UPS systems safeguarding critical computers, servers, and medical equipment.',
      features: ['Zero Transfer Switching Time', 'Voltage Spike Suppression', 'Generator Compatibility'],
      createdAt: new Date().toISOString(),
    });
  }

  // Seed sample Business Product Quotations (Commercial RFQs)
  if (devQuotations.size === 0) {
    const quote1: QuotationRequest = {
      id: 'qt-b2b-01',
      quotationNumber: 'RPS-QT-2026-0104',
      companyName: 'Sri Balaji Diagnostics & Healthcare Center',
      gstin: '36AABCS1429B1Z8',
      customerName: 'Dr. M. S. Rao (Director)',
      customerPhone: '9849012345',
      customerEmail: 'purchase@balajidiagnostics.in',
      cityOrDistrict: 'Secunderabad',
      fullAddress: 'Building 4, Ranigunj Commercial Complex, Secunderabad - 500003',
      category: 'batteries',
      productId: 'prod-tubular-150',
      productName: 'Exide Inva Tubular 150Ah Heavy Duty Battery (IT500)',
      quantity: 4,
      assignedVendorIds: ['ven-rps-primary'],
      status: 'quoted',
      unitPrice: 14500,
      subtotal: 58000,
      gstPercent: 28,
      gstAmount: 16240,
      deliveryCharges: 800,
      installationCharges: 1200,
      quotedAmount: 76240,
      quotedDetails: 'Includes 4x 150Ah Tubular Batteries, heavy interconnect copper cables, site delivery, battery rack installation, and 36-month on-site replacement warranty.',
      paymentTerms: '50% Advance with Purchase Order, 50% on site installation',
      warrantyTerms: '36 Months On-site Comprehensive Manufacturer Warranty',
      deliveryLeadTime: '2 Business Days',
      validityDays: 15,
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
      statusHistory: [
        {
          status: 'submitted',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          note: 'Commercial quotation request submitted for diagnostic lab power backup.',
          updatedBy: 'customer',
          updatedByName: 'Dr. M. S. Rao',
        },
        {
          status: 'quoted',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          note: 'Official business quotation of ₹76,240 submitted with GST 28% and installation scope.',
          updatedBy: 'ven-rps-primary',
          updatedByName: 'RAJ POWER TECH ENTERPRISES',
        },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    };

    const quote2: QuotationRequest = {
      id: 'qt-b2b-02',
      quotationNumber: 'RPS-QT-2026-0105',
      companyName: 'TechNova IT Solutions Pvt Ltd',
      gstin: '36AAECT5512Q1ZX',
      customerName: 'P. Ramesh Kumar (Facility Head)',
      customerPhone: '9988776655',
      customerEmail: 'facilities@technovasolutions.com',
      cityOrDistrict: 'HITEC City, Hyderabad',
      fullAddress: 'Tower B, Mindspace IT Park, HITEC City, Hyderabad - 500081',
      category: 'inverters',
      productId: 'prod-inverter-2kva',
      productName: 'Luminous Cruze 2KVA Pure Sine Wave Commercial Inverter',
      quantity: 2,
      assignedVendorIds: ['ven-rps-primary'],
      status: 'submitted',
      notes: 'Required for server room backup and workstation critical lighting. Need official quotation with GST input tax invoice and delivery schedule.',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: new Date().toISOString(),
          note: 'Commercial product quotation inquiry received for 2 units of 2KVA commercial inverters.',
          updatedBy: 'customer',
          updatedByName: 'P. Ramesh Kumar',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    devQuotations.set(quote1.id, quote1);
    devQuotations.set(quote2.id, quote2);
  }
}

initDevStore();

// Register MongoDB Idempotent Initializer & Seeder
registerDatabaseInitHook(async (db) => {
  // 1. Seed Super Admin & Primary Vendor if users collection is empty
  const userCount = await db.collection('users').countDocuments();
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'admin@rajpowertech.com';
    const adminHash = process.env.ADMIN_PASSWORD_HASH || process.env.SUPER_ADMIN_PASSWORD_HASH || '$2b$10$omtX0t/eYXvJVWgoVX3YWO8ytMxtTlqavymlc0mThdVz1wyx3Q.em';
    const superAdmin: UserWithCredentials = {
      id: 'usr-super-admin-01',
      email: adminEmail,
      name: 'Super Admin (RPS Executive)',
      role: 'super_admin',
      status: 'active',
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('users').insertOne(superAdmin);

    const vendorEmail = process.env.VENDOR_EMAIL || 'vendor@powertech.com';
    const vendorHash = process.env.VENDOR_PASSWORD_HASH || '$2b$10$wExdYZhK9.bSlpOJmvPshODSXc0kkEQYzLo6Cu5uFcCKltCuiPZ4a';
    const sampleVendor: Vendor = {
      id: 'ven-rps-primary',
      businessName: 'RAJ POWER TECH ENTERPRISES',
      tradeName: 'RPS Power Systems',
      registrationNumber: '36ABCDE1234F1Z5',
      contactPerson: 'Mr. B. V. Raja Shekar Reddy',
      email: vendorEmail,
      phone: '9346021289',
      whatsapp: '919346021289',
      address: {
        line1: 'Plot No:12A, Vijaya Nagar Colony',
        city: 'Secunderabad',
        district: 'Hyderabad',
        state: 'India',
        pincode: '500009',
      },
      status: 'active',
      commissionRate: 5.0,
      allowedCategories: ['inverters', 'batteries', 'ups'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('vendors').insertOne(sampleVendor);

    const vendorUser: UserWithCredentials = {
      id: 'usr-vendor-01',
      email: vendorEmail,
      name: 'Mr. B. V. Raja Shekar Reddy (RPS)',
      role: 'vendor',
      status: 'active',
      vendorId: sampleVendor.id,
      passwordHash: vendorHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('users').insertOne(vendorUser);
  }

  // 2. Seed Solution Categories if empty
  const catCount = await db.collection('categories').countDocuments();
  if (catCount === 0) {
    await db.collection('categories').insertMany([
      {
        id: 'inverters',
        name: 'Inverters',
        slug: 'inverters',
        description: 'Pure sine wave home & commercial inverters engineered for dependable continuous power during outages.',
        features: ['Pure Sine Wave Output', 'Smart Battery Management', 'Overload & Short Circuit Protection'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'batteries',
        name: 'Batteries',
        slug: 'batteries',
        description: 'High-cycle tubular & SMF inverter batteries built for severe climate conditions and deep discharge longevity.',
        features: ['Tall Tubular Heavy Duty Plates', 'Ultra Low Maintenance', 'Fast Recharge Technology'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ups',
        name: 'UPS Systems',
        slug: 'ups',
        description: 'Zero-transfer line-interactive & online UPS systems safeguarding critical computers, servers, and medical equipment.',
        features: ['Zero Transfer Switching Time', 'Voltage Spike Suppression', 'Generator Compatibility'],
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // 3. Seed Platform Settings if missing
  const settingsDoc = await db.collection('settings').findOne({ id: 'platform_config' });
  if (!settingsDoc) {
    await db.collection('settings').insertOne(defaultDevSettings);
  }

  // 4. Seed Initial Products if empty
  const prodCount = await db.collection('products').countDocuments();
  if (prodCount === 0) {
    const initialProducts: Product[] = DEMO_FEATURED_PRODUCTS.map((demoItem, index) => ({
      ...demoItem,
      vendorId: 'ven-rps-primary',
      vendorName: 'RAJ POWER TECH ENTERPRISES',
      stock: 15 + index * 5,
      price: demoItem.category === 'inverters' ? 8500 + index * 3000 : demoItem.category === 'batteries' ? 14500 + index * 4000 : 7500 + index * 5000,
      comparePrice: demoItem.category === 'inverters' ? 10500 : 17500,
      sku: `RPS-${demoItem.category.substring(0, 3).toUpperCase()}-00${index + 1}`,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    await db.collection('products').insertMany(initialProducts);
  }

  // 5. Seed Certifications if empty
  const certCount = await db.collection('certifications').countDocuments();
  if (certCount === 0) {
    await db.collection('certifications').insertMany([
      {
        id: 'cert-exide-gold-2025',
        title: 'Authorised Exide Reserve Power (Industrial) ALL STARS Gold Dealer',
        issuingAuthority: 'Exide Industries Limited',
        certificateNumber: 'Dealer Code: 92884',
        description: 'Officially certified Authorised Exide Reserve Power (Industrial) ALL STARS Gold Dealer awarded to M/s. RAJ POWER TECH SERVICES for excellence in industrial battery solutions and high-demand standby energy backup systems.',
        categoryScope: 'Industrial Batteries & Reserve Power',
        validFrom: '2025-04-01',
        validUntil: '2026-03-31',
        status: 'active',
        isPublished: true,
        imageUrl: '/images/cert-exide-gold-2025.png',
        notes: 'Conferred by Rajeev Khandelwal, Senior President & Head - Trade, Exide Industries Limited.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cert-bpe-benchmark-2026',
        title: 'Best Power Equipments (BPE) - Benchmark Partner',
        issuingAuthority: 'Best Power Equipments India Pvt. Ltd.',
        certificateNumber: 'BPE-BMP-2026-HYD',
        description: 'Presented in recognition and appreciation of dedication and valued contribution as Best Power Equipments Benchmark Partner to RAJPOWER TECH SERVICES, commemorating 26 years of BPE engineering excellence.',
        categoryScope: 'Enterprise Online UPS & Strategic Power Solutions',
        validFrom: '2024-07-24',
        validUntil: '2027-07-23',
        status: 'active',
        isPublished: true,
        imageUrl: '/images/cert-bpe-benchmark.png',
        notes: 'Conferred by Amitansu Satpathy, Group MD, Best Power Equipments.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cert-bpe-platinum-2024',
        title: 'BPE Platinum Partner Certificate of Appreciation (Vision 25)',
        issuingAuthority: 'Best Power Equipments India Pvt. Ltd.',
        certificateNumber: 'BPE-VISION25-PLATINUM-2023-24',
        description: 'Awarded to RAJ POWER TECH SERVICES HYDERABAD for outstanding performance and contribution to BPE growth as Platinum Partner in the year 2023-24.',
        categoryScope: 'UPS Systems & Critical Power Platinum Distribution',
        validFrom: '2023-04-01',
        validUntil: '2025-03-31',
        status: 'active',
        isPublished: true,
        imageUrl: '/images/cert-bpe-platinum-2024.png',
        notes: 'Conferred by Amitansu Satpathy, Group Managing Director, Best Power Equipments India Pvt. Ltd.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cert-bpe-platinum-2022',
        title: 'BPE Platinum Partner Star Award (2021-2022)',
        issuingAuthority: 'Best Power Equipments (I) Pvt. Ltd.',
        certificateNumber: 'BPE-PLATINUM-2021-22',
        description: 'Crystal Star Trophy awarded to RAJPOWER TECH SERVICES (HYDERABAD) for outstanding sales leadership, technical excellence, and contribution to BPE growth as Platinum Partner celebrating 22 years of power solutions.',
        categoryScope: 'Commercial Power Backup & UPS Distribution',
        validFrom: '2021-04-01',
        validUntil: '2023-03-31',
        status: 'active',
        isPublished: true,
        imageUrl: '/images/cert-bpe-platinum-2022.png',
        notes: 'Conferred by Amitansu Satpathy, Managing Director, Best Power Equipments (I) Pvt. Ltd.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }
});

// ==========================================
// USERS REPOSITORY
// ==========================================

export async function findUserByEmail(email: string): Promise<UserWithCredentials | null> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<UserWithCredentials>('users').findOne({ email: normalizedEmail });
  }

  assertStorageMode('findUserByEmail');
  for (const user of devUsers.values()) {
    if (user.email.toLowerCase() === normalizedEmail) {
      return user;
    }
  }
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const doc = await db.collection<UserWithCredentials>('users').findOne({ id });
    if (doc) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = doc;
      return safeUser;
    }
    return null;
  }

  assertStorageMode('findUserById');
  const user = devUsers.get(id);
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function createUser(userData: UserWithCredentials): Promise<User> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('users').insertOne(userData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = userData;
    return safeUser;
  }

  assertStorageMode('createUser');
  devUsers.set(userData.id, userData);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = userData;
  return safeUser;
}

export async function updateUser(id: string, updates: Partial<UserWithCredentials>): Promise<User | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('users').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    return findUserById(id);
  }

  assertStorageMode('updateUser');
  const existing = devUsers.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  devUsers.set(id, updated);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = updated;
  return safeUser;
}

export async function listAdminUsers(): Promise<User[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const docs = await db.collection<UserWithCredentials>('users').find({ role: { $in: ['admin', 'super_admin'] } }).toArray();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return docs.map(({ passwordHash, ...u }) => u);
  }

  assertStorageMode('listAdminUsers');
  return Array.from(devUsers.values())
    .filter((u) => u.role === 'admin' || u.role === 'super_admin')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ passwordHash, ...u }) => u);
}

// ==========================================
// VENDORS REPOSITORY
// ==========================================

export async function listVendors(): Promise<Vendor[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<Vendor>('vendors').find().sort({ createdAt: -1 }).toArray();
  }

  assertStorageMode('listVendors');
  return Array.from(devVendors.values());
}

export async function findVendorById(id: string): Promise<Vendor | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<Vendor>('vendors').findOne({ id });
  }

  assertStorageMode('findVendorById');
  return devVendors.get(id) || null;
}

export async function createVendorRecord(vendor: Vendor): Promise<Vendor> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('vendors').insertOne(vendor);
    return vendor;
  }

  assertStorageMode('createVendorRecord');
  devVendors.set(vendor.id, vendor);
  return vendor;
}

export async function updateVendorRecord(
  vendorId: string,
  updates: Partial<Vendor>
): Promise<Vendor | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('vendors').updateOne(
      { id: vendorId },
      { $set: { ...updates, updatedAt: new Date().toISOString() } }
    );
    return findVendorById(vendorId);
  }

  assertStorageMode('updateVendorRecord');
  const v = devVendors.get(vendorId);
  if (!v) return null;
  const updated = {
    ...v,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  devVendors.set(vendorId, updated);
  return updated;
}

export async function updateVendorStatus(
  vendorId: string,
  status: 'active' | 'inactive' | 'suspended' | 'blocked'
): Promise<Vendor | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('vendors').updateOne({ id: vendorId }, { $set: { status, updatedAt: new Date().toISOString() } });
    await db.collection('users').updateMany({ vendorId }, { $set: { status, updatedAt: new Date().toISOString() } });
    return findVendorById(vendorId);
  }

  assertStorageMode('updateVendorStatus');
  const v = devVendors.get(vendorId);
  if (!v) return null;
  v.status = status;
  v.updatedAt = new Date().toISOString();
  devVendors.set(vendorId, v);

  for (const [uid, user] of devUsers.entries()) {
    if (user.vendorId === vendorId) {
      user.status = status;
      user.updatedAt = new Date().toISOString();
      devUsers.set(uid, user);
    }
  }

  return v;
}

export async function deleteVendorRecord(vendorId: string): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('vendors').deleteOne({ id: vendorId });
    await db.collection('users').deleteMany({ vendorId });
    await db.collection('products').updateMany({ vendorId }, { $set: { isPublished: false, updatedAt: new Date().toISOString() } });
    return true;
  }

  assertStorageMode('deleteVendorRecord');
  devVendors.delete(vendorId);
  for (const [uid, user] of devUsers.entries()) {
    if (user.vendorId === vendorId) {
      devUsers.delete(uid);
    }
  }
  for (const [pid, prod] of devProducts.entries()) {
    if (prod.vendorId === vendorId) {
      prod.isPublished = false;
      devProducts.set(pid, prod);
    }
  }
  return true;
}

// ==========================================
// CATEGORIES / SOLUTIONS REPOSITORY
// ==========================================

export async function listCategories(): Promise<SolutionCategoryItem[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<SolutionCategoryItem>('categories').find().sort({ createdAt: 1 }).toArray();
  }

  assertStorageMode('listCategories');
  initDevStore();
  ensureCategoriesSeeded();
  const cats = devStore.categories || devCategories || new Map();
  return Array.from(cats.values());
}

export async function createCategory(cat: SolutionCategoryItem): Promise<SolutionCategoryItem> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('categories').insertOne(cat);
    return cat;
  }

  assertStorageMode('createCategory');
  initDevStore();
  if (!devStore.categories) {
    devStore.categories = new Map();
  }
  devStore.categories.set(cat.id, cat);
  return cat;
}

// ==========================================
// PRODUCTS REPOSITORY (Multi-Vendor Isolated)
// ==========================================

export async function listProducts(filter?: { vendorId?: string; category?: string; isPublished?: boolean }): Promise<Product[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const query: Record<string, unknown> = {};
    if (filter?.vendorId) query.vendorId = filter.vendorId;
    if (filter?.category) query.category = filter.category;
    if (filter?.isPublished !== undefined) query.isPublished = filter.isPublished;
    return await db.collection<Product>('products').find(query).sort({ createdAt: -1 }).toArray();
  }

  assertStorageMode('listProducts');
  let list = Array.from(devProducts.values());
  if (filter?.vendorId) {
    list = list.filter((p) => p.vendorId === filter.vendorId);
  }
  if (filter?.category) {
    list = list.filter((p) => p.category === filter.category);
  }
  if (filter?.isPublished !== undefined) {
    list = list.filter((p) => p.isPublished === filter.isPublished);
  }
  return list;
}

export async function findProductById(id: string): Promise<Product | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<Product>('products').findOne({ id });
  }

  assertStorageMode('findProductById');
  return devProducts.get(id) || null;
}

export async function createProductRecord(product: Product): Promise<Product> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('products').insertOne(product);
    return product;
  }

  assertStorageMode('createProductRecord');
  devProducts.set(product.id, product);
  return product;
}

export async function updateProductRecord(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('products').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    return findProductById(id);
  }

  assertStorageMode('updateProductRecord');
  const p = devProducts.get(id);
  if (!p) return null;
  const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
  devProducts.set(id, updated);
  return updated;
}

export async function deleteProductRecord(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('products').deleteOne({ id });
    return true;
  }

  assertStorageMode('deleteProductRecord');
  devProducts.delete(id);
  return true;
}

/**
 * Concurrency-safe atomic inventory reservation:
 * Ensures stock >= requestedQuantity before decrementing atomically.
 * Returns true if deduction succeeded, false if insufficient stock.
 */
export async function atomicDeductStock(productId: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) return true;

  if (isMongoConfigured()) {
    const db = await getDatabase();
    const res = await db.collection('products').updateOne(
      { id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity }, $set: { updatedAt: new Date().toISOString() } }
    );
    return res.modifiedCount > 0;
  }

  assertStorageMode('atomicDeductStock');
  const p = devProducts.get(productId);
  if (!p || (p.stock ?? 0) < quantity) {
    return false;
  }
  p.stock = (p.stock ?? 0) - quantity;
  p.updatedAt = new Date().toISOString();
  devProducts.set(productId, p);
  return true;
}

/**
 * Atomic stock release (for cancellations or refunds)
 */
export async function atomicRestoreStock(productId: string, quantity: number): Promise<void> {
  if (quantity <= 0) return;

  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('products').updateOne(
      { id: productId },
      { $inc: { stock: quantity }, $set: { updatedAt: new Date().toISOString() } }
    );
    return;
  }

  assertStorageMode('atomicRestoreStock');
  const p = devProducts.get(productId);
  if (p) {
    p.stock = (p.stock ?? 0) + quantity;
    p.updatedAt = new Date().toISOString();
    devProducts.set(productId, p);
  }
}

// ==========================================
// ORDERS REPOSITORY (Multi-Vendor Segregation)
// ==========================================

export async function listOrders(): Promise<Order[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<Order>('orders').find().sort({ createdAt: -1 }).toArray();
  }

  assertStorageMode('listOrders');
  return Array.from(devOrders.values());
}

/**
 * Vendor-isolated order item query:
 * Returns order items belonging strictly to the requesting vendor.
 */
export async function listVendorOrderItems(vendorId: string): Promise<OrderItem[]> {
  const allOrders = await listOrders();
  const vendorItems: OrderItem[] = [];
  
  for (const order of allOrders) {
    for (const item of order.items) {
      if (item.vendorId === vendorId) {
        vendorItems.push({
          ...item,
          customer: order.customer,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          overallOrderStatus: order.orderStatus,
          orderNotes: order.notes,
        });
      }
    }
  }
  return vendorItems;
}

export async function findOrderById(id: string): Promise<Order | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<Order>('orders').findOne({ id });
  }

  assertStorageMode('findOrderById');
  return devOrders.get(id) || null;
}

export async function createOrderRecord(order: Order): Promise<Order> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('orders').insertOne(order);
    return order;
  }

  assertStorageMode('createOrderRecord');
  devOrders.set(order.id, order);
  return order;
}

export async function updateOrderRecord(id: string, updates: Partial<Order>): Promise<Order | null> {
  const current = await findOrderById(id);
  if (!current) return null;

  const updated: Order = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('orders').updateOne({ id }, { $set: updated });
    return updated;
  }

  assertStorageMode('updateOrderRecord');
  devOrders.set(id, updated);
  return updated;
}

export async function updateOrderItemFulfilment(
  orderId: string,
  itemId: string,
  vendorId: string,
  status: ItemFulfilmentStatus,
  trackingNumber?: string
): Promise<OrderItem | null> {
  const order = await findOrderById(orderId);
  if (!order) return null;

  const itemIndex = order.items.findIndex((item) => item.id === itemId && (!vendorId || item.vendorId === vendorId));
  if (itemIndex === -1) return null;

  const item = order.items[itemIndex];
  item.fulfilmentStatus = status;
  if (trackingNumber) item.trackingNumber = trackingNumber;
  if (status === 'dispatched') item.dispatchedAt = new Date().toISOString();
  if (status === 'delivered') {
    item.deliveredAt = new Date().toISOString();
    item.settlementStatus = 'ready_for_payout';
  }
  item.updatedAt = new Date().toISOString();

  // If item is cancelled, restore stock atomically
  if (status === 'cancelled') {
    item.cancelledAt = new Date().toISOString();
    await atomicRestoreStock(item.productId, item.quantity);
  }

  // Recalculate overall order status
  const statuses = order.items.map((i) => i.fulfilmentStatus);
  if (statuses.every((s) => s === 'delivered')) {
    order.orderStatus = 'fulfilled';
  } else if (statuses.some((s) => s === 'dispatched' || s === 'delivered')) {
    order.orderStatus = 'partially_fulfilled';
  } else if (statuses.every((s) => s === 'cancelled')) {
    order.orderStatus = 'cancelled';
  }

  order.updatedAt = new Date().toISOString();

  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('orders').updateOne({ id: orderId }, { $set: order });
    return item;
  }

  assertStorageMode('updateOrderItemFulfilment');
  devOrders.set(orderId, order);
  return item;
}

// ==========================================
// QUOTATIONS REPOSITORY (Multi-Vendor Isolated)
// ==========================================

export async function listQuotations(filter?: { vendorId?: string }): Promise<QuotationRequest[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const query: Record<string, unknown> = {};
    if (filter?.vendorId) {
      query.assignedVendorIds = filter.vendorId;
    }
    return await db.collection<QuotationRequest>('quotations').find(query).sort({ createdAt: -1 }).toArray();
  }

  assertStorageMode('listQuotations');
  let list = Array.from(devQuotations.values());
  if (filter?.vendorId) {
    list = list.filter((q) => q.assignedVendorIds.includes(filter.vendorId!));
  }
  return list;
}

export async function createQuotationRecord(quote: QuotationRequest): Promise<QuotationRequest> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('quotations').insertOne(quote);
    return quote;
  }

  assertStorageMode('createQuotationRecord');
  devQuotations.set(quote.id, quote);
  return quote;
}

export async function updateQuotationStatus(
  quoteId: string,
  status: QuotationStatus,
  note: string,
  userId: string,
  userName: string,
  quotedAmount?: number,
  commercialDetails?: Partial<QuotationRequest>
): Promise<QuotationRequest | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const quote = await db.collection<QuotationRequest>('quotations').findOne({ id: quoteId });
    if (!quote) return null;

    quote.status = status;
    if (quotedAmount !== undefined) quote.quotedAmount = quotedAmount;
    if (commercialDetails) {
      Object.assign(quote, commercialDetails);
    }
    quote.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note,
      updatedBy: userId,
      updatedByName: userName,
    });
    quote.updatedAt = new Date().toISOString();

    await db.collection('quotations').updateOne({ id: quoteId }, { $set: quote });
    return quote;
  }

  assertStorageMode('updateQuotationStatus');
  const quote = devQuotations.get(quoteId);
  if (!quote) return null;

  quote.status = status;
  if (quotedAmount !== undefined) quote.quotedAmount = quotedAmount;
  if (commercialDetails) {
    Object.assign(quote, commercialDetails);
  }
  quote.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note,
    updatedBy: userId,
    updatedByName: userName,
  });
  quote.updatedAt = new Date().toISOString();

  devQuotations.set(quoteId, quote);
  return quote;
}

// ==========================================
// CERTIFICATIONS REPOSITORY
// ==========================================

function sanitizeCertImage(cert: Certification | null): Certification | null {
  if (!cert) return null;
  if (cert.imageUrl && cert.imageUrl.endsWith('.svg')) {
    return { ...cert, imageUrl: cert.imageUrl.replace('.svg', '.jpg') };
  }
  return cert;
}

let _certificationsSeededInMongo = false;

export async function listCertifications(onlyPublished = false): Promise<Certification[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    if (!_certificationsSeededInMongo) {
      _certificationsSeededInMongo = true;
      try {
        await db.collection('certifications').deleteMany({ id: { $in: DUMMY_CERT_IDS } });
        for (const cert of AUTHENTIC_CERTIFICATIONS) {
          await db.collection('certifications').updateOne({ id: cert.id }, { $set: cert }, { upsert: true });
        }
      } catch (seedErr) {
        console.warn('Non-fatal error seeding certs to mongo:', seedErr);
      }
    }
    const query = onlyPublished ? { isPublished: true } : {};
    const docs = await db.collection<Certification>('certifications').find(query).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => sanitizeCertImage(d)!);
  }

  assertStorageMode('listCertifications');
  ensureAuthenticCertificationsSeeded();
  let certs = Array.from(devCertifications.values()).map((d) => sanitizeCertImage(d)!);
  if (onlyPublished) {
    certs = certs.filter((c) => c.isPublished);
  }
  return certs;
}

export async function findCertificationById(id: string): Promise<Certification | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const doc = await db.collection<Certification>('certifications').findOne({ id });
    return sanitizeCertImage(doc);
  }

  assertStorageMode('findCertificationById');
  return sanitizeCertImage(devCertifications.get(id) || null);
}

export async function createCertificationRecord(cert: Certification): Promise<Certification> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('certifications').insertOne(cert);
    return cert;
  }

  assertStorageMode('createCertificationRecord');
  devCertifications.set(cert.id, cert);
  return cert;
}

export async function updateCertificationRecord(id: string, updates: Partial<Certification>): Promise<Certification | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('certifications').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    return findCertificationById(id);
  }

  assertStorageMode('updateCertificationRecord');
  const existing = devCertifications.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  devCertifications.set(id, updated);
  return updated;
}

export async function deleteCertificationRecord(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const res = await db.collection('certifications').deleteOne({ id });
    return res.deletedCount > 0;
  }

  assertStorageMode('deleteCertificationRecord');
  return devCertifications.delete(id);
}

// ==========================================
// PAYMENTS REPOSITORY (Separated Transactions)
// ==========================================

export async function createPaymentRecord(payment: PaymentRecord): Promise<PaymentRecord> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('payments').insertOne(payment);
    return payment;
  }

  assertStorageMode('createPaymentRecord');
  devPayments.set(payment.id, payment);
  return payment;
}

export async function findPaymentById(id: string): Promise<PaymentRecord | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<PaymentRecord>('payments').findOne({ id });
  }

  assertStorageMode('findPaymentById');
  return devPayments.get(id) || null;
}

export async function findPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    return await db.collection<PaymentRecord>('payments').findOne({ orderId });
  }

  assertStorageMode('findPaymentByOrderId');
  for (const p of devPayments.values()) {
    if (p.orderId === orderId) return p;
  }
  return null;
}

export async function updatePaymentRecord(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('payments').updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    return findPaymentById(id);
  }

  assertStorageMode('updatePaymentRecord');
  const existing = devPayments.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  devPayments.set(id, updated);
  return updated;
}

// ==========================================
// ORDER NOTIFICATIONS REPOSITORY
// ==========================================

export async function saveOrderNotification(event: OrderNotificationEvent): Promise<OrderNotificationEvent> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('order_notifications').insertOne(event);
    return event;
  }

  assertStorageMode('saveOrderNotification');
  devNotifications.set(event.id, event);
  return event;
}

export async function listOrderNotifications(filter?: { orderId?: string; vendorId?: string; recipientType?: string }): Promise<OrderNotificationEvent[]> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const query: Record<string, unknown> = {};
    if (filter?.orderId) query.orderId = filter.orderId;
    if (filter?.vendorId) query.recipientId = filter.vendorId;
    if (filter?.recipientType) query.recipientType = filter.recipientType;
    return await db.collection<OrderNotificationEvent>('order_notifications').find(query).sort({ createdAt: -1 }).toArray();
  }

  assertStorageMode('listOrderNotifications');
  let list = Array.from(devNotifications.values());
  if (filter?.orderId) list = list.filter((n) => n.orderId === filter.orderId);
  if (filter?.vendorId) list = list.filter((n) => n.recipientId === filter.vendorId);
  if (filter?.recipientType) list = list.filter((n) => n.recipientType === filter.recipientType);
  return list;
}

// ==========================================
// SETTINGS REPOSITORY
// ==========================================

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (isMongoConfigured()) {
    const db = await getDatabase();
    const doc = await db.collection<PlatformSettings>('settings').findOne({ id: 'platform_config' });
    if (doc) return doc;
  }

  assertStorageMode('getPlatformSettings');
  return devStore.settings;
}

export async function updatePlatformSettings(updates: Partial<PlatformSettings>, updatedByUserId: string): Promise<PlatformSettings> {
  const current = await getPlatformSettings();
  const updated: PlatformSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByUserId,
  };

  if (isMongoConfigured()) {
    const db = await getDatabase();
    await db.collection('settings').updateOne(
      { id: 'platform_config' },
      { $set: updated },
      { upsert: true }
    );
    return updated;
  }

  assertStorageMode('updatePlatformSettings');
  devStore.settings = updated;
  return devStore.settings;
}
