import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserByEmail, findVendorById } from '@/lib/db/data-store';
import { signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact platform administration.' },
        { status: 403 }
      );
    }

    // If vendor user, ensure the vendor organization is not suspended
    if (user.role === 'vendor' && user.vendorId) {
      const vendor = await findVendorById(user.vendorId);
      if (!vendor || vendor.status === 'suspended') {
        return NextResponse.json(
          { error: 'Vendor account is suspended. Access to portal operations is restricted.' },
          { status: 403 }
        );
      }
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Determine session lifetime based on role (Admin vs Vendor)
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isVendor = user.role === 'vendor';
    
    let tokenExpiry = '7d';
    let cookieMaxAgeSeconds = 60 * 60 * 24 * 7; // 7 days
    let sessionTimeoutMinutes: number | undefined;

    if (isAdmin) {
      const { getPlatformSettings } = await import('@/lib/db/data-store');
      const settings = await getPlatformSettings();
      sessionTimeoutMinutes =
        settings.adminSessionTimeoutMinutes && settings.adminSessionTimeoutMinutes > 0
          ? settings.adminSessionTimeoutMinutes
          : 15;
      tokenExpiry = `${sessionTimeoutMinutes}m`;
      cookieMaxAgeSeconds = sessionTimeoutMinutes * 60;
    } else if (isVendor) {
      sessionTimeoutMinutes = 60 * 24; // 24 hours
      tokenExpiry = '24h';
      cookieMaxAgeSeconds = 60 * 60 * 24;
    }

    // Generate JWT with strictly enforced expiration
    const token = signAuthToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions || [],
        vendorId: user.vendorId,
      },
      tokenExpiry
    );

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(isAdmin ? {} : { maxAge: cookieMaxAgeSeconds }),
    });

    const expiresAt = new Date(Date.now() + cookieMaxAgeSeconds * 1000).toISOString();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions || [],
        vendorId: user.vendorId,
      },
      sessionTimeoutMinutes,
      expiresAt,
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
