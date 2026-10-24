'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PREMIUM_EASE } from '@/lib/animations';

interface BrandSpotlight {
  id: string;
  brandName: string;
  brandPill: string;
  pillActiveColor: string;
  badge: string;
  headlineAccent: string;
  gradientText: string;
  description: string;
  productName: string;
  productType: string;
  productImage: string;
  specHighlight: string;
  keyMetric: string;
  glowColor: string;
  waveColor: string;
  bgGlow: string;
  accentBorder: string;
}

const BRAND_SPOTLIGHTS: BrandSpotlight[] = [
  {
    id: 'bpe',
    brandName: 'BPE (Best Power Equipments)',
    brandPill: 'BPE Online UPS',
    pillActiveColor: 'border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-cyan-500/25',
    badge: 'Platinum Certified Partner',
    headlineAccent: 'Zero-Transfer Online UPS Architectures',
    gradientText: 'from-cyan-300 via-sky-200 to-blue-300',
    description: 'Precision 0.00ms double-conversion power isolation engineered for critical diagnostic medical equipment, workstation clusters, and corporate server rooms.',
    productName: 'BPE BP-650 / MF-1kVA System',
    productType: 'True Online Double-Conversion',
    productImage: '/products/bpe-online-ups-hq.png',
    specHighlight: '0.00ms Zero Latency',
    keyMetric: '230V ±1% Pure Sine',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    waveColor: '#06b6d4',
    bgGlow: 'bg-cyan-500/15',
    accentBorder: 'border-cyan-500/40',
  },
  {
    id: 'exide',
    brandName: 'Exide Powersafe Plus',
    brandPill: 'Exide Powersafe',
    pillActiveColor: 'border-red-500 bg-red-950/80 text-red-200 shadow-red-500/25',
    badge: 'ALL STARS Gold Dealer (Code: 92884)',
    headlineAccent: 'Heavy-Duty Sealed AGM VRLA Storage',
    gradientText: 'from-rose-300 via-red-200 to-amber-200',
    description: 'Absorbent Glass Mat (AGM) valve-regulated lead-acid batteries with rapid deep-discharge recovery and leak-proof containers for commercial UPS installations.',
    productName: 'Exide Powersafe Plus 26Ah - 150Ah',
    productType: 'Flame-Retardant SMF AGM VRLA',
    productImage: '/products/exide-powersafe-hq.png',
    specHighlight: '1200+ Deep Cycles',
    keyMetric: '12V / 150Ah High Float',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    waveColor: '#ef4444',
    bgGlow: 'bg-red-500/15',
    accentBorder: 'border-red-500/40',
  },
  {
    id: 'amaron',
    brandName: 'Amaron Quanta VRLA',
    brandPill: 'Amaron Quanta',
    pillActiveColor: 'border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-emerald-500/25',
    badge: 'Amara Raja Authorized Stockist',
    headlineAccent: 'Patented Radgrid™ Cyclic Endurance Cells',
    gradientText: 'from-emerald-300 via-teal-200 to-cyan-200',
    description: 'Heavy cyclic endurance technology engineered by Amara Raja with patented Radgrid™ architecture for instant high-rate discharge in industrial UPS applications.',
    productName: 'Amaron Quanta 12AL026 - 12AL150',
    productType: 'Radgrid™ High-Rate Cyclic Battery',
    productImage: '/products/amaron-quanta-clean.png',
    specHighlight: 'Patented Radgrid™ Tech',
    keyMetric: 'Instant High-Rate Pulse',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    waveColor: '#10b981',
    bgGlow: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/40',
  },
  {
    id: 'microtek',
    brandName: 'Microtek Power Systems',
    brandPill: 'Microtek Inverters',
    pillActiveColor: 'border-amber-400 bg-amber-950/80 text-amber-200 shadow-amber-500/25',
    badge: 'Authorized Channel Partner',
    headlineAccent: 'Pure Sine Wave Microcontroller vTURBO',
    gradientText: 'from-amber-300 via-orange-200 to-yellow-200',
    description: 'Smart hybrid pure sine wave inverters with copper wound transformers and multi-stage intelligent charging to safely power sensitive domestic and commercial electronics.',
    productName: 'Microtek vTURBO 1550 Pure Sine',
    productType: 'Pure Sine Wave 50Hz DSP Inverter',
    productImage: '/products/microtek-vturbo-clean.png',
    specHighlight: 'Copper Wound Transformer',
    keyMetric: '< 8ms Automatic Transfer',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    waveColor: '#f59e0b',
    bgGlow: 'bg-amber-500/15',
    accentBorder: 'border-amber-500/40',
  },
];

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);

  const currentBrand = BRAND_SPOTLIGHTS[activeBrandIndex];

  // Dynamically auto-cycle through authorized brands every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBrandIndex((prev) => (prev + 1) % BRAND_SPOTLIGHTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeBrandIndex]);

  const handleSelectBrand = (idx: number) => {
    setActiveBrandIndex(idx);
  };

  const itemFade = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: PREMIUM_EASE },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#0A1120] text-white pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-16">
      {/* Dynamic Atmospheric Ambient Backdrop */}
      <div className="absolute inset-0 bg-grid-cyber-dark opacity-35 pointer-events-none" />
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 ${currentBrand.bgGlow} rounded-full blur-[130px] pointer-events-none transition-colors duration-1000`}
      />
      <div
        className={`absolute top-1/3 -right-32 w-[450px] h-[450px] ${currentBrand.bgGlow} rounded-full blur-[140px] pointer-events-none transition-colors duration-1000`}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Brand Presentation & Typography */}
          <div className="lg:col-span-6 space-y-5 text-left">
            {/* Interactive Brand Selector Tabs with Smooth Sliding Pill */}
            <div className="p-1 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 inline-flex flex-wrap items-center gap-1">
              {BRAND_SPOTLIGHTS.map((brand, idx) => {
                const isActive = idx === activeBrandIndex;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleSelectBrand(idx)}
                    className="relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none overflow-hidden"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBrandIndicator"
                        className={`absolute inset-0 rounded-xl border ${brand.pillActiveColor}`}
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        key={`timer-${idx}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3.5, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-[2px] bg-white/40 rounded-full"
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                      {brand.brandPill}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Headline with Smooth Blur-Fade Animation */}
            <div className="min-h-[125px] sm:min-h-[140px]">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold tracking-tight text-white leading-[1.14]">
                Zero-Break Power.{' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentBrand.id}
                    initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                    transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                    className={`block bg-gradient-to-r ${currentBrand.gradientText} bg-clip-text text-transparent`}
                  >
                    {currentBrand.headlineAccent}
                  </motion.span>
                </AnimatePresence>
              </h1>
            </div>

            {/* Dynamic Subtitle */}
            <div className="min-h-[55px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentBrand.id + '-desc'}
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.28 }}
                  className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed"
                >
                  {currentBrand.description}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href={`/shop?brand=${encodeURIComponent(currentBrand.id === 'microtek' ? 'Microtek' : currentBrand.id === 'amaron' ? 'Amaron Quanta' : currentBrand.id === 'exide' ? 'Exide' : 'BPE')}`}>
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold px-6 py-3 text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all duration-300 cursor-pointer"
                  icon={<ArrowRight className="w-4 h-4 ml-1.5" />}
                >
                  Explore {currentBrand.brandPill}
                </Button>
              </Link>

              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border-white/20 hover:border-cyan-400/50 backdrop-blur-md px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                  icon={<FileText className="w-4 h-4 text-cyan-400 mr-1.5" />}
                >
                  Instant Product Quotation
                </Button>
              </Link>
            </div>

            {/* Authentic Brand Verification Strip */}
            <div className="pt-2.5 flex items-center gap-2.5 text-xs text-slate-400 border-t border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentBrand.id + '-badge'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-slate-200 font-semibold"
                >
                  {currentBrand.brandName} • <span className="text-cyan-400">{currentBrand.badge}</span>
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Clean Transparent Equipment Showcase (No Box, No 3D, Crisp HQ) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {/* Soft Ambient Radial Backlight */}
            <div
              className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-45"
              style={{
                background: `radial-gradient(circle at center, ${currentBrand.glowColor} 0%, transparent 70%)`,
              }}
            />

            {/* Main Transparent Hardware Image Stage with Balanced Proportions */}
            <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[350px] max-w-[420px] mx-auto flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBrand.id}
                  initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)', y: 8 }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, filter: 'blur(6px)', y: -8 }}
                  transition={{ duration: 0.32, ease: PREMIUM_EASE }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <Image
                    src={currentBrand.productImage}
                    alt={currentBrand.productName}
                    fill
                    priority
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                    className="object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] select-none pointer-events-none p-2"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Natural Floor Shadow Ellipse Under Equipment */}
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-5 rounded-full pointer-events-none opacity-45"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 75%)',
                }}
              />
            </div>

            {/* Clean Equipment Model & Specification Label (No Heavy Box) */}
            <div className="w-full text-center mt-2.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBrand.id + '-label'}
                  initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                  transition={{ duration: 0.25 }}
                  className="space-y-1"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentBrand.productType}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {currentBrand.productName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {currentBrand.specHighlight} • {currentBrand.keyMetric}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
