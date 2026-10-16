import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/server-guard';
import { updateUser } from '@/lib/db/data-store';
import { hashPassword } from '@/lib/auth/password';

/**
 * POST: Change password (used when vendor is prompted to set permanent password upon first login)
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized: Vendor session required' }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    const updated = await updateUser(user.userId, {
      passwordHash,
      requiresPasswordChange: false,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your permanent password has been successfully established. Welcome to your Vendor Portal!',
      user: updated,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Password update failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
