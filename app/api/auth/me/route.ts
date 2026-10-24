import { NextResponse } from 'next/server';
import { getSessionDetails } from '@/lib/auth/server-guard';
import { getPlatformSettings } from '@/lib/db/data-store';

export async function GET(request: Request) {
  const session = await getSessionDetails(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const { user, exp, expiresAt } = session;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = exp ? Math.max(0, exp - nowSeconds) : undefined;

  let sessionTimeoutMinutes = 15;
  if (user.role === 'admin' || user.role === 'super_admin') {
    const settings = await getPlatformSettings();
    sessionTimeoutMinutes = settings.adminSessionTimeoutMinutes || 15;
  }

  return NextResponse.json({
    authenticated: true,
    user,
    expiresAt,
    exp,
    remainingSeconds,
    sessionTimeoutMinutes,
  });
}
