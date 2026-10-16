import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import {
  listVendors,
  createVendorRecord,
  updateVendorStatus,
  updateVendorRecord,
  deleteVendorRecord,
  createUser,
  findUserByEmail,
} from '@/lib/db/data-store';
import { hashPassword } from '@/lib/auth/password';
import { Vendor, VendorStatus } from '@/types/vendor';
import { UserWithCredentials } from '@/types/auth';

/**
 * GET: List all vendors (Requires manage_vendors permission or Super Admin)
 */
export async function GET(request: Request) {
  try {
    await requireAdminPermission('manage_vendors', request);
    const vendors = await listVendors();
    return NextResponse.json({ success: true, vendors });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve vendors' }, { status: 500 });
  }
}

/**
 * POST: Create a new Vendor Account and initial login user.
 * Public registration is strictly disallowed.
 */
export async function POST(request: Request) {
  try {
    await requireAdminPermission('manage_vendors', request);
    const body = await request.json();

    const {
      businessName,
      tradeName,
      registrationNumber,
      contactPerson,
      email,
      phone,
      whatsapp,
      address,
      commissionRate,
      password,
      allowedCategories,
    } = body;

    // Strict validation
    if (!businessName || !contactPerson || !email || !phone || !address || !password) {
      return NextResponse.json(
        { error: 'Missing required vendor fields: businessName, contactPerson, email, phone, address, and password' },
        { status: 400 }
      );
    }

    // Commission percentage validation: must be explicitly specified by Super Admin (0 to 100)
    if (commissionRate === undefined || commissionRate === null || commissionRate === '' || isNaN(Number(commissionRate))) {
      return NextResponse.json(
        { error: 'Commission rate percentage is required (enter 0 for 0% commission)' },
        { status: 400 }
      );
    }

    const numCommission = Number(commissionRate);
    if (numCommission < 0 || numCommission > 100) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0% and 100%' },
        { status: 400 }
      );
    }

    if (!address.city || !address.state || !address.pincode) {
      return NextResponse.json(
        { error: 'Complete address with city, state, and pincode is required' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: `User with email ${email} is already registered` },
        { status: 409 }
      );
    }

    const vendorId = `ven-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Create Vendor Record with assigned solutions/categories and explicit commission rate
    const newVendor: Vendor = {
      id: vendorId,
      businessName: businessName.trim(),
      tradeName: tradeName?.trim(),
      registrationNumber: registrationNumber?.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      whatsapp: whatsapp?.trim() || phone.trim(),
      address: {
        line1: address.line1?.trim() || '',
        line2: address.line2?.trim() || '',
        city: address.city.trim(),
        district: address.district?.trim() || address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      },
      status: 'active',
      commissionRate: numCommission,
      allowedCategories: Array.isArray(allowedCategories) && allowedCategories.length > 0 ? allowedCategories : ['inverters', 'batteries', 'ups'],
      createdAt: now,
      updatedAt: now,
    };

    await createVendorRecord(newVendor);

    // Hash initial password securely
    const passwordHash = await hashPassword(password);

    // Create linked Vendor User with forced password reset flag on first login
    const userId = `usr-ven-${Date.now().toString(36)}`;
    const newVendorUser: UserWithCredentials = {
      id: userId,
      email: email.trim().toLowerCase(),
      name: contactPerson.trim(),
      role: 'vendor',
      status: 'active',
      vendorId: newVendor.id,
      passwordHash,
      requiresPasswordChange: true, // Forces vendor to set permanent password on first login
      createdAt: now,
      updatedAt: now,
    };

    await createUser(newVendorUser);

    return NextResponse.json({
      success: true,
      message: 'Vendor account successfully created. Initial login credentials dispatched to vendor.',
      vendor: newVendor,
      credentials: {
        loginEmail: newVendor.email,
        temporaryPassword: password,
        loginUrl: '/vendor/login',
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Failed to create vendor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH: Update Vendor status ('active' | 'inactive' | 'suspended' | 'blocked'), commissionRate, or allowedCategories
 */
export async function PATCH(request: Request) {
  try {
    await requireAdminPermission('manage_vendors', request);
    const body = await request.json();
    const { vendorId, status, commissionRate, allowedCategories } = body;

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }

    const updates: Partial<Vendor> = {};

    if (status !== undefined) {
      const validStatuses: VendorStatus[] = ['active', 'inactive', 'suspended', 'blocked'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status must be one of: "active" | "inactive" | "suspended" | "blocked"' },
          { status: 400 }
        );
      }
      await updateVendorStatus(vendorId, status);
      updates.status = status;
    }

    if (commissionRate !== undefined && commissionRate !== null && commissionRate !== '') {
      const numCommission = Number(commissionRate);
      if (isNaN(numCommission) || numCommission < 0 || numCommission > 100) {
        return NextResponse.json(
          { error: 'Commission rate must be a valid number between 0% and 100%' },
          { status: 400 }
        );
      }
      updates.commissionRate = numCommission;
    }

    if (allowedCategories !== undefined) {
      if (!Array.isArray(allowedCategories) || allowedCategories.length === 0) {
        return NextResponse.json(
          { error: 'At least one authorized category must be assigned to vendor' },
          { status: 400 }
        );
      }
      updates.allowedCategories = allowedCategories;
    }

    const updated = await updateVendorRecord(vendorId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a Vendor record and their login credentials
 */
export async function DELETE(request: Request) {
  try {
    await requireAdminPermission('manage_vendors', request);
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }

    const success = await deleteVendorRecord(vendorId);
    if (!success) {
      return NextResponse.json({ error: 'Vendor deletion failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor account and credentials successfully deleted',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
