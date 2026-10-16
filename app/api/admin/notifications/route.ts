import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import { listOrderNotifications } from '@/lib/db/data-store';

export async function GET(request: Request) {
  try {
    await requireAdminPermission('manage_orders', request);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId') || undefined;

    const notifications = await listOrderNotifications({ orderId });
    return NextResponse.json({ notifications });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Unauthorized access';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

