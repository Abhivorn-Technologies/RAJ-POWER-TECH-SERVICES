'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

interface BrandCardItem {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  glowColor: string;
  tagline: string;
  description: string;
  image: string;
  seriesTag: string;
  shopUrl: string;
  keyHighlights: string[];
}

const AUTHORIZED_BRANDS: BrandCardItem[] = [
  {
    id: 'bpe',
    name: 'BPE (Best Power Equipments)',
    badge: 'Best Online UPS Brand',
    badgeColor: 'bg-blue-600 text-white',
    glowColor: 'hover:border-blue-500/50 hover:shadow-blue-500/20',
    tagline: 'Home & Office UPS • Online Double Conversion 1kVA - 6kVA',
    description: 'Smart power backup for TV, Wi-Fi, desktop PCs, and zero-transfer online double-conversion UPS for critical medical & data center loads.',
    image: '/products/bpe-online-ups-hq.png',
    seriesTag: 'Authorized Line',
    shopUrl: '/shop?brand=BPE',
    keyHighlights: ['Desktop & Wi-Fi UPS', '0ms True Double Conversion', 'Boost & Buck AVR Regulation'],
  },
  {
    id: 'exide',
    name: 'Exide Powersafe Plus',
    badge: 'Industrial VRLA Specialist',
    badgeColor: 'bg-red-600 text-white',
    glowColor: 'hover:border-red-500/50 hover:shadow-red-500/20',
    tagline: 'Sealed Maintenance Free (SMF) AGM Batteries',
    description: 'Exide Industries Powersafe Plus range with Absorbent Glass Mat (AGM) technology, deep discharge recovery, and long float life for commercial UPS.',
    image: '/products/exide-powersafe-hq.png',
    seriesTag: 'Factory Certified',
    shopUrl: '/shop?brand=Exide',
    keyHighlights: ['26Ah to 150Ah Capacities', 'Flame-Retardant ABS Container', 'Zero Maintenance Required'],
  },
  {
    id: 'amaron-quanta',
    name: 'Amaron Quanta',
    badge: 'The Industrial UPS Battery',
    badgeColor: 'bg-emerald-600 text-white',
    glowColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20',
    tagline: 'Amara Raja Radgrid™ SMF VRLA Technology',
    description: 'Manufactured by Amara Raja Energy & Mobility with patented Radgrid™ technology for heavy cyclic endurance and high-rate discharge performance.',
    image: '/products/amaron-quanta-clean.png',
    seriesTag: 'Genuine Stockist',
    shopUrl: '/shop?brand=Amaron%20Quanta',
    keyHighlights: ['12AL026 to 12AL150 Range', 'Instant High-Rate Discharge', 'Original Manufacturer Warranty'],
  },
  {
    id: 'microtek',
    name: 'Microtek Power Systems',
    badge: 'Trusted Inverters',
    badgeColor: 'bg-amber-600 text-white',
    glowColor: 'hover:border-amber-500/50 hover:shadow-amber-500/20',
    tagline: 'Pure Sine Wave Inverters & Heavy Duty vTURBO',
    description: 'Channel partner sourcing via Satyajan Energy Solutions. Smart hybrid micro-controller based pure sine wave inverters with multi-stage battery charging.',
    image: '/products/microtek-vturbo-clean.png',
    seriesTag: 'Heavy-Duty Series',
    shopUrl: '/shop?brand=Microtek',
    keyHighlights: ['Pure Sine Wave Output', 'Heavy Duty vTURBO Tech', 'Multi-Stage Smart Charging'],
  },
];

export function BrandShowcase() {
  return (
    <section className="py-20 bg-white border-b border-slate-100 relative overflow-hidden" aria-labelledby="brand-showcase-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-slate-200/80 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55] mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D52B30]" />
              Authorized Distributor &amp; Channel Partner
            </div>
            <h2
              id="brand-showcase-heading"
              className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
            >
              Our Authorized Power Brands
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-2xl">
              We exclusively stock, sell, and service original manufacturer hardware from India&apos;s leading power backup giants.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#142B55] hover:bg-[#0B172F] px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md shrink-0"
          >
            <span>Explore Brand Lineup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* 4 Brands Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AUTHORIZED_BRANDS.map((brand, idx) => (
            <motion.div
              key={brand.id}
              variants={cardRevealWithDelay(idx * 0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={CARD_VIEWPORT}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className={`group flex flex-col h-full bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${brand.glowColor}`}
            >
              {/* Product Visual Container */}
              <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px"
                  className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${brand.badgeColor}`}>
                  {brand.badge}
                </span>
                <span className="absolute bottom-2.5 right-3 text-[10px] font-semibold text-slate-700 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{brand.seriesTag}</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#142B55] transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#D52B30] mt-0.5">
                    {brand.tagline}
                  </p>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {brand.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-100">
                    {brand.keyHighlights.map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions: 100% Internal Store Navigation */}
                <div className="pt-3.5 border-t border-slate-100">
                  <Link
                    href={brand.shopUrl}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white font-bold text-xs transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                  >
                    <span>Explore {brand.name.split(' ')[0]} Range</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Official Certifications & Channel Partner Credentials Strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mt-12 bg-gradient-to-r from-slate-900 via-[#142B55] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider block">
                Official Certifications &amp; Distributorship
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                Exide ALL STARS Gold Dealer &amp; BPE Platinum Distribution Partner
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Conferred directly by Exide Industries Ltd (Dealer Code: 92884) &amp; Best Power Equipments (India) Pvt. Ltd.
              </p>
            </div>
          </div>

          <Link
            href="/certifications"
            className="shrink-0 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Inspect Verified Certificates</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
