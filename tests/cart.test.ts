import test from 'node:test';
import assert from 'node:assert/strict';
import { getCartTotalItems, getCartSubtotal, getGuestCart, saveGuestCart, CartItem } from '../lib/cart-store';

test('CART: getCartTotalItems correctly calculates sum of quantities', () => {
  const items: CartItem[] = [
    { productId: 'p1', name: 'Inverter 1', price: 8500, image: '', category: 'inverters', vendorId: 'v1', vendorName: 'V1', quantity: 2, stock: 10 },
    { productId: 'p2', name: 'Battery 1', price: 14500, image: '', category: 'batteries', vendorId: 'v1', vendorName: 'V1', quantity: 3, stock: 5 },
    { productId: 'p3', name: 'UPS 1', price: 4200, image: '', category: 'ups', vendorId: 'v2', vendorName: 'V2', quantity: 1, stock: 8 },
  ];

  const totalQuantity = getCartTotalItems(items);
  assert.strictEqual(totalQuantity, 6, 'Total quantity should be 2 + 3 + 1 = 6');
});

test('CART: getCartTotalItems with empty cart', () => {
  assert.strictEqual(getCartTotalItems([]), 0);
});

test('CART: getCartSubtotal correctly calculates price * quantity for all items', () => {
  const items: CartItem[] = [
    { productId: 'p1', name: 'Inverter 1', price: 8500, image: '', category: 'inverters', vendorId: 'v1', vendorName: 'V1', quantity: 2, stock: 10 }, // 17000
    { productId: 'p2', name: 'Battery 1', price: 14500, image: '', category: 'batteries', vendorId: 'v1', vendorName: 'V1', quantity: 3, stock: 5 }, // 43500
    { productId: 'p3', name: 'UPS 1', price: 4200, image: '', category: 'ups', vendorId: 'v2', vendorName: 'V2', quantity: 1, stock: 8 }, // 4200
  ];

  const subtotal = getCartSubtotal(items);
  assert.strictEqual(subtotal, 17000 + 43500 + 4200, 'Subtotal should be 64,700');
});

test('CART: getCartSubtotal with empty cart', () => {
  assert.strictEqual(getCartSubtotal([]), 0);
});

test('CART: SSR safety (Node environment without window)', () => {
  // Verifies that getGuestCart and saveGuestCart do not throw in Server-Side Rendering context
  assert.strictEqual(typeof window, 'undefined');
  assert.deepStrictEqual(getGuestCart(), []);
  
  // Should execute cleanly without error
  assert.doesNotThrow(() => {
    saveGuestCart([]);
  });
});
