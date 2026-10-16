'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MessageSquare, ShieldCheck, Zap, BatteryCharging, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { PREMIUM_EASE } from '@/lib/animations';

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const whatsappInquiryUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
    'Hello Raj Power Tech Services (RPS), I would like to request an official quotation and power backup guidance.'
  )}`;

  // Restrained, coordinated entrance variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemFade = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: PREMIUM_EASE },
    },
  };

  const imageReveal = {
    hidden: shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: PREMIUM_EASE },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#0A1325] text-white border-b border-[#142B55]">
      {/* Subtle architectural grid pattern background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <Image
          src="/images/hero-power-grid.svg"
          alt="Power grid architecture"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center"
        >
          {/* Left Column: Modern Editorial Typography & Direct Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Regional Brand Kicker */}
            <motion.div variants={itemFade} className="inline-flex items-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase bg-[#142B55] text-slate-200 border border-[#304B78]/60">
                <span className="w-2 h-2 rounded-full bg-[#D52B30]" />
                RAJ POWER TECH SERVICES • POWER &amp; ENERGY SYSTEMS
              </span>
            </motion.div>

            {/* Bold, Distinctive Headline */}
            <motion.div variants={itemFade}>
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.12]">
                Engineered Power Reliability.
              </h1>
            </motion.div>

            {/* Clear, Professional Lead Copy */}
            <motion.div variants={itemFade}>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                Pure sine wave inverters, high-capacity tall tubular batteries, and zero-transfer UPS systems. Accurately sized for homes, healthcare clinics, retail points, and commercial offices.
              </p>
            </motion.div>

            {/* Purposeful Call-to-Action Buttons */}
            <motion.div
              variants={itemFade}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link href="/shop" className="sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto bg-[#D52B30] hover:bg-[#b82226] text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-[#D52B30]/20 transition-all duration-200"
                  icon={<ArrowRight className="w-4 h-4 ml-1.5" />}
                >
                  Shop Products
                </Button>
              </Link>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3.5 text-sm font-semibold transition-all duration-200"
                  icon={<MessageSquare className="w-4 h-4 text-emerald-400 mr-1" />}
                >
                  Request a Quotation
                </Button>
              </a>
            </motion.div>

            {/* Genuine Technical Specs Strip */}
            <motion.div
              variants={itemFade}
              className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-xl text-left"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Zap className="w-3.5 h-3.5 text-[#D52B30]" />
                  <span>Pure Sine Wave</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Clean &lt;3% THD Output</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <BatteryCharging className="w-3.5 h-3.5 text-[#D52B30]" />
                  <span>Tall Tubular</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Deep Cycle Heavy Duty</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct Support</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Secunderabad Desk</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Architectural Product Showcase */}
          <motion.div
            variants={imageReveal}
            className="lg:col-span-5 relative"
          >
            {/* Framing Box with Clean Editorial Borders */}
            <div className="relative rounded-2xl bg-[#0D182E] border border-[#20365F] p-3 sm:p-4 shadow-2xl">
              {/* Product Photo: Realistic Inverter and Battery Setup */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#070D18]">
                <Image
                  src="/images/hero-power-system.jpg"
                  alt="RAJ POWER TECH SERVICES - Pure Sine Wave Inverter and Tall Tubular Heavy Duty Storage Battery System"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1325]/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Minimalist Editorial Caption Strip */}
              <div className="mt-3 px-2 py-1.5 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">Complete Power Backup System</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">230V • 50Hz Standard</span>
              </div>
            </div>

            {/* Territory Notice */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 px-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Official sales, warranty, and doorstep dispatch across serviceable regions.</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
