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
    console.error('Failed to list certifications:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve equipment certifications' },
      { status: 500 }
    );
  }
}
