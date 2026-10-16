import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { ProductCard } from '@/components/home/product-card';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BUSINESS_INFO.categories.map((c) => ({
    slug: c.slug,
  }));
}

export const instant = false;

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = BUSINESS_INFO.categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = DEMO_FEATURED_PRODUCTS.filter((p) => p.category === category.id);

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
              {category.features.map((feature, idx) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categoryProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
