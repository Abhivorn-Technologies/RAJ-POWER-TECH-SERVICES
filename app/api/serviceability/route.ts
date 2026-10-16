import { NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/db/data-store';

/**
 * GET: Check PIN code delivery serviceability and server-controlled delivery charges.
 * Only configured active PIN codes are serviceable.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPincode = searchParams.get('pincode');

    if (!rawPincode || rawPincode.trim().length !== 6 || !/^\d{6}$/.test(rawPincode.trim())) {
      return NextResponse.json(
        {
          serviceable: false,
          error: 'Please enter a valid 6-digit Indian PIN code.',
        },
        { status: 400 }
      );
    }

    const pincode = rawPincode.trim();
    const settings = await getPlatformSettings();
    const eligibleRules = settings.eligiblePincodes || [];

    const matchedRule = eligibleRules.find(
      (r) => r.pincode === pincode && r.active
    );

    if (!matchedRule) {
      return NextResponse.json({
        serviceable: false,
        pincode,
        message:
          'Delivery is currently unavailable for this PIN code. Enter an eligible delivery PIN code or contact our support team for regional transit arrangements.',
      });
    }

    return NextResponse.json({
      serviceable: true,
      pincode: matchedRule.pincode,
      district: matchedRule.district,
      state: matchedRule.state,
      deliveryFee: matchedRule.deliveryFeeINR ?? settings.flatDeliveryFeeINR,
      freeDeliveryThreshold: settings.minimumOrderValueForFreeDeliveryINR,
      codEnabled: settings.codEnabled,
      onlinePaymentEnabled: settings.onlinePaymentEnabled,
      notes: matchedRule.notes,
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
