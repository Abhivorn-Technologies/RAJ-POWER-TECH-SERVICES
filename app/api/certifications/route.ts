import { NextResponse } from 'next/server';
import { listCertifications } from '@/lib/db/data-store';

/**
 * GET: Public gallery of verified RPS power equipment certifications.
 * Displays published records only.
 */
export async function GET() {
  try {
    const certifications = await listCertifications(true);
    return NextResponse.json({
      success: true,
      certifications,
    });
  } catch (error) {
    console.warn('Database error in listCertifications, falling back to static authentic certifications:', error);
    const { AUTHENTIC_CERTIFICATIONS } = await import('@/lib/db/data-store');
    return NextResponse.json({
      success: true,
      certifications: AUTHENTIC_CERTIFICATIONS.filter((c) => c.isPublished),
    });
  }
}
