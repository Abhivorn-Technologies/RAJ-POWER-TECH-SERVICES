import { NextRequest, NextResponse, connection } from 'next/server';
import { listClientProjects } from '@/lib/db/data-store';

export async function GET(request: NextRequest) {
  await connection();
  try {
    const sector = request.nextUrl.searchParams.get('sector') || undefined;
    const featuredOnly = request.nextUrl.searchParams.get('featured') === 'true';

    const projects = await listClientProjects({ sector, featuredOnly });
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    if ((error as any)?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('Failed to retrieve client projects:', error);
    return NextResponse.json({ error: 'Failed to retrieve client projects' }, { status: 500 });
  }
}

