'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Calculator,
  MessageSquareCheck,
  Cpu,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

export function WhyChooseRps() {
  const shouldReduceMotion = useReducedMotion();

  const benefits = [
    {
      icon: <Calculator className="w-6 h-6 text-[#D52B30]" />,
      title: 'Wattage & Load Calculation Guidance',
      description:
        'Avoid undersized inverters or overloaded batteries. We help calculate your continuous running watts and surge requirements for fans, computers, refrigerators, and medical equipment.',
    },
    {
      icon: <MessageSquareCheck className="w-6 h-6 text-[#D52B30]" />,
      title: 'Direct WhatsApp Quotation Support',
      description:
        'Receive fast, transparent pricing guidance directly via WhatsApp or phone. No guesswork or hidden costs—get real quotes tailored to your setup.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#D52B30]" />,
      title: 'Inverter & Battery Synergy',
      description:
        'Matching battery chemistry (tall tubular or flat plate) with appropriate charging current algorithms ensures longer life, optimal recharge cycles, and safe operation.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#D52B30]" />,
      title: 'Dedicated Regional Logistics Hub',
      description:
        'Operating from Secunderabad, our logistics hub coordinates swift transit, professional handling, and dedicated technical contacts across all serviceable areas.',
    },
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="why-rps-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55] mb-3">
            Why Raj Power Tech Services
          </div>
          <h2
            id="why-rps-heading"
            className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight"
          >
            Technical Expertise in Every Power Solution
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Selecting power backup is more than picking a box. We provide practical guidance so you invest in the right capacity with reliable long-term performance.
          </p>
        </motion.div>

        {/* Benefits Grid with Independent Card Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardRevealWithDelay(idx * 0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={CARD_VIEWPORT}
              whileHover={shouldReduceMotion ? undefined : { y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="group p-6 rounded-2xl bg-[#F3F5F8]/70 border border-slate-200/80 hover:border-[#142B55]/30 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#142B55] mb-2 leading-snug group-hover:text-[#D52B30] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-[#142B55]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Engineering</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
