import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isHyderabadPincode,
  resolvePincodeServiceability,
  STANDARD_UNSERVICEABLE_MESSAGE,
} from '../lib/pincodes';
import { PlatformSettings } from '../types/settings';

const mockSettings: PlatformSettings = {
  id: 'platform_config',
  defaultVendorCommissionPercent: 5.0,
  platformProcessingFeePercent: 1.5,
  flatDeliveryFeeINR: 0,
  minimumOrderValueForFreeDeliveryINR: 0,
  eligiblePincodes: [
    { pincode: '500009', district: 'Secunderabad', state: 'Telangana', deliveryFeeINR: 0, active: true, notes: 'RPS HQ' },
    { pincode: '500081', district: 'Rangareddy', state: 'Telangana', deliveryFeeINR: 0, active: true, notes: 'Hitec City' },
    { pincode: '500999', district: 'Custom Restricted', state: 'Telangana', deliveryFeeINR: 500, active: false, notes: 'Temporarily inactive' },
  ],
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

test('PINCODES: isHyderabadPincode correctly identifies core Hyderabad & Secunderabad codes', () => {
  // Core valid postal codes
  assert.strictEqual(isHyderabadPincode('500001'), true); // Abids / GPO
  assert.strictEqual(isHyderabadPincode('500003'), true); // Secunderabad
  assert.strictEqual(isHyderabadPincode('500009'), true); // Secunderabad - Picket
  assert.strictEqual(isHyderabadPincode('500016'), true); // Begumpet
  assert.strictEqual(isHyderabadPincode('500034'), true); // Banjara Hills
  assert.strictEqual(isHyderabadPincode('500072'), true); // Kukatpally
  assert.strictEqual(isHyderabadPincode('500081'), true); // Madhapur / Hitec City
  assert.strictEqual(isHyderabadPincode('500125'), true); // Upper bound of GHMC core division
});

test('PINCODES: isHyderabadPincode correctly identifies peripheral GHMC areas', () => {
  assert.strictEqual(isHyderabadPincode('501218'), true); // Shamshabad / RGIA Airport
  assert.strictEqual(isHyderabadPincode('501301'), true); // Ghatkesar
  assert.strictEqual(isHyderabadPincode('501401'), true); // Medchal
  assert.strictEqual(isHyderabadPincode('501504'), true); // Maheshwaram
  assert.strictEqual(isHyderabadPincode('501505'), true); // Hayathnagar
  assert.strictEqual(isHyderabadPincode('501506'), true); // Ibrahimpatnam
  assert.strictEqual(isHyderabadPincode('501510'), true); // Shankarpally
  assert.strictEqual(isHyderabadPincode('501511'), true); // Chevella
});

test('PINCODES: isHyderabadPincode rejects non-Hyderabad and out-of-state pincodes', () => {
  assert.strictEqual(isHyderabadPincode('110001'), false); // New Delhi
  assert.strictEqual(isHyderabadPincode('400001'), false); // Mumbai
  assert.strictEqual(isHyderabadPincode('560001'), false); // Bengaluru
  assert.strictEqual(isHyderabadPincode('500126'), false); // Beyond 500125 boundary
  assert.strictEqual(isHyderabadPincode('502001'), false); // Sangareddy (out of peripheral set)
});

test('PINCODES: isHyderabadPincode rejects invalid formats safely without throwing', () => {
  assert.strictEqual(isHyderabadPincode(''), false);
  assert.strictEqual(isHyderabadPincode('5000'), false);
  assert.strictEqual(isHyderabadPincode('5000001'), false);
  assert.strictEqual(isHyderabadPincode('ABCDEF'), false);
  assert.strictEqual(isHyderabadPincode('50000A'), false);
  // @ts-expect-error Testing runtime crash resistance for null/undefined
  assert.strictEqual(isHyderabadPincode(null), false);
  // @ts-expect-error Testing runtime crash resistance for undefined
  assert.strictEqual(isHyderabadPincode(undefined), false);
});

test('PINCODES: resolvePincodeServiceability with explicit active platform rule', () => {
  const result = resolvePincodeServiceability('500009', mockSettings);
  assert.strictEqual(result.serviceable, true);
  assert.strictEqual(result.pincode, '500009');
  assert.strictEqual(result.district, 'Secunderabad');
  assert.strictEqual(result.deliveryFee, 0);
  assert.strictEqual(result.notes, 'RPS HQ');
});

test('PINCODES: resolvePincodeServiceability with explicit inactive platform rule', () => {
  const result = resolvePincodeServiceability('500999', mockSettings);
  assert.strictEqual(result.serviceable, false);
  assert.strictEqual(result.pincode, '500999');
  assert.strictEqual(result.message, STANDARD_UNSERVICEABLE_MESSAGE);
});

test('PINCODES: resolvePincodeServiceability for valid GHMC postal code without explicit rule', () => {
  const result = resolvePincodeServiceability('500034', mockSettings); // Banjara Hills
  assert.strictEqual(result.serviceable, true);
  assert.strictEqual(result.district, 'Hyderabad');
  assert.strictEqual(result.deliveryFee, 0);
});

test('PINCODES: resolvePincodeServiceability for unserviceable non-Hyderabad pin', () => {
  const result = resolvePincodeServiceability('400001', mockSettings); // Mumbai
  assert.strictEqual(result.serviceable, false);
  assert.strictEqual(result.message, STANDARD_UNSERVICEABLE_MESSAGE);
});

test('PINCODES: resolvePincodeServiceability handles malformed input cleanly', () => {
  const result = resolvePincodeServiceability('invalid', mockSettings);
  assert.strictEqual(result.serviceable, false);
  assert.ok(result.message?.includes('valid 6-digit'));
});
