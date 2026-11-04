import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react';
import { connection } from 'next/server';
import { BUSINESS_INFO } from '@/lib/constants';
import { listProducts, listCategories } from '@/lib/db/data-store';
import { ProductCard } from '@/components/home/product-card';
import { Product } from '@/types/product';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export default async function CategoryPage({ params }: CategoryPageProps) {
  await connection();
  const { slug } = await params;
  let category: { id: string; name: string; slug: string; description: string; features?: readonly string[] | string[] } | undefined =
    BUSINESS_INFO.categories.find((c) => c.slug === slug || c.id === slug);

  if (!category) {
    try {
      const dbCategories = await listCategories();
      const found = dbCategories.find((c) => c.slug === slug || c.id === slug);
      if (found) {
        category = {
          id: found.id,
          name: found.name,
          slug: found.slug,
          description: found.description || `Industrial-grade ${found.name} equipment and energy storage solutions.`,
          features: ['Authorized Original Equipment', 'Comprehensive Warranty', 'Professional Installation'],
        };
      }
    } catch (err) {
      console.warn('DB category lookup warning:', err);
    }
  }

  if (!category) {
    notFound();
  }

  let categoryProducts: Product[] = [];
  try {
    const rawProducts = await listProducts({ category: category.id });
    categoryProducts = rawProducts.map((p) => {
      const { _id: _unusedId, ...rest } = p as unknown as Record<string, unknown>;
      return JSON.parse(JSON.stringify(rest)) as Product;
    });

    // Safeguard tiebreaker: For Online UPS, guarantee BPE is displayed first
    if (category.id.toLowerCase() === 'ups') {
      categoryProducts.sort((a, b) => {
        const brandA = (a.brand || '').trim().toLowerCase();
        const brandB = (b.brand || '').trim().toLowerCase();
        const isBpeA = brandA === 'bpe';
        const isBpeB = brandB === 'bpe';
        if (isBpeA && !isBpeB) return -1;
        if (!isBpeA && isBpeB) return 1;
        const ordA = typeof a.sortOrder === 'number' ? a.sortOrder : 999;
        const ordB = typeof b.sortOrder === 'number' ? b.sortOrder : 999;
        if (ordA !== ordB) return ordA - ordB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }
  } catch (err) {
    console.error('Failed to load category products:', err);
  }

  return (
    <div className="py-12 bg-[#F3F5F8]/70 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#142B55] transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{category.name}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="bg-[#142B55] text-white rounded-2xl p-6 sm:p-10 shadow-lg mb-10 border border-[#3E5275]/50 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D52B30] text-white">
              Category Focus
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {category.name} Solutions
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {category.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {(category.features || []).map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/10 px-3 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Products Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#142B55]">
              Available {category.name} Models
            </h2>
            <p className="text-xs text-slate-500">
              Showing catalog models for {category.name}
            </p>
          </div>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
              `Hello RPS, I would like to consult on suitable models in ${category.name}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Enquire on WhatsApp</span>
          </a>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categoryProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800">No equipment currently available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no active models listed in {category.name}. Check back soon or request a custom quotation.
            </p>
            <Link
              href="/shop"
              className="inline-block px-4 py-2 rounded-xl bg-[#142B55] text-white text-xs font-bold hover:bg-[#0B172F]"
            >
              Browse All Solutions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
