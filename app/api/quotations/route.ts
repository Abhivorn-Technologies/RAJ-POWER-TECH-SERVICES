import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/server-guard';
import { listQuotations, createQuotationRecord, updateQuotationStatus, findProductById } from '@/lib/db/data-store';
import { QuotationRequest, QuotationStatus } from '@/types/quotation';

/**
 * GET: List quotations.
 * Vendor sees ONLY quotations where assignedVendorIds contains their vendorId.
 * Admin with manage_quotations sees all.
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    let filter: { vendorId?: string } | undefined;

    if (user.role === 'vendor') {
      if (!user.vendorId) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 400 });
      }
      filter = { vendorId: user.vendorId };
    } else if (user.role === 'admin') {
      if (!user.permissions.includes('manage_quotations')) {
        return NextResponse.json({ error: 'Missing manage_quotations permission' }, { status: 403 });
      }
    }

    const quotations = await listQuotations(filter);
    return NextResponse.json({ success: true, quotations });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve quotations' }, { status: 500 });
  }
}

/**
 * POST: Submit a new quotation inquiry
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      cityOrDistrict,
      fullAddress,
      category,
      productId,
      estimatedRunningWatts,
      expectedBackupHours,
      notes,
    } = body;

    if (!customerName || !customerPhone || !cityOrDistrict || !category) {
      return NextResponse.json(
        { error: 'customerName, customerPhone, cityOrDistrict, and category are required' },
        { status: 400 }
      );
    }

    const quotationNumber = `RPS-QT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `qt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const assignedVendorIds: string[] = [];
    let productName: string | undefined;
    let targetedVendorId: string | undefined;

    if (productId) {
      const prod = await findProductById(productId);
      if (prod) {
        productName = prod.name;
        if (prod.vendorId) {
          targetedVendorId = prod.vendorId;
          assignedVendorIds.push(prod.vendorId);
        }
      }
    }

    // By default, include primary RPS vendor
    if (!assignedVendorIds.includes('ven-rps-primary')) {
      assignedVendorIds.push('ven-rps-primary');
    }

    const newQuotation: QuotationRequest = {
      id,
      quotationNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim(),
      cityOrDistrict: cityOrDistrict.trim(),
      fullAddress: fullAddress?.trim(),
      category,
      productId,
      productName,
      targetedVendorId,
      assignedVendorIds,
      estimatedRunningWatts: estimatedRunningWatts ? Number(estimatedRunningWatts) : undefined,
      expectedBackupHours: expectedBackupHours ? Number(expectedBackupHours) : undefined,
      notes: notes?.trim(),
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          note: 'Quotation request submitted by customer.',
          updatedBy: 'customer',
          updatedByName: customerName.trim(),
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const created = await createQuotationRecord(newQuotation);

    return NextResponse.json({
      success: true,
      message: 'Quotation inquiry registered successfully',
      quotation: created,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register quotation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH: Update quotation status or provide quoted pricing
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { quotationId, status, note, quotedAmount } = body;

    if (!quotationId || !status) {
      return NextResponse.json({ error: 'quotationId and status are required' }, { status: 400 });
    }

    const updated = await updateQuotationStatus(
      quotationId,
      status as QuotationStatus,
      note || `Status updated to ${status}`,
      user.userId,
      user.name,
      quotedAmount !== undefined ? Number(quotedAmount) : undefined
    );

    if (!updated) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation status updated successfully',
      quotation: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}
