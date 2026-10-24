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
  } catch (error) {
    console.warn('[Categories API] Failed to retrieve categories from database, returning default solutions:', error);
    const defaultCategories: SolutionCategoryItem[] = [
      {
        id: 'inverters',
        name: 'Inverters',
        slug: 'inverters',
        description: 'Pure sine wave home & commercial inverters engineered for dependable continuous power during outages.',
        features: ['Pure Sine Wave Output', 'Smart Battery Management', 'Overload & Short Circuit Protection'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'batteries',
        name: 'Batteries',
        slug: 'batteries',
        description: 'High-cycle tubular & SMF inverter batteries built for severe climate conditions and deep discharge longevity.',
        features: ['Tall Tubular Heavy Duty Plates', 'Ultra Low Maintenance', 'Fast Recharge Technology'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ups',
        name: 'UPS Systems',
        slug: 'ups',
        description: 'Zero-transfer line-interactive & online UPS systems safeguarding critical computers, servers, and medical equipment.',
        features: ['Zero Transfer Switching Time', 'Voltage Spike Suppression', 'Generator Compatibility'],
        createdAt: new Date().toISOString(),
      },
    ];
    return NextResponse.json({ success: true, categories: defaultCategories });
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
