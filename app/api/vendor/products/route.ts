import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth/server-guard';
import {
  listProducts,
  createProductRecord,
  updateProductRecord,
  findProductById,
  findVendorById,
  listCategories,
} from '@/lib/db/data-store';
import { Product, CreateProductInput } from '@/types/product';

/**
 * GET: List products.
 * If called by a Vendor, returns ONLY their own products.
 * If called by Admin / Super Admin, can list all or filter by vendorId.
 */
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    let vendorIdToFilter: string | undefined;

    if (user.role === 'vendor') {
      if (!user.vendorId) {
        return NextResponse.json({ error: 'Vendor profile not found for user' }, { status: 400 });
      }
      vendorIdToFilter = user.vendorId;
    } else {
      // Admin or Super Admin can inspect specific vendor or all
      vendorIdToFilter = searchParams.get('vendorId') || undefined;
    }

    const products = await listProducts({
      vendorId: vendorIdToFilter,
      category,
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to list products' }, { status: 500 });
  }
}

/**
 * POST: Create a new product.
 * Publishes immediately after server-side validation.
 * Vendor owns the product.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as CreateProductInput & { vendorId?: string };

    let targetVendorId: string;
    let targetVendorName = 'Vendor';
    let targetAllowedCategories: string[] | undefined;

    if (user.role === 'vendor') {
      if (!user.vendorId) {
        return NextResponse.json({ error: 'Active vendor account required' }, { status: 403 });
      }
      targetVendorId = user.vendorId;
      const vendor = await findVendorById(user.vendorId);
      if (!vendor || vendor.status !== 'active') {
        return NextResponse.json(
          { error: `Vendor account is ${vendor?.status || 'inactive'}. You cannot add new products.` },
          { status: 403 }
        );
      }
      targetVendorName = vendor.businessName;
      targetAllowedCategories = vendor.allowedCategories;
    } else if (user.role === 'super_admin' || (user.role === 'admin' && user.permissions.includes('manage_products'))) {
      if (!body.vendorId) {
        return NextResponse.json({ error: 'Admin must specify target vendorId for product ownership' }, { status: 400 });
      }
      targetVendorId = body.vendorId;
      const vendor = await findVendorById(targetVendorId);
      if (!vendor) {
        return NextResponse.json({ error: 'Target vendor does not exist' }, { status: 404 });
      }
      targetVendorName = vendor.businessName;
      targetAllowedCategories = vendor.allowedCategories;
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Required fields validation
    const { name, brand, category, price, stock, shortDescription, imageUrl, technicalSpecs, keySpecs } = body;

    if (!name || !brand || !category || price === undefined || stock === undefined || !shortDescription) {
      return NextResponse.json(
        { error: 'Missing required product fields: name, brand, category, price, stock, and shortDescription' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
    }

    if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return NextResponse.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });
    }

    // Dynamic Category Validation
    const allCategories = await listCategories();
    const matchedCategory = allCategories.find(
      (c) => c.id.toLowerCase() === category.toLowerCase() || c.slug.toLowerCase() === category.toLowerCase()
    );

    if (!matchedCategory) {
      return NextResponse.json(
        { error: `Invalid product solution "${category}". Super Admin must first create this solution in the platform.` },
        { status: 400 }
      );
    }

    // Check if this vendor is authorized to sell this solution
    if (targetAllowedCategories && targetAllowedCategories.length > 0) {
      const isAuthorized = targetAllowedCategories.some(
        (allowedId) => allowedId.toLowerCase() === matchedCategory.id.toLowerCase() || allowedId.toLowerCase() === matchedCategory.slug.toLowerCase()
      );
      if (!isAuthorized) {
        return NextResponse.json(
          {
            error: `Your vendor account is not authorized to sell in the "${matchedCategory.name}" solution. Please contact Super Admin to assign this solution to your account.`,
          },
          { status: 403 }
        );
      }
    }

    const categoryDisplayName = matchedCategory.name;

    const productId = `prd-${matchedCategory.id.substring(0, 3)}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newProduct: Product = {
      id: productId,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      brand: brand.trim(),
      category: matchedCategory.id,
      categoryName: categoryDisplayName,
      vendorId: targetVendorId,
      vendorName: targetVendorName,
      price,
      comparePrice: body.comparePrice,
      stock,
      sku: body.sku?.trim() || `RPS-${matchedCategory.id.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      availability: stock > 0 ? 'In Stock' : 'Available on Order',
      shortDescription: shortDescription.trim(),
      fullDescription: body.fullDescription?.trim(),
      imageUrl: imageUrl || `/products/${category}-demo-1.svg`,
      additionalImages: body.additionalImages || [],
      keySpecs: Array.isArray(keySpecs) && keySpecs.length > 0 ? keySpecs : [
        { label: 'Category', value: categoryDisplayName },
        { label: 'Brand', value: brand },
        { label: 'Condition', value: 'Brand New Original' },
      ],
      technicalSpecs,
      customAttributes: body.customAttributes,
      isPublished: true, // Immediate publish after successful validation
      createdAt: now,
      updatedAt: now,
    };

    const created = await createProductRecord(newProduct);

    return NextResponse.json({
      success: true,
      message: 'Product created and published immediately',
      product: created,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH: Update product.
 * Enforces resource ownership:
 * - Vendor can ONLY edit their own products.
 * - Admin can edit vendor price ONLY when having 'edit_vendor_prices' permission.
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { productId, ...updates } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const existingProduct = await findProductById(productId);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Role & Ownership Verification
    if (user.role === 'vendor') {
      if (existingProduct.vendorId !== user.vendorId) {
        return NextResponse.json(
          { error: 'Forbidden: You cannot modify products belonging to another vendor' },
          { status: 403 }
        );
      }
    } else if (user.role === 'admin') {
      if (!user.permissions.includes('manage_products')) {
        return NextResponse.json({ error: 'Missing manage_products permission' }, { status: 403 });
      }

      // Check if price is being altered
      if (updates.price !== undefined && updates.price !== existingProduct.price) {
        if (!user.permissions.includes('edit_vendor_prices')) {
          return NextResponse.json(
            { error: 'Admin is not authorized to edit vendor prices (missing edit_vendor_prices permission)' },
            { status: 403 }
          );
        }
      }
    }

    // Validation
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
      return NextResponse.json({ error: 'Price must be non-negative' }, { status: 400 });
    }

    if (updates.stock !== undefined) {
      if (typeof updates.stock !== 'number' || updates.stock < 0) {
        return NextResponse.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });
      }
      updates.availability = updates.stock > 0 ? 'In Stock' : 'Available on Order';
    }

    const updated = await updateProductRecord(productId, updates);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
