import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Read MONGODB_URI from .env.local
let uri = process.env.MONGODB_URI;
if (!uri) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) uri = match[1].trim();
  } catch (err) {
    console.error('Could not read .env.local:', err.message);
  }
}

const NEW_CATEGORIES = [
  {
    id: 'solar',
    name: 'Solar',
    slug: 'solar',
    description: 'High-efficiency solar hybrid inverters, solar charge controllers, and rooftop photovoltaic systems engineered for maximum clean energy yield.',
    features: ['Solar Hybrid MPPT Tech', 'Grid Export & Off-Grid Modes', 'High Solar Yield Efficiency', 'IP65 Weatherproof Enclosure'],
  },
  {
    id: 'combo',
    name: 'Combo',
    slug: 'combo',
    description: 'Pre-engineered inverter and heavy-duty tubular battery combo packages matched for maximum efficiency, seamless home backup, and zero sizing guesswork.',
    features: ['Pre-Matched Inverter & Battery', 'Optimized Backup Runtime', 'Single Warranty Desk', 'Free Doorstep Setup'],
  },
];

function sanitizeImage(imgUrl, category, name) {
  if (!imgUrl) {
    if (category === 'solar') return '/products/inverter-demo-1.jpg';
    return '/products/microtek-smart-hybrid-1275.png';
  }
  // If the image is on dead cms.microtek.in, provide high quality local equivalent
  if (imgUrl.includes('cms.microtek.in')) {
    const lower = (name || '').toLowerCase();
    if (category === 'solar') {
      if (lower.includes('battery')) return '/products/amaron-quanta-tubular-clean.png';
      if (lower.includes('panel') || lower.includes('module')) return '/products/ups-demo-1.jpg';
      return '/products/inverter-demo-1.jpg';
    }
    if (lower.includes('lithium')) return '/products/microtek-i-lithium-1500-clean.png';
    return '/products/microtek-vturbo-clean.png';
  }
  return imgUrl;
}

async function run() {
  console.log('Fetching products from Satyajan API...');
  const res = await fetch('https://satyajan.com/api/products');
  if (!res.ok) {
    throw new Error(`Failed to fetch from Satyajan: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const allApiProducts = data.products || [];

  // Filter for Solar and Combo
  const targetRaw = allApiProducts.filter(p => p.category === 'Solar' || p.category === 'Combo');
  console.log(`Found ${targetRaw.length} products to import (${targetRaw.filter(p => p.category === 'Solar').length} Solar, ${targetRaw.filter(p => p.category === 'Combo').length} Combo).`);

  const now = new Date().toISOString();

  const newProducts = targetRaw.map((p, idx) => {
    const isSolar = p.category === 'Solar';
    const catId = isSolar ? 'solar' : 'combo';
    const catName = isSolar ? 'Solar' : 'Combo';

    let brand = 'Microtek';
    const lowerName = p.name.toLowerCase();
    if (lowerName.includes('exide')) brand = 'Exide';
    else if (lowerName.includes('bpe')) brand = 'BPE';
    else if (lowerName.includes('amaron')) brand = 'Amaron Quanta';

    const specs = [];
    if (Array.isArray(p.specifications)) {
      p.specifications.forEach(s => {
        const lbl = (s.labal || s.label || '').trim();
        const val = (s.value || '').trim();
        if (lbl && val && specs.length < 8) specs.push({ label: lbl, value: val });
      });
    }
    if (Array.isArray(p.data)) {
      p.data.forEach(d => {
        const lbl = (d.labal || d.label || '').trim();
        const val = (d.value || '').trim();
        if (lbl && val && specs.length < 8) specs.push({ label: lbl, value: val });
      });
    }

    const capSpec = specs.find(s => s.label.toLowerCase().includes('capacity') || s.label.toLowerCase().includes('rating'));
    const capacity = capSpec ? capSpec.value : (p.name.match(/\d+(\.\d+)?\s*(KVA|kVA|VA|Ah|Watts|W|KW|kW)/i)?.[0] || (isSolar ? 'Solar Rated' : 'Heavy Duty'));

    const warranty = p.name.includes('5-Year') || p.description?.includes('5-Year')
      ? '60 Months Official Warranty'
      : p.name.includes('3-Year') || p.description?.includes('3-Year')
      ? '36 Months Official Warranty'
      : '24 Months Official Warranty';

    const rawMainImg = p.images?.[0]?.src;
    const mainImg = sanitizeImage(rawMainImg, catId, p.name);
    const additionalImages = (p.images || []).slice(1).map(img => sanitizeImage(img.src, catId, p.name));

    const price = typeof p.price === 'number' && p.price > 0 ? p.price : (isSolar ? 24990 : 21990);
    const comparePrice = Math.round(price * 1.25);

    const cleanSlug = (p.slug || p.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      id: `sat-${cleanSlug || 'prod-' + idx}`,
      name: p.name.trim(),
      slug: cleanSlug,
      brand,
      category: catId,
      categoryName: catName,
      price,
      comparePrice,
      availability: 'In Stock',
      stock: 10 + (idx % 10),
      sku: (p.SKU || `SKU-${catId.toUpperCase()}-${idx}`).trim(),
      shortDescription: p.description?.split('\n')[0]?.substring(0, 220) || `${p.name} with verified factory warranty and doorstep installation.`,
      fullDescription: p.description || p.name,
      imageUrl: mainImg,
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

  // Read existing SATYAJAN_PRODUCTS
  let existingProducts = [];
  try {
    const dataPath = path.resolve('lib/satyajan-products-data.ts');
    const content = fs.readFileSync(dataPath, 'utf8');
    const match = content.match(/export const SATYAJAN_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/);
    if (match) {
      existingProducts = JSON.parse(match[1]);
    }
  } catch (err) {
    console.warn('Could not read existing satyajan-products-data.ts, starting fresh:', err.message);
  }

  // Merge products avoiding duplicates by id
  const productMap = new Map();
  existingProducts.forEach(p => productMap.set(p.id, p));
  newProducts.forEach(p => productMap.set(p.id, p));

  const allMergedProducts = Array.from(productMap.values());

  // Write updated satyajan-products-data.ts
  const tsContent = `// Auto-generated from Satyajan Energy Solutions API
import { Product } from '@/types/product';

export const SATYAJAN_PRODUCTS: Product[] = ${JSON.stringify(allMergedProducts, null, 2)};
`;
  fs.writeFileSync(path.resolve('lib/satyajan-products-data.ts'), tsContent, 'utf-8');
  console.log(`Saved ${allMergedProducts.length} total products to lib/satyajan-products-data.ts (${newProducts.length} added/updated)`);

  // Connect to MongoDB Atlas and save categories + products
  if (uri) {
    console.log('Connecting to MongoDB Atlas...');
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      const db = client.db('rps_ecommerce');

      // 1. Save new categories
      console.log('Upserting Solar and Combo categories in DB...');
      const catCol = db.collection('categories');
      for (const cat of NEW_CATEGORIES) {
        await catCol.updateOne(
          { id: cat.id },
          { $set: { ...cat, updatedAt: now }, $setOnInsert: { createdAt: now } },
          { upsert: true }
        );
      }
      console.log('Categories upserted successfully in MongoDB!');

      // 2. Save products in DB
      console.log('Upserting Solar and Combo products in DB...');
      const prodCol = db.collection('products');
      let count = 0;
      for (const prod of newProducts) {
        await prodCol.updateOne(
          { id: prod.id },
          { $set: prod },
          { upsert: true }
        );
        count++;
      }
      console.log(`Successfully upserted ${count} Solar & Combo products in MongoDB!`);

      // Verify DB counts
      const totalInDb = await prodCol.countDocuments();
      const catAgg = await prodCol.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray();
      console.log(`Total Products in MongoDB: ${totalInDb}`);
      console.log('Category distribution in MongoDB:', catAgg);

      const dbCats = await catCol.find().toArray();
      console.log('All categories in DB:', dbCats.map(c => ({ id: c.id, name: c.name })));
    } catch (dbErr) {
      console.error('MongoDB Atlas operation error:', dbErr.message);
    } finally {
      await client.close();
    }
  } else {
    console.warn('No MONGODB_URI found, skipped DB upsert.');
  }
}

run().catch(console.error);

