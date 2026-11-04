import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import {
  listClientProjects,
  createClientProjectRecord,
  updateClientProjectRecord,
  deleteClientProjectRecord,
  findClientProjectById,
} from '@/lib/db/data-store';
import { ClientProject } from '@/types/client-project';

/**
 * GET: Admin view of all client projects
 */
export async function GET(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const projects = await listClientProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to retrieve client projects' }, { status: 500 });
  }
}

/**
 * POST: Create a new client / customer project (Admin Only)
 */
export async function POST(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const body = await request.json();

    const {
      clientName,
      sector,
      location,
      systemInstalled,
      scopeDescription,
      completionYear,
      imageUrl,
      rating,
      testimonial,
      isFeatured,
    } = body;

    if (!clientName?.trim() || !sector || !systemInstalled?.trim()) {
      return NextResponse.json(
        { error: 'Client name, sector, and system installed description are required.' },
        { status: 400 }
      );
    }

    const newProject = await createClientProjectRecord({
      clientName: clientName.trim(),
      sector,
      location: (location || 'Secunderabad / Hyderabad').trim(),
      systemInstalled: systemInstalled.trim(),
      scopeDescription: (scopeDescription || '').trim(),
      completionYear: completionYear?.trim() || String(new Date().getFullYear()),
      imageUrl: imageUrl?.trim() || '/products/bpe-online-ups-hq.png',
      rating: Number(rating) || 5,
      testimonial: testimonial?.trim() || undefined,
      isFeatured: isFeatured ?? true,
    });

    return NextResponse.json({
      success: true,
      message: `Client project "${newProject.clientName}" registered successfully`,
      project: newProject,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Failed to create client project:', error);
    return NextResponse.json({ error: 'Failed to create client project' }, { status: 500 });
  }
}

/**
 * PUT: Update an existing client project (Admin Only)
 */
export async function PUT(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client project ID is required' }, { status: 400 });
    }

    const existing = await findClientProjectById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Client project not found' }, { status: 404 });
    }

    const updated = await updateClientProjectRecord(id, updates);
    return NextResponse.json({
      success: true,
      message: 'Client project updated successfully',
      project: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Failed to update client project:', error);
    return NextResponse.json({ error: 'Failed to update client project' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a client project (Admin Only)
 */
export async function DELETE(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client project ID is required' }, { status: 400 });
    }

    const success = await deleteClientProjectRecord(id);
    if (!success) {
      return NextResponse.json({ error: 'Client project not found or deletion failed' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Client project deleted successfully',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Failed to delete client project:', error);
    return NextResponse.json({ error: 'Failed to delete client project' }, { status: 500 });
  }
}

