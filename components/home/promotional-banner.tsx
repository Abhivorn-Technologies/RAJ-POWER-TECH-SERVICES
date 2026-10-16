'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { scaleIn, fadeUp, VIEWPORT_ONCE } from '@/lib/animations';

export function PromotionalBanner() {
  const shouldReduceMotion = useReducedMotion();

  const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
    'Hello Raj Power Tech Services, I would like to consult about power backup options for my home / office.'
  )}`;

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#142B55] via-[#1A3870] to-[#0E1E3C] text-white p-8 sm:p-12 lg:p-14 shadow-2xl border border-[#3E5275]/40"
        >
          {/* Subtle Grid Accent Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Ambient Light Halo */}
          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.15 }
                : { scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-20 -top-20 w-80 h-80 bg-[#D52B30] rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 max-w-3xl space-y-5">
            {/* Tag */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D52B30] text-white shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              <span>Preparedness Alert</span>
            </motion.div>

            {/* Headline */}
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Protect Your Essential Systems Before Grid Cuts Disrupt Your Day
            </motion.h2>

            {/* Description */}
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
              Sudden voltage fluctuations and seasonal power cuts can harm sensitive electronic appliances, CCTV recorders, Wi-Fi routers, and refrigeration. Consult with our technical team in Secunderabad to calculate your exact backup requirement.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="md"
                  variant="primary"
                  fullWidth
                  className="bg-[#D52B30] hover:bg-[#B51E22] text-white font-bold shadow-lg shadow-[#D52B30]/30 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Direct WhatsApp Consultation
                </Button>
              </a>

              <Link href="/shop" className="w-full sm:w-auto">
                <Button
                  size="md"
                  variant="secondary"
                  fullWidth
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-sm font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  icon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Browse Power Backup Systems
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
