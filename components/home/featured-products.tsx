'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Info, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { ProductCard } from '@/components/home/product-card';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildWhatsAppInquiryUrl } from '@/lib/utils';
import { BUSINESS_INFO } from '@/lib/constants';
import { staggerContainer, fadeUp, VIEWPORT_ONCE, PREMIUM_EASE } from '@/lib/animations';

export function FeaturedProducts() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Power Solutions' },
    { id: 'inverters', label: 'Pure Sine Inverters' },
    { id: 'batteries', label: 'Tubular Batteries' },
    { id: 'ups', label: 'Online & Smart UPS' },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? DEMO_FEATURED_PRODUCTS
      : DEMO_FEATURED_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <section className="py-20 bg-[#F3F5F8]/70" aria-labelledby="featured-products-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D52B30]/10 text-[#D52B30] mb-2">
              Featured Power Catalog
            </div>
            <h2
              id="featured-products-heading"
              className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight"
            >
              Popular Backup &amp; Energy Equipment
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Commercial-grade power equipment ready for immediate delivery across serviceable areas. Choose a model to review technical specs or request a customized setup quote.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#142B55] hover:text-[#D52B30] transition-colors shrink-0 group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Demo Notice Banner */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 mb-8 flex items-start sm:items-center gap-3 text-blue-900 text-xs sm:text-sm shadow-2xs"
        >
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Demo Catalog Note:</strong> The models below display verified commercial specifications for reliable power backup. Orders and quotation requests are processed through our multi-vendor fulfillment pipeline.
          </span>
        </motion.div>

        {/* Category Filter Tabs with Smooth Animation */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none"
        >
          {filterTabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#142B55] text-white shadow-md shadow-[#142B55]/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200 shadow-2xs hover:shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Staggered Products Grid */}
        <motion.div
          layout
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </motion.div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: PREMIUM_EASE }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Badge variant="navy">{quickViewProduct.categoryName}</Badge>
                  <span className="text-xs text-slate-500 font-bold">{quickViewProduct.brand}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center p-4 border border-slate-200/80 overflow-hidden shadow-inner">
                    <Image
                      src={quickViewProduct.imageUrl}
                      alt={quickViewProduct.name}
                      fill
                      sizes="320px"
                      className="object-contain p-3"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[#142B55] leading-snug">
                      {quickViewProduct.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {quickViewProduct.shortDescription}
                    </p>
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 text-xs">
                      <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Availability Status</span>
                      <span className="text-sm font-extrabold text-emerald-700">{quickViewProduct.availability}</span>
                      <span className="block text-[11px] text-emerald-600 mt-0.5">Dispatched from Secunderabad Hub</span>
                    </div>
                  </div>
                </div>

                {/* Technical Specs List */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#142B55] mb-3">
                    Verified Technical Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {quickViewProduct.keySpecs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 font-medium">{spec.label}</span>
                        <span className="font-bold text-slate-800">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultation Note */}
                <div className="flex items-center gap-2.5 p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl text-blue-900 text-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    Our Secunderabad technical engineering desk evaluates running watts and starting surge loads before dispatching equipment to your premises.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                  Questions? Call <span className="font-bold text-[#142B55]">{BUSINESS_INFO.phoneFormatted}</span>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickViewProduct(null)}
                    className="rounded-xl"
                  >
                    Close
                  </Button>
                  <a
                    href={buildWhatsAppInquiryUrl(quickViewProduct.name, quickViewProduct.categoryName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                      icon={<MessageSquare className="w-4 h-4" />}
                    >
                      Enquire on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
