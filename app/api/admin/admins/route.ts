import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth/server-guard';
import { listAdminUsers, createUser, updateUser, findUserByEmail } from '@/lib/db/data-store';
import { hashPassword } from '@/lib/auth/password';
import { UserWithCredentials, AdminPermission } from '@/types/auth';

/**
 * GET: List all Admins and Super Admins (Super Admin only)
 */
export async function GET(request: Request) {
  try {
    await requireRole(['admin', 'super_admin'], request);
    const admins = await listAdminUsers();
    return NextResponse.json({ success: true, admins });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve admins' }, { status: 500 });
  }
}

/**
 * POST: Create an Admin account with specific permissions (Super Admin only)
 */
export async function POST(request: Request) {
  try {
    await requireRole(['admin', 'super_admin'], request);
    const body = await request.json();

    const { email, name, password, permissions, status } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: `User with email ${email} already exists` },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newAdmin: UserWithCredentials = {
      id: `usr-adm-${Date.now().toString(36)}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: 'admin',
      status: status || 'active',
      permissions: Array.isArray(permissions) ? permissions : [],
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createUser(newAdmin);
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: created,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

/**
 * PATCH: Assign or revoke Admin permissions (Super Admin only)
 */
export async function PATCH(request: Request) {
  try {
    await requireRole(['admin', 'super_admin'], request);
    const body = await request.json();
    const { userId, permissions, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updates: Partial<UserWithCredentials> = {};
    if (Array.isArray(permissions)) {
      updates.permissions = permissions as AdminPermission[];
    }
    if (status && ['active', 'suspended'].includes(status)) {
      updates.status = status;
    }

    const updated = await updateUser(userId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin permissions updated successfully',
      admin: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update admin permissions' }, { status: 500 });
  }
}
