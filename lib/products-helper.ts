import { Product } from '@/types/product';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';

/**
 * Filter products to get exactly 1 product per brand (the latest uploaded by admin).
 * Ensures the 4 flagship authorized brands (BPE, Exide, Amaron Quanta, Microtek)
 * each display exactly 1 latest flagship model on the Home page.
 */
export function getLatestProductPerBrand(products: Product[]): Product[] {
  const targetBrands = [
    { key: 'bpe', label: 'BPE Online UPS', matcher: (b: string) => b.toLowerCase().includes('bpe') },
    { key: 'exide', label: 'Exide Powersafe', matcher: (b: string) => b.toLowerCase().includes('exide') },
    { key: 'amaron', label: 'Amaron Quanta', matcher: (b: string) => b.toLowerCase().includes('amaron') },
    { key: 'microtek', label: 'Microtek Inverters', matcher: (b: string) => b.toLowerCase().includes('microtek') },
  ];

  // Sort descending: newest updated or created first
  const sorted = [...products].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const result: Product[] = [];

  // Pick 1 latest product for each of the 4 flagship brands
  for (const brandConfig of targetBrands) {
    const match = sorted.find((p) => brandConfig.matcher(p.brand || ''));
    if (match) {
      result.push(match);
    }
  }

  // Include any other distinct custom brand uploaded by admin (1 latest product per brand)
  const otherBrandsSeen = new Set<string>();
  for (const prod of sorted) {
    const brandLower = (prod.brand || '').trim().toLowerCase();
    const isTargetBrand = targetBrands.some((t) => t.matcher(brandLower));
    if (!isTargetBrand && brandLower && !otherBrandsSeen.has(brandLower)) {
      otherBrandsSeen.add(brandLower);
      result.push(prod);
    }
  }

  return result;
}

/**
 * Default fallback: 1 product per brand from verified catalog
 */
export const DEFAULT_LATEST_BY_BRAND: Product[] = getLatestProductPerBrand(DEMO_FEATURED_PRODUCTS);
