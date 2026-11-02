import { NextResponse } from 'next/server';
import { findProductById } from '@/lib/db/data-store';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { isMongoConfigured, getDatabase } from '@/lib/mongodb';
import { Product } from '@/types/product';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Product ID or slug is required' }, { status: 400 });
    }

    const decodedId = decodeURIComponent(id);

    // 1. Try finding in MongoDB by id
    let product: Product | null = null;
    let dbSuccess = false;
    
    try {
      if (isMongoConfigured()) {
        const db = await getDatabase();
        product = await db.collection<Product>('products').findOne({
          $or: [{ id: decodedId }, { slug: decodedId }],
        });
        dbSuccess = true;
      } else {
        product = await findProductById(decodedId);
        dbSuccess = true;
      }
    } catch (dbError) {
      console.warn('[Products API] Database lookup fallback to catalogue:', dbError);
    }

    // 2. Only fall back to demo data if the database connection threw an error
    if (!product && !dbSuccess) {
      const demoMatch = DEMO_FEATURED_PRODUCTS.find(
        (p) => p.id === decodedId || p.slug === decodedId
      );
      if (demoMatch) {
        product = demoMatch;
      }
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve product details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
