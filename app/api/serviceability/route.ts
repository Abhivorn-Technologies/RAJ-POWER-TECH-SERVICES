import { NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/db/data-store';
import { resolvePincodeServiceability } from '@/lib/pincodes';

/**
 * GET: Check PIN code delivery serviceability and server-controlled delivery charges.
 * Seamlessly accepts all Hyderabad / Secunderabad / GHMC postal codes while returning
 * a professional, neutral delivery-unavailable error message for unserviceable regions.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPincode = searchParams.get('pincode') || '';

    const settings = await getPlatformSettings();
    const resolution = resolvePincodeServiceability(rawPincode, settings);

    if (!resolution.serviceable) {
      return NextResponse.json({
        serviceable: false,
        pincode: resolution.pincode,
        message: resolution.message,
      });
    }

    return NextResponse.json({
      serviceable: true,
      pincode: resolution.pincode,
      district: resolution.district,
      state: resolution.state,
      deliveryFee: resolution.deliveryFee ?? settings.flatDeliveryFeeINR,
      deliveryDays: resolution.deliveryDays || '1-3 Business Days',
      freeDeliveryThreshold: settings.minimumOrderValueForFreeDeliveryINR,
      codEnabled: settings.codEnabled,
      onlinePaymentEnabled: settings.onlinePaymentEnabled,
      notes: resolution.notes,
    });
  } catch (error: unknown) {
    const err = error as { digest?: string; message?: string } | null | undefined;
    if (err?.digest?.startsWith('NEXT_') || err?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Serviceability check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify PIN code serviceability' },
      { status: 500 }
    );
  }
}
