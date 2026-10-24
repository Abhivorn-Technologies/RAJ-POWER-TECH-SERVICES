import { NextResponse } from 'next/server';
import { AUTHENTIC_CERTIFICATIONS } from '@/lib/certifications-data';

/**
 * GET: Public gallery of verified RPS power equipment certifications.
 * Features ultra-fast response with edge caching and 2s DB timeout failover.
 */
export async function GET() {
  const publishedFallback = AUTHENTIC_CERTIFICATIONS.filter((c) => c.isPublished);

  try {
    const { listCertifications } = await import('@/lib/db/data-store');

    // 2-second failover timeout so API never hangs
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 2000)
    );

    const certifications = await Promise.race([
      listCertifications(true),
      timeoutPromise,
    ]);

    return NextResponse.json(
      { success: true, certifications },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.warn('[Certifications API] Fast failover to authentic certifications:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: true, certifications: publishedFallback },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }
}
