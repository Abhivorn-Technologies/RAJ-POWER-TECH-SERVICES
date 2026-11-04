import { NextRequest, NextResponse, connection } from 'next/server';
import { listProducts, getCategorySortConfig } from '@/lib/db/data-store';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { Product } from '@/types/product';
import { getLatestProductPerBrand } from '@/lib/products-helper';

export async function GET(request: NextRequest) {
  await connection();
  try {
    const searchParams = request.nextUrl.searchParams;
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

    // Sort products: if a category filter is active, respect CategorySortConfig brand & product sequence
    if (category && category !== 'all') {
      const catConfig = await getCategorySortConfig(category);
      const defaultBrandOrder = category.toLowerCase() === 'ups' ? ['BPE', 'Microtek'] : [];
      const brandOrder = (catConfig?.brandOrder && catConfig.brandOrder.length > 0) ? catConfig.brandOrder : defaultBrandOrder;
      const productOrder = catConfig?.productOrder || {};

      allProducts.sort((a, b) => {
        const brandA = (a.brand || '').trim();
        const brandB = (b.brand || '').trim();
        const bIdxA = brandOrder.findIndex((b) => b.toLowerCase() === brandA.toLowerCase());
        const bIdxB = brandOrder.findIndex((b) => b.toLowerCase() === brandB.toLowerCase());
        const effectiveBIdxA = bIdxA === -1 ? 999 : bIdxA;
        const effectiveBIdxB = bIdxB === -1 ? 999 : bIdxB;
        if (effectiveBIdxA !== effectiveBIdxB) return effectiveBIdxA - effectiveBIdxB;

        const pOrdA = typeof productOrder[a.id] === 'number' ? productOrder[a.id] : (typeof a.sortOrder === 'number' ? a.sortOrder : 999);
        const pOrdB = typeof productOrder[b.id] === 'number' ? productOrder[b.id] : (typeof b.sortOrder === 'number' ? b.sortOrder : 999);
        if (pOrdA !== pOrdB) return pOrdA - pOrdB;

        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else {
      // Overall catalog sorting: numeric sortOrder (1, 2, 3...), undefined sortOrder at bottom (999)
      allProducts.sort((a, b) => {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 999;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
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
    if ((error as any)?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Failed to retrieve products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
