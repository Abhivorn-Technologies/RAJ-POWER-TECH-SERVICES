import { NextResponse } from 'next/server';
import { listCategories } from '@/lib/db/data-store';

/**
 * GET /api/categories
 * Returns active store categories dynamically from the database for header navigation and storefront browsing.
 */
export async function GET(request: Request) {
  try {
    const dbCategories = await listCategories();

    const links: Array<{ label: string; slug: string; href: string; description?: string }> = [
      {
        label: 'All Solutions & Products',
        slug: 'all',
        href: '/shop',
        description: 'Complete equipment lineup, combos, and custom capacity sizing',
      },
    ];

    // Dynamically map every category from the database
    for (const cat of dbCategories) {
      const slug = cat.slug || cat.id;
      if (slug !== 'all') {
        links.push({
          label: cat.name,
          slug: slug,
          href: `/categories/${slug}`,
          description: cat.description || `${cat.name} power backup and energy solutions`,
        });
      }
    }

    return NextResponse.json(
      { success: true, solutions: links },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('Failed to load dynamic solutions categories:', err);
    return NextResponse.json({ success: false, solutions: [] }, { status: 500 });
  }
}
