import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/db/data-store';

/**
 * GET: Retrieve current platform settings and configurable business policies
 */
export async function GET(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const settings = await getPlatformSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

/**
 * PUT: Update platform commission rates, fee settings, or undecided business policies
 */
export async function PUT(request: Request) {
  try {
    const user = await requireAdminPermission('manage_settings', request);
    const body = await request.json();

    const allowedKeys = [
      'defaultVendorCommissionPercent',
      'platformProcessingFeePercent',
      'flatDeliveryFeeINR',
      'minimumOrderValueForFreeDeliveryINR',
      'settlementPayoutCycleDays',
      'settlementHoldPeriodDays',
      'customerCancellationWindowMinutes',
      'returnWindowDays',
      'allowItemLevelCancellation',
      'customProductAttributes',
      'eligiblePincodes',
      'codEnabled',
      'onlinePaymentEnabled',
      'paymentGatewayProvider',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = await updatePlatformSettings(updates, user.userId);
    return NextResponse.json({
      success: true,
      message: 'Platform policy configuration updated successfully',
      settings: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
