import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('ERROR: MONGODB_URI environment variable is required to run this script.');
  process.exit(1);
}

const CATEGORIES_TO_SEED = [
  {
    id: 'lithium',
    name: 'Lithium Products',
    slug: 'lithium',
    description: 'Next-generation LiFePO4 lithium batteries and integrated wall-mount power systems offering 3500+ cycles and ultra-fast charging.',
    features: ['LiFePO4 Safe Chemistry', '3500+ Deep Cycles', 'Zero Water Maintenance', 'Integrated Smart BMS'],
  },
  {
    id: 'ups',
    name: 'Online UPS',
    slug: 'ups',
    description: 'True double-conversion online UPS systems (0ms transfer) for critical servers, industrial machinery, and medical equipment.',
    features: ['Zero Transfer Switching (0ms)', 'Pure Sine Wave Output', 'High Input Power Factor', 'Active IGBT Technology'],
  },
  {
    id: 'high-capacity-ups',
    name: 'High Capacity UPS',
    slug: 'high-capacity-ups',
    description: 'Heavy-duty Jumbo pure sine wave commercial inverters (2.5kVA to 8kVA) engineered for villas, commercial offices, and multi-appliance loads.',
    features: ['Heavy Duty DSC Technology', 'Runs Air Conditioners & Motors', 'Multi-Battery Bank 24V-96V', 'Rugged Commercial Reliability'],
  },
  {
    id: 'inverters',
    name: 'Inverters',
    slug: 'inverters',
    description: 'Pure sine wave home & commercial inverters engineered for dependable continuous power during outages.',
    features: ['Pure Sine Wave Output', 'Smart Battery Management', 'Overload & Short Circuit Protection'],
  },
  {
    id: 'batteries',
    name: 'Batteries',
    slug: 'batteries',
    description: 'High-cycle tubular & SMF inverter batteries built for severe climate conditions and deep discharge longevity.',
    features: ['Tall Tubular Heavy Duty Plates', 'Ultra Low Maintenance', 'Fast Recharge Technology'],
  },
];

async function seedSatyajan() {
  console.log('Fetching products from Satyajan API (https://satyajan.com/api/products)...');
  const res = await fetch('https://satyajan.com/api/products');
  if (!res.ok) {
    throw new Error(`Failed to fetch Satyajan API: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const targetCategories = ['Lithium Products', 'ONLINE UPS', 'High Capacity UPS'];
  const rawProducts = (data.products || []).filter(p => targetCategories.includes(p.category));

  console.log(`Retrieved ${rawProducts.length} matching products from Satyajan.`);

  const mappedProducts = rawProducts.map((p, idx) => {
    let catId = 'lithium';
    let catName = 'Lithium Products';
    if (p.category === 'ONLINE UPS') {
      catId = 'ups';
      catName = 'Online UPS';
    } else if (p.category === 'High Capacity UPS') {
      catId = 'high-capacity-ups';
      catName = 'High Capacity UPS';
    }

    let brand = 'Microtek';
    if (p.name.toLowerCase().includes('bpe')) brand = 'BPE';
    else if (p.name.toLowerCase().includes('exide')) brand = 'Exide';
    else if (p.name.toLowerCase().includes('amaron')) brand = 'Amaron Quanta';

    const specs = [];
    if (Array.isArray(p.specifications)) {
      p.specifications.forEach(s => {
        const lbl = (s.labal || s.label || '').trim();
        const val = (s.value || '').trim();
        if (lbl && val && specs.length < 8) {
          specs.push({ label: lbl, value: val });
        }
      });
    }
    if (Array.isArray(p.data)) {
      p.data.forEach(d => {
        const lbl = (d.labal || d.label || '').trim();
        const val = (d.value || '').trim();
        if (lbl && val && specs.length < 8) {
          specs.push({ label: lbl, value: val });
        }
      });
    }

    const capSpec = specs.find(s => s.label.toLowerCase().includes('capacity') || s.label.toLowerCase().includes('rating'));
    const capacity = capSpec ? capSpec.value : (p.name.match(/\d+(\.\d+)?\s*(KVA|kVA|VA|Ah|Watts|W)/i)?.[0] || 'High Capacity');

    const warranty = p.name.includes('5-Year') || p.description?.includes('5-Year')
      ? '60 Months Official Warranty'
      : p.name.includes('3-Year') || p.description?.includes('3-Year')
      ? '36 Months Official Warranty'
      : '24 Months Official Warranty';

    const mainImage = p.images?.[0]?.src || '/products/microtek-vturbo-clean.png';
    const additionalImages = (p.images || []).slice(1).map(img => img.src);

    const price = typeof p.price === 'number' && p.price > 0 ? p.price : 19999;
    const comparePrice = Math.round(price * 1.25);

    const now = new Date().toISOString();

    return {
      id: `sat-${p.slug || p.id || 'prod-' + idx}`,
      name: p.name.trim(),
      slug: p.slug || `sat-prod-${idx}`,
      brand,
      category: catId,
      categoryName: catName,
      price,
      comparePrice,
      availability: 'In Stock',
      stock: 12 + (idx % 8),
      sku: (p.SKU || `SKU-SAT-${idx}`).trim(),
      shortDescription: p.description?.split('\n')[0]?.substring(0, 220) || `${p.name} with verified factory warranty and doorstep installation.`,
      fullDescription: p.description || p.name,
      imageUrl: mainImage,
      additionalImages,
      keySpecs: specs.length > 0 ? specs : [{ label: 'Capacity', value: capacity }, { label: 'Warranty', value: warranty }],
      features: [...(p.features || []), ...(p.salient_features || [])].filter(Boolean).slice(0, 6),
      warrantyPeriod: warranty,
      capacity,
      vendorId: 'ven-rps-primary',
      vendorName: 'RAJ POWER TECH ENTERPRISES',
      isFeatured: true,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Write to a TS file so it can also be used as fallback data
  const tsContent = `// Auto-generated from Satyajan Energy Solutions API
import { Product } from '@/types/product';

export const SATYAJAN_PRODUCTS: Product[] = ${JSON.stringify(mappedProducts, null, 2)};
`;
  const targetTsPath = path.resolve('lib/satyajan-products-data.ts');
  fs.writeFileSync(targetTsPath, tsContent, 'utf-8');
  console.log(`Saved ${mappedProducts.length} Satyajan products to lib/satyajan-products-data.ts`);

  // Connect to Mongo and upsert
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('rps_ecommerce');

    // 1. Categories
    console.log('Upserting categories in MongoDB...');
    const catCol = db.collection('categories');
    for (const cat of CATEGORIES_TO_SEED) {
      await catCol.updateOne(
        { id: cat.id },
        { $set: { ...cat, updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } },
        { upsert: true }
      );
    }
    console.log('Categories updated successfully.');

    // 2. Products
    console.log('Upserting Satyajan products in MongoDB...');
    const prodCol = db.collection('products');
    let upserted = 0;
    for (const prod of mappedProducts) {
      await prodCol.updateOne(
        { id: prod.id },
        { $set: prod },
        { upsert: true }
      );
      upserted++;
    }
    console.log(`Successfully upserted ${upserted} Satyajan products in MongoDB!`);

    // Verify totals
    const totalCount = await prodCol.countDocuments();
    const catCounts = await prodCol.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    console.log(`Total Products in MongoDB: ${totalCount}`);
    console.log('Products by Category in MongoDB:', catCounts);
  } finally {
    await client.close();
  }
}

seedSatyajan().catch(console.error);
