

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BatteryCharging, ShieldAlert, Cpu, Activity, Gauge, CheckCircle2 } from 'lucide-react';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  image: string;
  accentBg: string;
  icon: React.ReactNode;
  specs: { label: string; value: string }[];
  applications: string[];
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'inverters',
    name: 'Pure Sine Wave Inverters',
    subtitle: 'Microcontroller DSP Technology',
    tagline: '900VA to 5kVA Capacity',
    description: 'Clean 50Hz pure sinusoidal output engineered to safeguard televisions, motors, sensitive computing equipment, and home appliances.',
    image: '/images/cat-inverters.jpg',
    accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Zap className="w-5 h-5 text-[#142B55]" />,
    specs: [
      { label: 'Waveform', value: 'Pure Sine Wave (THD < 3%)' },
      { label: 'Transfer Time', value: '< 10ms UPS Mode' },
      { label: 'Efficiency', value: '> 92% Energy Rating' },
    ],
    applications: ['Home Appliances', 'Office Desktops', 'Refrigerators'],
  },
  {
    id: 'batteries',
    name: 'Tall Tubular Batteries',
    subtitle: 'Heavy-Duty C10 Deep Cycle',
    tagline: '100Ah to 220Ah Energy Storage',
    description: 'High-pressure spine cast tubular plates designed for harsh tropical ambient temperatures and repetitive deep discharges.',
    image: '/images/cat-batteries.jpg',
    accentBg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <BatteryCharging className="w-5 h-5 text-amber-600" />,
    specs: [
      { label: 'Plate Alloy', value: 'High-Spine Antimonial' },
      { label: 'Backup Cycles', value: '1200+ at 80% DOD' },
      { label: 'Electrolyte', value: 'High Acid Volume / Low Topping' },
    ],
    applications: ['Frequent Power Cuts', 'Extended Home Backup', 'Commercial Shops'],
  },
  {
    id: 'ups',
    name: 'Online & Line-Interactive UPS',
    subtitle: '0ms True Double-Conversion',
    tagline: '1kVA to 20kVA Heavy-Duty',
    description: 'Continuous uninterrupted power with zero transfer latency, isolating sensitive servers and medical diagnostics from voltage surges.',
    image: '/images/cat-ups.jpg',
    accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <ShieldAlert className="w-5 h-5 text-emerald-600" />,
    specs: [
      { label: 'Transfer Latency', value: '0.00ms (True Online)' },
      { label: 'Output Regulation', value: '±1% Static Voltage' },
      { label: 'Protection', value: 'Galvanic & Surge Suppression' },
    ],
    applications: ['Server Rooms', 'Diagnostic Ultrasound', 'Billing Counters'],
  },
];

export function CategorySection() {
  const [, setActiveCategory] = useState<string | null>(null);

  return (
    <section className="py-20 bg-white text-slate-900 border-b border-slate-100" aria-labelledby="category-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200/80 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 text-[#142B55] mb-3">
              <Cpu className="w-3.5 h-3.5 text-[#D52B30]" />
              <span>Authorized Power Solutions</span>
            </div>
            <h2
              id="category-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Browse by Power Category
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Authorized pure sine wave inverters, deep-discharge tall tubular batteries, and zero-transfer online UPS systems calibrated for continuous reliability.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#142B55] text-sm font-semibold text-white transition-all group shrink-0 shadow-sm"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              variants={cardRevealWithDelay(idx * 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={CARD_VIEWPORT}
              onMouseEnter={() => setActiveCategory(cat.id)}
              onMouseLeave={() => setActiveCategory(null)}
              className="group relative"
            >
              <Link
                href={`/shop?category=${cat.id}`}
                className="relative flex flex-col h-full rounded-2xl bg-white border border-slate-200/90 hover:border-[#142B55] transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5"
              >
                {/* Photo Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Floating Tech Pill Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                    {cat.icon}
                    <span className="text-xs font-mono font-bold text-slate-900 tracking-wide">{cat.tagline}</span>
                  </div>

                  {/* Category Subtitle */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      {cat.subtitle}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#D52B30] transition-colors flex items-center justify-between">
                      <span>{cat.name}</span>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#D52B30] group-hover:translate-x-1.5 transition-all" />
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-2 py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                      <Gauge className="w-3 h-3 text-[#142B55]" />
                      <span>Key Technical Specifications</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.specs.map((sp, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{sp.label}</span>
                          <span className="font-mono font-bold text-slate-800">{sp.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suitable Applications Pills */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">Recommended For:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.applications.map((app, aIdx) => (
                        <span
                          key={aIdx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{app}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#142B55] group-hover:text-[#D52B30] transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Explore Equipment Range</span>
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
