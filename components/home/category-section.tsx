'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, BatteryCharging, ShieldAlert } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

export function CategorySection() {
  const categoryImages: Record<string, string> = {
    inverters: '/images/cat-inverters.jpg',
    batteries: '/images/cat-batteries.jpg',
    ups: '/images/cat-ups.jpg',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    inverters: <Zap className="w-5 h-5 text-[#D52B30]" />,
    batteries: <BatteryCharging className="w-5 h-5 text-[#D52B30]" />,
    ups: <ShieldAlert className="w-5 h-5 text-[#D52B30]" />,
  };

  return (
    <section className="py-20 bg-white" aria-labelledby="category-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with smooth entrance */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55] mb-3">
            Core Product Categories
          </div>
          <h2
            id="category-heading"
            className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight"
          >
            Specialized Power Backup Solutions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Carefully curated power backup systems engineered for demanding power environments, from residential apartments to critical enterprise facilities.
          </p>
        </motion.div>

        {/* 3 Core Category Cards with Independent Scroll-Arrival */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BUSINESS_INFO.categories.map((category, idx) => {
            const imgPath = categoryImages[category.id] || '/images/cat-inverters.jpg';
            const icon = categoryIcons[category.id];

            return (
              <motion.div
                key={category.id}
                variants={cardRevealWithDelay(idx * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={CARD_VIEWPORT}
                className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#142B55]/30 overflow-hidden"
              >
                {/* Visual Image Container with realistic photo and smooth zoom */}
                <div className="relative aspect-[16/10] w-full bg-[#0A1221] overflow-hidden">
                  <Image
                    src={imgPath}
                    alt={`${category.name} power systems`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  {/* Subtle dark vignette overlay for text contrast and premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B172F]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

                  {/* Category icon badge top left */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100 z-10 transition-transform duration-300 group-hover:scale-110">
                    {icon}
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#142B55] group-hover:text-[#D52B30] transition-colors flex items-center justify-between">
                      <span>{category.name}</span>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#D52B30] group-hover:translate-x-1.5 transition-all duration-300" />
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Features list */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      {category.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link
                      href={category.href}
                      className="block w-full py-2.5 px-4 text-center rounded-xl text-sm font-semibold text-[#142B55] bg-slate-100 hover:bg-[#142B55] hover:text-white transition-all duration-300 shadow-2xs hover:shadow-md"
                    >
                      View {category.name} Models
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
