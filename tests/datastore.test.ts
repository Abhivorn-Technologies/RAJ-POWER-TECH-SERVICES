import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_FEATURED_PRODUCTS } from '../lib/demo-data';
import { AUTHENTIC_CERTIFICATIONS, DEFAULT_ELIGIBLE_PINCODES } from '../lib/db/data-store';

test('DATASTORE: DEMO_FEATURED_PRODUCTS catalog integrity', () => {
  assert.ok(DEMO_FEATURED_PRODUCTS.length >= 10, 'Catalog should contain full range of products');

  for (const product of DEMO_FEATURED_PRODUCTS) {
    assert.ok(product.id, 'Every product must have an ID');
    assert.ok(product.name, 'Every product must have a name');
    assert.ok(product.brand, 'Every product must specify a brand');
    assert.ok(['inverters', 'batteries', 'ups'].includes(product.category), `Category ${product.category} must be one of inverters/batteries/ups`);
    assert.ok(typeof product.price === 'number' && product.price > 0, `Product ${product.id} must have a valid positive price`);
    assert.ok(product.imageUrl, `Product ${product.id} must have an image path`);
  }
});

test('DATASTORE: 4 Authorized Brands are all present in catalog', () => {
  const brands = new Set(DEMO_FEATURED_PRODUCTS.map((p) => p.brand));

  assert.ok(brands.has('BPE'), 'Catalog must include BPE UPS Systems');
  assert.ok(brands.has('Exide'), 'Catalog must include Exide Powersafe Plus / Inva Tubular');
  assert.ok(brands.has('Amaron Quanta'), 'Catalog must include Amaron Quanta VRLA Batteries');
  assert.ok(brands.has('Microtek'), 'Catalog must include Microtek Inverters');
});

test('DATASTORE: Authentic Certifications integrity', () => {
  assert.ok(AUTHENTIC_CERTIFICATIONS.length >= 2, 'Authentic certifications should be seeded');

  const exideCert = AUTHENTIC_CERTIFICATIONS.find((c) => c.id === 'cert-exide-gold-2025');
  assert.ok(exideCert, 'Must include official Exide Gold Dealer Certification');
  assert.strictEqual(exideCert?.status, 'active');
  assert.strictEqual(exideCert?.isPublished, true);
  assert.ok(exideCert?.certificateNumber?.includes('92884'), 'Exide dealer code must be 92884');

  const bpeCert = AUTHENTIC_CERTIFICATIONS.find((c) => c.id === 'cert-bpe-benchmark-2026');
  assert.ok(bpeCert, 'Must include official BPE Benchmark Award');
  assert.strictEqual(bpeCert?.status, 'active');
  assert.strictEqual(bpeCert?.isPublished, true);
});

test('DATASTORE: Default Eligible Pincodes contain RPS Headquarters and key business zones', () => {
  assert.ok(DEFAULT_ELIGIBLE_PINCODES.length >= 6);

  const hqPincode = DEFAULT_ELIGIBLE_PINCODES.find((r) => r.pincode === '500009');
  assert.ok(hqPincode, 'Pincode 500009 (RPS HQ Secunderabad) must be active in default rules');
  assert.strictEqual(hqPincode?.active, true);
  assert.strictEqual(hqPincode?.deliveryFeeINR, 0);

  const hitecCityPincode = DEFAULT_ELIGIBLE_PINCODES.find((r) => r.pincode === '500081');
  assert.ok(hitecCityPincode, 'Pincode 500081 (Hitec City) must be active');
  assert.strictEqual(hitecCityPincode?.active, true);
});

test('DATASTORE: getLatestProductPerBrand returns exactly 1 latest product for each authorized brand', async () => {
  const { getLatestProductPerBrand } = await import('../lib/products-helper');

  const latestByBrand = getLatestProductPerBrand(DEMO_FEATURED_PRODUCTS);
  assert.strictEqual(latestByBrand.length, 4, 'Should contain exactly 4 products (1 per authorized brand)');

  const brandsFound = latestByBrand.map((p) => p.brand.toLowerCase());
  assert.ok(brandsFound.some((b) => b.includes('bpe')), 'Must contain 1 BPE product');
  assert.ok(brandsFound.some((b) => b.includes('exide')), 'Must contain 1 Exide product');
  assert.ok(brandsFound.some((b) => b.includes('amaron')), 'Must contain 1 Amaron product');
  assert.ok(brandsFound.some((b) => b.includes('microtek')), 'Must contain 1 Microtek product');

  // Verify that if a new product is added by admin with a newer createdAt/updatedAt, it becomes the selected product for that brand
  const newMicrotek = {
    ...latestByBrand.find((p) => p.brand.toLowerCase().includes('microtek'))!,
    id: 'mtk-latest-admin-01',
    name: 'Microtek Super Inverter 2026 Admin Upload',
    createdAt: new Date(Date.now() + 10000).toISOString(),
    updatedAt: new Date(Date.now() + 10000).toISOString(),
  };

  const updatedCatalog = [newMicrotek, ...DEMO_FEATURED_PRODUCTS];
  const newLatestByBrand = getLatestProductPerBrand(updatedCatalog);
  assert.strictEqual(newLatestByBrand.length, 4);
  const microtekPick = newLatestByBrand.find((p) => p.brand.toLowerCase().includes('microtek'));
  assert.strictEqual(microtekPick?.id, 'mtk-latest-admin-01', 'Should select the newly uploaded admin product for Microtek');
});
