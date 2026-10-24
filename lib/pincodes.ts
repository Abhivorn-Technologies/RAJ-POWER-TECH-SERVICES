import { PlatformSettings } from '@/types/settings';

/**
 * Greater Hyderabad Municipal Corporation (GHMC) and metropolitan peripheral postal codes.
 */
export const HYDERABAD_PERIPHERAL_PINCODES = new Set([
  '501218', // Shamshabad / RGIA Airport
  '501301', // Ghatkesar
  '501401', // Medchal
  '501504', // Maheshwaram
  '501505', // Hayathnagar
  '501506', // Ibrahimpatnam
  '501510', // Shankarpally
  '501511', // Chevella
]);

/**
 * Checks whether a 6-digit Indian postal code belongs to the Hyderabad / Secunderabad / GHMC metropolitan region.
 */
export function isHyderabadPincode(pincode: string): boolean {
  if (!pincode || typeof pincode !== 'string') return false;
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) return false;

  // Hyderabad & Secunderabad core postal division covers 500xxx (500001 - 500125)
  if (cleanPin.startsWith('500')) {
    const num = parseInt(cleanPin, 10);
    return num >= 500001 && num <= 500125;
  }

  // Common Greater Hyderabad metropolitan peripheral postal codes
  return HYDERABAD_PERIPHERAL_PINCODES.has(cleanPin);
}

export interface PincodeResolutionResult {
  serviceable: boolean;
  pincode: string;
  district?: string;
  state?: string;
  deliveryFee?: number;
  deliveryDays?: string;
  message?: string;
  notes?: string;
}

/**
 * Standard unserviceable message that maintains a premium brand impression
 * without explicitly advertising geographic limitations.
 */
export const STANDARD_UNSERVICEABLE_MESSAGE =
  'Delivery is currently unavailable for this PIN code. Please enter an eligible delivery PIN code or contact our sales & support team.';

/**
 * Resolves delivery serviceability and server-controlled pricing for a given postal code.
 */
export function resolvePincodeServiceability(
  rawPincode: string,
  settings: PlatformSettings
): PincodeResolutionResult {
  const pincode = (rawPincode || '').trim();

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return {
      serviceable: false,
      pincode,
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  // 1. Check if an explicit active rule is configured by Admin in platform settings
  const rules = settings.eligiblePincodes || [];
  const matchedRule = rules.find((r) => r.pincode === pincode);

  if (matchedRule) {
    if (!matchedRule.active) {
      return {
        serviceable: false,
        pincode,
        message: STANDARD_UNSERVICEABLE_MESSAGE,
      };
    }

    return {
      serviceable: true,
      pincode: matchedRule.pincode,
      district: matchedRule.district || 'Hyderabad Region',
      state: matchedRule.state || 'Telangana',
      deliveryFee: matchedRule.deliveryFeeINR ?? settings.flatDeliveryFeeINR ?? 0,
      deliveryDays: '1-2 Days',
      notes: matchedRule.notes || 'Certified doorstep delivery & installation available',
    };
  }

  // 2. Hyderabad region postal code verification
  if (isHyderabadPincode(pincode)) {
    const num = parseInt(pincode, 10);
    let district = 'Hyderabad';

    if ([500003, 500009, 500011, 500015, 500025, 500026].includes(num)) {
      district = 'Secunderabad';
    } else if (num >= 500081 && num <= 500085) {
      district = 'Cyberabad';
    } else if (num >= 500050 && num <= 500072) {
      district = 'Medchal-Malkajgiri';
    } else if (num >= 500070 && num <= 500079) {
      district = 'Rangareddy';
    }

    return {
      serviceable: true,
      pincode,
      district,
      state: 'Telangana',
      deliveryFee: settings.flatDeliveryFeeINR ?? 0,
      deliveryDays: '1-3 Business Days',
      notes: 'Certified local delivery & technician installation available',
    };
  }

  // 3. Address not serviceable
  return {
    serviceable: false,
    pincode,
    message: STANDARD_UNSERVICEABLE_MESSAGE,
  };
}
