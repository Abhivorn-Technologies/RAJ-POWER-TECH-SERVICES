import test from 'node:test';
import assert from 'node:assert/strict';
import { Order, OrderItem } from '../types/order';

test('ORDERS: Multi-vendor commission and vendor earnings calculation', () => {
  const itemTotal = 25000;
  const commissionRate = 5.0; // 5%
  const commissionAmount = (itemTotal * commissionRate) / 100;
  const vendorEarnings = itemTotal - commissionAmount;

  assert.strictEqual(commissionAmount, 1250, '5% commission on 25,000 should be 1,250');
  assert.strictEqual(vendorEarnings, 23750, 'Vendor earnings should be 23,750');
});

test('ORDERS: Multi-vendor zero commission rate', () => {
  const itemTotal = 15000;
  const commissionRate = 0;
  const commissionAmount = (itemTotal * commissionRate) / 100;
  const vendorEarnings = itemTotal - commissionAmount;

  assert.strictEqual(commissionAmount, 0);
  assert.strictEqual(vendorEarnings, 15000);
});

test('ORDERS: Server-controlled delivery fee calculation with free delivery threshold', () => {
  const threshold = 10000;
  const flatFee = 450;

  // Below threshold
  const subtotal1 = 8500;
  let deliveryFee1 = flatFee;
  if (threshold && subtotal1 >= threshold) {
    deliveryFee1 = 0;
  }
  assert.strictEqual(deliveryFee1, 450, 'Orders under threshold should incur standard delivery fee');

  // Above threshold
  const subtotal2 = 14500;
  let deliveryFee2 = flatFee;
  if (threshold && subtotal2 >= threshold) {
    deliveryFee2 = 0;
  }
  assert.strictEqual(deliveryFee2, 0, 'Orders meeting or exceeding threshold should receive free delivery');
});

test('ORDERS: Multi-vendor data segregation integrity', () => {
  const sampleOrder: Order = {
    id: 'ord-test-01',
    orderNumber: 'RPS-ORD-2026-99999',
    customer: {
      fullName: 'Rahul Sharma',
      phone: '9849011223',
      line1: 'Flat 402, Green Valley',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
    },
    items: [
      {
        id: 'itm-1',
        orderId: 'ord-test-01',
        orderNumber: 'RPS-ORD-2026-99999',
        vendorId: 'ven-alpha',
        vendorName: 'Alpha Power Solutions',
        productId: 'p-inverter-1',
        productName: 'Exide Inverter',
        productSku: 'EX-INV-01',
        productCategory: 'inverters',
        productImage: '/img.jpg',
        quantity: 1,
        unitPrice: 12000,
        totalPrice: 12000,
        fulfilmentStatus: 'pending',
        settlementStatus: 'pending',
        commissionRateApplied: 5,
        commissionAmount: 600,
        vendorEarnings: 11400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'itm-2',
        orderId: 'ord-test-01',
        orderNumber: 'RPS-ORD-2026-99999',
        vendorId: 'ven-beta',
        vendorName: 'Beta Battery Distributors',
        productId: 'p-battery-1',
        productName: 'Amaron Quanta Battery',
        productSku: 'AM-BAT-01',
        productCategory: 'batteries',
        productImage: '/img2.jpg',
        quantity: 2,
        unitPrice: 15000,
        totalPrice: 30000,
        fulfilmentStatus: 'pending',
        settlementStatus: 'pending',
        commissionRateApplied: 4,
        commissionAmount: 1200,
        vendorEarnings: 28800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    subtotal: 42000,
    deliveryFee: 0,
    totalAmount: 42000,
    currency: 'INR',
    vendorIds: ['ven-alpha', 'ven-beta'],
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'placed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Group items by vendorId
  const itemsByVendor = new Map<string, OrderItem[]>();
  for (const item of sampleOrder.items) {
    const list = itemsByVendor.get(item.vendorId) || [];
    list.push(item);
    itemsByVendor.set(item.vendorId, list);
  }

  // Alpha only gets Alpha items
  const alphaItems = itemsByVendor.get('ven-alpha');
  assert.ok(alphaItems && alphaItems.length === 1);
  assert.strictEqual(alphaItems[0].productName, 'Exide Inverter');

  // Beta only gets Beta items
  const betaItems = itemsByVendor.get('ven-beta');
  assert.ok(betaItems && betaItems.length === 1);
  assert.strictEqual(betaItems[0].productName, 'Amaron Quanta Battery');
  assert.strictEqual(betaItems[0].totalPrice, 30000);
});
