'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Phone,
  RotateCcw,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/home/product-card';
import { BUSINESS_INFO } from '@/lib/constants';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedBrand = searchParams.get('brand') || 'all';
  const selectedCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.products) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically compute brands from available products (so any brand added via admin immediately appears)
  const dynamicBrands = React.useMemo(() => {
    const brandCounts = new Map<string, number>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        const b = p.brand.trim();
        brandCounts.set(b, (brandCounts.get(b) || 0) + 1);
      }
    });

    const preferredOrder = ['Microtek', 'BPE', 'Exide', 'Amaron Quanta'];
    const brandKeys = Array.from(brandCounts.keys());
    const sorted = brandKeys.sort((a, b) => {
      const idxA = preferredOrder.findIndex((x) => x.toLowerCase() === a.toLowerCase());
      const idxB = preferredOrder.findIndex((x) => x.toLowerCase() === b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return [
      { id: 'all', label: 'All Brands', count: products.length },
      ...sorted.map((b) => ({ id: b, label: b, count: brandCounts.get(b) || 0 })),
    ];
  }, [products]);

  // Dynamically compute categories from available products (so any category added via admin immediately appears)
  const dynamicCategories = React.useMemo(() => {
    const catMap = new Map<string, { id: string; label: string; count: number }>();
    products.forEach((p) => {
      const catId = (p.category || 'other').trim();
      let label = p.categoryName || catId;
      if (catId === 'ups') label = 'Online UPS';
      else if (catId === 'lithium') label = 'Lithium Products';
      else if (catId === 'high-capacity-ups') label = 'High Capacity UPS';
      else if (catId === 'inverters') label = 'Inverters';
      else if (catId === 'batteries') label = 'Batteries';
      else label = catId.charAt(0).toUpperCase() + catId.slice(1);

      const existing = catMap.get(catId) || { id: catId, label, count: 0 };
      existing.count += 1;
      catMap.set(catId, existing);
    });

    const priority = ['ups', 'lithium', 'high-capacity-ups', 'inverters', 'batteries'];
    const sorted = Array.from(catMap.values()).sort((a, b) => {
      const idxA = priority.indexOf(a.id);
      const idxB = priority.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.label.localeCompare(b.label);
    });

    return [
      { id: 'all', label: 'All Solutions & Products', count: products.length },
      ...sorted,
    ];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategory === 'all' ||
      (product.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchBrand =
      selectedBrand === 'all' ||
      (product.brand || '').toLowerCase() === selectedBrand.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.shortDescription || '').toLowerCase().includes(q) ||
      (product.sku || '').toLowerCase().includes(q) ||
      (product.capacity || '').toLowerCase().includes(q);

    return matchCategory && matchBrand && matchSearch;
  });

  const sortedAndFilteredProducts = (() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  })();

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
    setSearchQuery('');
    router.replace('/shop', { scroll: false });
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="py-10 sm:py-14 bg-[#F3F5F8]/70 min-h-screen text-slate-800" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" suppressHydrationWarning>
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

        {/* Clean Executive Filtration UI (Count-Free) */}
        <div className="space-y-4">
          {/* Equipment Solutions Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  suppressHydrationWarning
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#142B55] text-white shadow-md shadow-[#142B55]/20 scale-[1.02]'
                      : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sub-Bar: Brand Chips + Search + Sort */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Brand Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Brand:
              </span>
              {dynamicBrands.map((brand) => {
                const isActive = selectedBrand.toLowerCase() === brand.id.toLowerCase();
                return (
                  <button
                    suppressHydrationWarning
                    key={brand.id}
                    onClick={() => handleBrandChange(brand.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {brand.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Search & Sort Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Clean Search Input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  suppressHydrationWarning
                  placeholder="Search model or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Compact Sort Select */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium shrink-0">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  suppressHydrationWarning
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low-High</option>
                  <option value="price-desc">Price: High-Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  suppressHydrationWarning
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#D52B30] hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  title="Reset filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs px-1">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Filtered:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/90 text-slate-800 text-xs font-semibold">
                  <span>{dynamicCategories.find((c) => c.id.toLowerCase() === selectedCategory.toLowerCase())?.label || selectedCategory}</span>
                  <button suppressHydrationWarning onClick={() => handleCategoryChange('all')} className="hover:text-red-600 cursor-pointer ml-0.5">✕</button>
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/90 text-slate-800 text-xs font-semibold">
                  <span>{selectedBrand}</span>
                  <button suppressHydrationWarning onClick={() => handleBrandChange('all')} className="hover:text-red-600 cursor-pointer ml-0.5">✕</button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button suppressHydrationWarning onClick={() => setSearchQuery('')} className="hover:text-red-600 cursor-pointer ml-0.5">✕</button>
                </span>
              )}
              <button suppressHydrationWarning onClick={handleResetFilters} className="text-xs text-[#D52B30] hover:underline cursor-pointer ml-1 font-semibold">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing verified models
            {selectedCategory !== 'all' && ` • ${dynamicCategories.find((c) => c.id.toLowerCase() === selectedCategory.toLowerCase())?.label}`}
            {selectedBrand !== 'all' && ` • ${selectedBrand}`}
          </span>
          {hasActiveFilters && (
            <button
              suppressHydrationWarning
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#D52B30] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs animate-pulse space-y-4">
                <div className="w-full h-52 bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-6 bg-slate-100 rounded w-1/3" />
                  <div className="h-9 bg-slate-100 rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedAndFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedAndFilteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#142B55]">No matching equipment models</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No products match this specific category and brand combination. Try clearing your search or resetting filters.
              </p>
            </div>
            <button
              suppressHydrationWarning
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B55] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md shadow-[#142B55]/15 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
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
