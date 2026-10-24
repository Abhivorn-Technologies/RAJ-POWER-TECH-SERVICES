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

    // Fetch from database repository
    let dbProducts: Product[] = [];
    try {
      dbProducts = await listProducts({ category });
    } catch (e) {
      console.warn('[Products API] listProducts database error, falling back:', e);
    }

    // Merge database products with default catalog so all brands are available
    const productMap = new Map<string, Product>();

    // 1. Seed demo products first
    DEMO_FEATURED_PRODUCTS.forEach((p) => {
      productMap.set(p.id, p);
    });

    // 2. Overwrite with database products (admin-uploaded or modified products)
    dbProducts.forEach((p) => {
      productMap.set(p.id, p);
    });

    let allProducts = Array.from(productMap.values());

    // Filter by brand if requested
    if (brand && brand !== 'all') {
      const bLower = brand.toLowerCase();
      allProducts = allProducts.filter((p) => (p.brand || '').toLowerCase().includes(bLower));
    }

    // Filter by category if requested
    if (category && category !== 'all') {
      allProducts = allProducts.filter((p) => p.category === category);
    }

    // If featured=latest-by-brand requested, return exactly 1 product per brand
    if (featured === 'latest-by-brand') {
      const latestByBrand = getLatestProductPerBrand(allProducts);
      return NextResponse.json({
        success: true,
        count: latestByBrand.length,
        products: latestByBrand,
      });
    }

    return NextResponse.json({
      success: true,
      count: allProducts.length,
      products: allProducts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
