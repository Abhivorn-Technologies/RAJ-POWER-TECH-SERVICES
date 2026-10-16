import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import {
  listCertifications,
  createCertificationRecord,
  updateCertificationRecord,
  deleteCertificationRecord,
  findCertificationById,
} from '@/lib/db/data-store';
import { Certification } from '@/types/certification';

/**
 * GET: Admin view of all certifications (published & unpublished)
 */
export async function GET(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const certifications = await listCertifications(false);
    return NextResponse.json({ success: true, certifications });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve certifications' }, { status: 500 });
  }
}

/**
 * POST: Create a new certification record (Admin Only)
 */
export async function POST(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const body = await request.json();

    const {
      title,
      issuingAuthority,
      certificateNumber,
      description,
      categoryScope,
      validFrom,
      validUntil,
      status,
      isPublished,
      imageUrl,
      notes,
    } = body;

    if (!title || !issuingAuthority || !certificateNumber || !validFrom) {
      return NextResponse.json(
        { error: 'Title, issuing authority, certificate number, and validFrom date are required.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = `cert-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newCert: Certification = {
      id,
      title: title.trim(),
      issuingAuthority: issuingAuthority.trim(),
      certificateNumber: certificateNumber.trim(),
      description: description?.trim() || undefined,
      categoryScope: categoryScope?.trim() || 'General Power Backup Standards',
      validFrom,
      validUntil: validUntil || undefined,
      status: status || 'active',
      isPublished: isPublished !== false,
      imageUrl: imageUrl?.trim() || '/images/cert-iso.jpg',
      notes: notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const created = await createCertificationRecord(newCert);
    return NextResponse.json({ success: true, certification: created }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to create certification' }, { status: 500 });
  }
}

/**
 * PATCH: Update or toggle publish state of an existing certification
 */
export async function PATCH(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Certification id is required' }, { status: 400 });
    }

    const existing = await findCertificationById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    const updated = await updateCertificationRecord(id, updates);
    return NextResponse.json({ success: true, certification: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update certification' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a certification record (Admin Only with confirmation)
 */
export async function DELETE(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Certification id is required' }, { status: 400 });
    }

    const deleted = await deleteCertificationRecord(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Certification not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Certification deleted successfully' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to delete certification' }, { status: 500 });
  }
}
