import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/server-guard';
import { listQuotations, createQuotationRecord, updateQuotationStatus, findProductById, saveOrderNotification } from '@/lib/db/data-store';
import { QuotationRequest, QuotationStatus } from '@/types/quotation';
import { OrderNotificationEvent } from '@/types/notification';

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
    } else if (user.role !== 'super_admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
      companyName,
      gstin,
      quantity,
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
      companyName: companyName?.trim(),
      gstin: gstin?.trim(),
      quantity: quantity ? Number(quantity) : 1,
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
          note: companyName
            ? `Commercial quotation inquiry requested by ${companyName.trim()} (${customerName.trim()}).`
            : `Product quotation inquiry requested by ${customerName.trim()}.`,
          updatedBy: 'customer',
          updatedByName: customerName.trim(),
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const created = await createQuotationRecord(newQuotation);

    // Notify assigned vendors of new customer quotation enquiry
    for (const vId of assignedVendorIds) {
      try {
        const notif: OrderNotificationEvent = {
          id: `notif-qt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          orderId: created.id,
          orderNumber: created.quotationNumber,
          recipientType: 'vendor',
          recipientId: vId,
          recipientName: 'Vendor',
          recipientPhone: created.customerPhone,
          recipientEmail: created.customerEmail,
          eventType: 'quotation_requested',
          title: `New Quotation Request: ${created.quotationNumber}`,
          message: `Customer ${created.customerName} in ${created.cityOrDistrict} requested a power backup quote for ${created.category.toUpperCase()}${created.estimatedRunningWatts ? ` (${created.estimatedRunningWatts}W)` : ''}.`,
          payload: {
            orderNumber: created.quotationNumber,
            itemCount: 1,
            items: [
              {
                productId: created.productId || 'custom',
                productName: created.productName || `${created.category.toUpperCase()} Custom Solution`,
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
              },
            ],
            deliveryCity: created.cityOrDistrict,
            deliveryDistrict: created.cityOrDistrict,
            deliveryPincode: '',
            customerName: created.customerName,
          },
          channel: 'in_app',
          status: 'delivered',
          createdAt: now,
        };
        await saveOrderNotification(notif);
      } catch (err) {
        console.error('Failed to stage quotation notification for vendor', vId, err);
      }
    }

    // Also notify Super Admin so admin dashboard stays synchronized
    try {
      const adminNotif: OrderNotificationEvent = {
        id: `notif-qt-admin-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        orderId: created.id,
        orderNumber: created.quotationNumber,
        recipientType: 'admin',
        recipientId: 'admin',
        recipientName: 'Super Admin',
        recipientPhone: created.customerPhone,
        recipientEmail: created.customerEmail,
        eventType: 'quotation_requested',
        title: `New Quotation Request: ${created.quotationNumber}`,
        message: `Customer ${created.customerName} in ${created.cityOrDistrict} requested a quotation for ${created.category.toUpperCase()}${created.estimatedRunningWatts ? ` (${created.estimatedRunningWatts}W)` : ''}. Assigned vendors: ${assignedVendorIds.join(', ')}.`,
        payload: {
          orderNumber: created.quotationNumber,
          itemCount: 1,
          items: [
            {
              productId: created.productId || 'custom',
              productName: created.productName || `${created.category.toUpperCase()} Custom Solution`,
              quantity: 1,
              unitPrice: 0,
              totalPrice: 0,
            },
          ],
          deliveryCity: created.cityOrDistrict,
          deliveryDistrict: created.cityOrDistrict,
          deliveryPincode: '',
          customerName: created.customerName,
        },
        channel: 'in_app',
        status: 'delivered',
        createdAt: now,
      };
      await saveOrderNotification(adminNotif);
    } catch (err) {
      console.error('Failed to stage quotation notification for super admin', err);
    }

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
    const {
      quotationId,
      status,
      note,
      quotedAmount,
      unitPrice,
      subtotal,
      gstPercent,
      gstAmount,
      deliveryCharges,
      installationCharges,
      paymentTerms,
      warrantyTerms,
      deliveryLeadTime,
      validUntil,
      validityDays,
      quotedDetails,
    } = body;

    if (!quotationId || !status) {
      return NextResponse.json({ error: 'quotationId and status are required' }, { status: 400 });
    }

    const commercialDetails: Partial<QuotationRequest> = {};
    if (unitPrice !== undefined) commercialDetails.unitPrice = Number(unitPrice);
    if (subtotal !== undefined) commercialDetails.subtotal = Number(subtotal);
    if (gstPercent !== undefined) commercialDetails.gstPercent = Number(gstPercent);
    if (gstAmount !== undefined) commercialDetails.gstAmount = Number(gstAmount);
    if (deliveryCharges !== undefined) commercialDetails.deliveryCharges = Number(deliveryCharges);
    if (installationCharges !== undefined) commercialDetails.installationCharges = Number(installationCharges);
    if (paymentTerms) commercialDetails.paymentTerms = paymentTerms.trim();
    if (warrantyTerms) commercialDetails.warrantyTerms = warrantyTerms.trim();
    if (deliveryLeadTime) commercialDetails.deliveryLeadTime = deliveryLeadTime.trim();
    if (validUntil) commercialDetails.validUntil = validUntil;
    if (validityDays !== undefined) commercialDetails.validityDays = Number(validityDays);
    if (quotedDetails) commercialDetails.quotedDetails = quotedDetails.trim();

    const updated = await updateQuotationStatus(
      quotationId,
      status as QuotationStatus,
      note || `Status updated to ${status}`,
      user.userId,
      user.name,
      quotedAmount !== undefined ? Number(quotedAmount) : undefined,
      commercialDetails
    );

    if (!updated) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Notify Super Admin of quotation update / vendor quote submission
    try {
      const updateNotif: OrderNotificationEvent = {
        id: `notif-qt-upd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        orderId: updated.id,
        orderNumber: updated.quotationNumber,
        recipientType: 'admin',
        recipientId: 'admin',
        recipientName: 'Super Admin',
        recipientPhone: updated.customerPhone,
        recipientEmail: updated.customerEmail,
        eventType: 'quotation_updated',
        title: `Quotation ${updated.quotationNumber} Updated: ${status.toUpperCase()}`,
        message: `${user.name} marked quotation #${updated.quotationNumber} as "${status.toUpperCase()}"${quotedAmount !== undefined ? ` with quote price ₹${Number(quotedAmount).toLocaleString('en-IN')}` : ''}.`,
        payload: {
          orderNumber: updated.quotationNumber,
          itemCount: 1,
          items: [
            {
              productId: updated.productId || 'custom',
              productName: updated.productName || `${updated.category.toUpperCase()} Custom Solution`,
              quantity: 1,
              unitPrice: quotedAmount !== undefined ? Number(quotedAmount) : 0,
              totalPrice: quotedAmount !== undefined ? Number(quotedAmount) : 0,
            },
          ],
          totalVendorAmount: quotedAmount !== undefined ? Number(quotedAmount) : 0,
          customerName: updated.customerName,
          deliveryCity: updated.cityOrDistrict,
          deliveryDistrict: updated.cityOrDistrict,
          deliveryPincode: '',
        },
        channel: 'in_app',
        status: 'delivered',
        createdAt: new Date().toISOString(),
      };
      await saveOrderNotification(updateNotif);
    } catch (err) {
      console.error('Failed to notify admin on quotation update', err);
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
