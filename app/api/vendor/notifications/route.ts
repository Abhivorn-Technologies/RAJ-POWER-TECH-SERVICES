import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth/server-guard';
import { listOrderNotifications } from '@/lib/db/data-store';

export async function GET(request: Request) {
  try {
    const user = await requireRole(['vendor'], request);
    if (!user.vendorId) {
      return NextResponse.json({ error: 'Vendor ID missing from session' }, { status: 403 });
    }
    const notifications = await listOrderNotifications({
      vendorId: user.vendorId,
      recipientType: 'vendor',
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Unauthorized vendor access';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

