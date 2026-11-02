import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/db/data-store';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { Product } from '@/types/product';
import { getLatestProductPerBrand } from '@/lib/products-helper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;

    // Fetch all products from database repository
    let rawProducts: Product[] = [];
    try {
      rawProducts = await listProducts();
    } catch (e) {
      console.warn('[Products API] listProducts database error, falling back to demo catalog:', e);
      rawProducts = DEMO_FEATURED_PRODUCTS;
    }

    if (!rawProducts || rawProducts.length === 0) {
      rawProducts = DEMO_FEATURED_PRODUCTS;
    }

    // Dynamic brand extraction across all available products
    const brandSet = new Set<string>();
    rawProducts.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brandSet.add(p.brand.trim());
      }
    });
    const availableBrands = Array.from(brandSet).sort();

    // Dynamic category extraction across all available products
    const categoryMap = new Map<string, { id: string; name: string; count: number }>();
    rawProducts.forEach((p) => {
      const catId = p.category || 'other';
      const catName = p.categoryName || catId.charAt(0).toUpperCase() + catId.slice(1);
      const existing = categoryMap.get(catId) || { id: catId, name: catName, count: 0 };
      existing.count += 1;
      categoryMap.set(catId, existing);
    });
    const availableCategories = Array.from(categoryMap.values());

    let allProducts = [...rawProducts];

    // Filter by brand if requested
    if (brand && brand !== 'all') {
      const bLower = brand.toLowerCase();
      allProducts = allProducts.filter((p) => (p.brand || '').toLowerCase() === bLower || (p.brand || '').toLowerCase().includes(bLower));
    }

    // Filter by category if requested
    if (category && category !== 'all') {
      const cLower = category.toLowerCase();
      allProducts = allProducts.filter((p) => (p.category || '').toLowerCase() === cLower);
    }

    // If featured=latest-by-brand requested, return exactly 1 product per brand
    if (featured === 'latest-by-brand') {
      const latestByBrand = getLatestProductPerBrand(allProducts);
      return NextResponse.json({
        success: true,
        count: latestByBrand.length,
        products: latestByBrand,
        availableBrands,
        availableCategories,
      });
    }

    return NextResponse.json({
      success: true,
      count: allProducts.length,
      products: allProducts,
      availableBrands,
      availableCategories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
