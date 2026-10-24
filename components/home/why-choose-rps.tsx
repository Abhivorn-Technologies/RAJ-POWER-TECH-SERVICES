'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Cpu,
  MapPin,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

interface BenchmarkPillar {
  icon: React.ReactNode;
  metric: string;
  metricLabel: string;
  title: string;
  description: string;
  badge: string;
}

const PILLARS: BenchmarkPillar[] = [
  {
    icon: <Calculator className="w-6 h-6 text-[#142B55]" />,
    metric: '100% Exact',
    metricLabel: 'Surge Sizing',
    title: 'Precision Load & Surge Calculation',
    description: 'We calculate inrush motor currents and continuous wattages before recommending systems, eliminating premature inverter shutdowns.',
    badge: 'Zero-Guess Sizing',
  },
  {
    icon: <Cpu className="w-6 h-6 text-amber-600" />,
    metric: '1200+ Cycles',
    metricLabel: 'At 80% DOD',
    title: 'Matched Battery Chemistry Synergy',
    description: 'We calibrate charging current algorithms to tall tubular plate thickness, ensuring 40% longer cell life and minimal electrolyte loss.',
    badge: 'Electrolyte Integrity',
  },
  {
    icon: <Zap className="w-6 h-6 text-emerald-600" />,
    metric: '0.00 ms',
    metricLabel: 'Transfer Latency',
    title: 'Zero-Transfer Online UPS Architectures',
    description: 'True double-conversion topologies supply pure galvanic isolation, protecting mission-critical servers, medical gear, and POS counters.',
    badge: 'Mission-Critical',
  },
  {
    icon: <MapPin className="w-6 h-6 text-[#D52B30]" />,
    metric: 'Direct Hub',
    metricLabel: 'Secunderabad',
    title: 'Authorized Warranty & Logistics Hub',
    description: 'Direct factory warranty coverage from Exide ALL STARS (Code: 92884) & BPE, backed by immediate regional stock fulfillment.',
    badge: 'Authorized Stockist',
  },
];

export function WhyChooseRps() {
  return (
    <section className="py-20 bg-white text-slate-900 overflow-hidden border-b border-slate-100" aria-labelledby="why-rps-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 text-[#142B55] mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D52B30]" />
            <span>Industrial Reliability Assurance</span>
          </div>
          <h2
            id="why-rps-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Engineered Standards. Zero Compromise.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Unlike retail outlets that simply sell boxes, RAJ POWER TECH SERVICES provides certified electrical load sizing, proper charging synergy, and authorized factory backing.
          </p>
        </motion.div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardRevealWithDelay(idx * 0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={CARD_VIEWPORT}
              className="group p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-[#142B55] hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 shadow-sm"
            >
              <div>
                {/* Metric Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {item.badge}
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="mb-4">
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900 group-hover:text-[#142B55] transition-colors">
                    {item.metric}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                    {item.metricLabel}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Field Reliability</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Direct Hotline Bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mt-12 p-6 rounded-2xl bg-[#142B55] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Need Customized Power Infrastructure for Hospitals or Enterprise?</div>
              <div className="text-xs text-slate-300">Our senior technical engineers perform on-site single-line diagram (SLD) audits in Telangana &amp; AP.</div>
            </div>
          </div>
          <a
            href="https://wa.me/919441113576?text=Hello%20RPS,%20I%20need%20technical%20consultation%20for%20commercial%20enterprise%20power%20backup."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer"
          >
            Direct Engineer Line &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}
