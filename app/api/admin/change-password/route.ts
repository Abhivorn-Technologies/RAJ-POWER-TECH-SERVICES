import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth/server-guard';
import { updateUser, findUserByEmail } from '@/lib/db/data-store';
import { hashPassword, comparePassword } from '@/lib/auth/password';

/**
 * POST: Change password for logged-in Administrator or Super Admin
 */
export async function POST(request: Request) {
  try {
    const session = await requireRole(['admin', 'super_admin'], request);
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    const fullUser = await findUserByEmail(session.email);
    if (!fullUser) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    if (currentPassword) {
      const isValid = await comparePassword(currentPassword, fullUser.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    }

    const newHash = await hashPassword(newPassword);
    const updated = await updateUser(fullUser.id, {
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Super Admin password updated successfully',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Password update failed' }, { status: 500 });
  }
}
