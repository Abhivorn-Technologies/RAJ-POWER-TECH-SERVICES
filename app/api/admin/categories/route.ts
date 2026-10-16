import { NextResponse } from 'next/server';
import { requireAdminPermission, AuthError } from '@/lib/auth/server-guard';
import { listCategories, createCategory } from '@/lib/db/data-store';
import { SolutionCategoryItem } from '@/types/product';

/**
 * GET: List all product categories / solutions
 */
export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ success: true, categories });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve categories' }, { status: 500 });
  }
}

/**
 * POST: Create a new Solution / Category (Super Admin only)
 */
export async function POST(request: Request) {
  try {
    await requireAdminPermission('manage_settings', request);
    const body = await request.json();
    const { name, slug, description, features } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Solution / Category name is required' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newCategory: SolutionCategoryItem = {
      id: cleanSlug,
      name: name.trim(),
      slug: cleanSlug,
      description: description?.trim() || `${name.trim()} power engineering solutions for home & commercial use.`,
      features: Array.isArray(features) ? features : [],
      createdAt: new Date().toISOString(),
    };

    await createCategory(newCategory);

    return NextResponse.json({
      success: true,
      message: `Solution "${newCategory.name}" successfully created and available for vendor allocation!`,
      category: newCategory,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
