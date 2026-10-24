'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Zap,
  BatteryCharging,
  Server,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Phone,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { ProductCard } from '@/components/home/product-card';
import { BUSINESS_INFO } from '@/lib/constants';

const BRANDS = [
  { id: 'all', label: 'All Brands' },
  { id: 'BPE', label: 'BPE (UPS Specialist)' },
  { id: 'Exide', label: 'Exide Powersafe Plus' },
  { id: 'Amaron Quanta', label: 'Amaron Quanta VRLA' },
  { id: 'Microtek', label: 'Microtek Inverters' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedBrand = searchParams.get('brand') || 'all';
  const selectedCategory = searchParams.get('category') || 'all';

  const filteredProducts = DEMO_FEATURED_PRODUCTS.filter((product) => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchBrand = selectedBrand === 'all' || product.brand.toLowerCase() === selectedBrand.toLowerCase();
    return matchCategory && matchBrand;
  });

  const handleBrandChange = (brandId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (brandId === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', brandId);
    }
    const query = params.toString();
    router.replace(query ? `/shop?${query}` : '/shop', { scroll: false });
  };

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    const query = params.toString();
    router.replace(query ? `/shop?${query}` : '/shop', { scroll: false });
  };

  const handleResetFilters = () => {
    router.replace('/shop', { scroll: false });
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all';

  return (
    <div className="py-10 sm:py-14 bg-[#F3F5F8]/70 min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Our Solutions</span>
          {selectedBrand !== 'all' && (
            <>
              <span>/</span>
              <span className="text-[#142B55] font-bold">{selectedBrand}</span>
            </>
          )}
        </div>

        {/* Executive Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55]">
              <Sparkles className="w-3.5 h-3.5 text-[#D52B30]" />
              Official Authorized Brand Portfolio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight">
              {selectedBrand !== 'all' ? `${selectedBrand} Power Equipment` : 'Authorized Power Backup Solutions'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore authentic equipment from our authorized brands: <span className="font-semibold text-slate-900">BPE</span>, <span className="font-semibold text-slate-900">Exide</span>, <span className="font-semibold text-slate-900">Amaron Quanta</span>, and <span className="font-semibold text-slate-900">Microtek</span>. Direct factory warranties and certified local installation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 relative z-10">
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
                'Hello Mr. Raja Shekar Reddy (RPS), I am reviewing your power solutions and would like to request a capacity sizing consultation.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Technical Sizing Consultation</span>
            </a>

            <a
              href={`tel:${BUSINESS_INFO.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-[#142B55] hover:text-white text-[#142B55] text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4 text-[#D52B30]" />
              <span>Call Technical Desk: {BUSINESS_INFO.phoneFormatted}</span>
            </a>
          </div>
        </div>

        {/* Filters Wrapper */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          {/* Brand Filter Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#142B55]" />
                Filter by Authorized Brand
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#D52B30] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {BRANDS.map((brand) => {
                const isActive = selectedBrand.toLowerCase() === brand.id.toLowerCase();
                return (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandChange(brand.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#142B55] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{brand.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Row */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Filter by Equipment Type
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategory === 'all'
                    ? 'bg-[#142B55] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Categories</span>
              </button>

              <button
                onClick={() => handleCategoryChange('ups')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategory === 'ups'
                    ? 'bg-[#142B55] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Online &amp; Smart UPS</span>
              </button>

              <button
                onClick={() => handleCategoryChange('batteries')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategory === 'batteries'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>SMF VRLA Batteries</span>
              </button>

              <button
                onClick={() => handleCategoryChange('inverters')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategory === 'inverters'
                    ? 'bg-[#D52B30] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Pure Sine Inverters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing verified equipment models
            {selectedBrand !== 'all' && ` for ${selectedBrand}`}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-600 hover:text-[#142B55] underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
            <Server className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No products match this combination</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your category or brand filters to view available equipment.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#142B55] text-white text-xs font-bold cursor-pointer hover:bg-[#0B172F]"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Trust & Doorstep Assistance Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D52B30] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">100% BIS &amp; Manufacturer Certified</span>
              <span>Genuine factory warranty with official serial verification</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Hyderabad &amp; Secunderabad Dispatch</span>
              <span>Professional battery rack assembly &amp; inverter setup</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#142B55] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Direct Engineering Consultation</span>
              <span>Accurate load calculation for home, office &amp; hospitals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopSolutionsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm font-semibold text-slate-500">
          Loading authorized power catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
