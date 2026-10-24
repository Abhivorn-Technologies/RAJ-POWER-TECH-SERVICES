import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionDetails } from '@/lib/auth/server-guard';
import { signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';
import { getPlatformSettings } from '@/lib/db/data-store';

export async function POST(request: Request) {
  try {
    const session = await getSessionDetails(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid. Please sign in again.' },
        { status: 401 }
      );
    }

    const { user } = session;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isVendor = user.role === 'vendor';

    let tokenExpiry = '7d';
    let cookieMaxAgeSeconds = 60 * 60 * 24 * 7;
    let sessionTimeoutMinutes = 15;

    if (isAdmin) {
      const settings = await getPlatformSettings();
      sessionTimeoutMinutes =
        settings.adminSessionTimeoutMinutes && settings.adminSessionTimeoutMinutes > 0
          ? settings.adminSessionTimeoutMinutes
          : 15;
      tokenExpiry = `${sessionTimeoutMinutes}m`;
      cookieMaxAgeSeconds = sessionTimeoutMinutes * 60;
    } else if (isVendor) {
      sessionTimeoutMinutes = 60 * 24;
      tokenExpiry = '24h';
      cookieMaxAgeSeconds = 60 * 60 * 24;
    }

    const newToken = signAuthToken(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions || [],
        vendorId: user.vendorId,
      },
      tokenExpiry
    );

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(isAdmin ? {} : { maxAge: cookieMaxAgeSeconds }),
    });

    const expiresAt = new Date(Date.now() + cookieMaxAgeSeconds * 1000).toISOString();

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      expiresAt,
      sessionTimeoutMinutes,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to refresh session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
