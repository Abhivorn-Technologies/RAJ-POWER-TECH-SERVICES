'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { DEMO_FEATURED_PRODUCTS } from '@/lib/demo-data';
import { ProductCard } from '@/components/home/product-card';
import { BUSINESS_INFO } from '@/lib/constants';

export default function ShopSolutionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'inverters' | 'batteries' | 'ups'>('all');

  const filteredProducts = DEMO_FEATURED_PRODUCTS.filter((product) => {
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

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
        </div>

        {/* Executive Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55]">
              <Sparkles className="w-3.5 h-3.5 text-[#D52B30]" />
              Power &amp; Energy Systems
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight">
              Our Power Backup Solutions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Engineered pure sine wave inverters, heavy-duty tubular batteries, and zero-transfer online UPS systems tailored for residential, healthcare, and enterprise reliability.
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
              <span>WhatsApp Capacity Consultation</span>
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

        {/* Category Solution Pills */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2 overflow-x-auto pb-2 sm:pb-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-[#142B55] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Solutions ({DEMO_FEATURED_PRODUCTS.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('inverters')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'inverters'
                ? 'bg-[#D52B30] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Inverters &amp; Sine Wave</span>
          </button>

          <button
            onClick={() => setSelectedCategory('batteries')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'batteries'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Tubular Batteries</span>
          </button>

          <button
            onClick={() => setSelectedCategory('ups')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === 'ups'
                ? 'bg-[#142B55] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Online UPS Systems</span>
          </button>
        </div>

        {/* Products / Solutions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        {/* Bottom Trust & Doorstep Assistance Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D52B30] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">100% BIS Certified</span>
              <span>Genuine Indian &amp; ISO standard equipment</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Prompt Doorstep Delivery</span>
              <span>Professional unboxing &amp; setup assistance</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#142B55] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Official Warranty Support</span>
              <span>Dedicated Secunderabad technical desk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
