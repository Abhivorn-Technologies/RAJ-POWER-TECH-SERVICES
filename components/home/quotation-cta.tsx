'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { slideFromLeft, slideFromRight, VIEWPORT_ONCE } from '@/lib/animations';

export function QuotationCta() {
  const [selectedCategory, setSelectedCategory] = useState('Inverters & Battery Combo');
  const [powerNeed, setPowerNeed] = useState('Residential Home (Lights, Fans, TV, Refrigerator)');
  const [userLocation, setUserLocation] = useState('Hyderabad / Secunderabad');

  const generateWhatsAppUrl = () => {
    const rawMessage = `Hello Raj Power Tech Services (RPS),

I would like to request an official quotation and power backup guidance:
• Category of Interest: ${selectedCategory}
• Expected Usage: ${powerNeed}
• Location: ${userLocation}

Please share available models, pricing, and installation assistance. Thank you!`;

    return `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(rawMessage)}`;
  };

  return (
    <section className="py-20 bg-[#F3F5F8] overflow-hidden" aria-labelledby="quotation-section-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Context & Instructions */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct WhatsApp Quotation Support</span>
            </div>

            <h2
              id="quotation-section-heading"
              className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight leading-tight"
            >
              Get Accurate Pricing &amp; Sizing Directly on WhatsApp
            </h2>

            <p className="text-base text-slate-600 leading-relaxed">
              Every home and business has specific power demands. Rather than guessing online, connect directly with our power backup specialist in Secunderabad to receive a custom quote matching your appliance load.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#142B55]">Zero Obligation Technical Sizing</h4>
                  <p className="text-xs text-slate-500">We assist you in calculating VA and Ah ratings before any purchase decision.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#142B55]">Direct Contact with Mr. B. V. Raja Shekar Reddy</h4>
                  <p className="text-xs text-slate-500">Speak directly with key leadership on WhatsApp ({BUSINESS_INFO.phoneFormatted}).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#142B55]">Doorstep Delivery &amp; Regional Support</h4>
                  <p className="text-xs text-slate-500">Fast local turnaround, supply, and guidance for all serviceable regions.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#D52B30]" />
                <span>Phone: {BUSINESS_INFO.phoneFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#142B55]" />
                <span>Working Mon – Sat</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive WhatsApp Enquiry Generator */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6"
          >
            <div
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#142B55]">
                    Quick Quotation Formulator
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generates a pre-filled WhatsApp enquiry for fast response
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Product Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                  >
                    <option value="Inverters & Battery Combo">Inverters &amp; Battery Combo</option>
                    <option value="Pure Sine Wave Inverters Only">Pure Sine Wave Inverters Only</option>
                    <option value="Tall Tubular Inverter Batteries Only">Tall Tubular Inverter Batteries Only</option>
                    <option value="Online / Line-Interactive UPS Systems">Online / Line-Interactive UPS Systems</option>
                    <option value="Solar-Ready Hybrid Inverters">Solar-Ready Hybrid Inverters</option>
                  </select>
                </div>

                {/* Expected Usage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Application Requirement
                  </label>
                  <select
                    value={powerNeed}
                    onChange={(e) => setPowerNeed(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                  >
                    <option value="Residential Home (Lights, Fans, TV, Refrigerator)">
                      Residential Home (Lights, Fans, TV, Refrigerator)
                    </option>
                    <option value="Home Office / Computer / Wi-Fi Router Setup">
                      Home Office / Computer / Wi-Fi Router Setup
                    </option>
                    <option value="Retail Store / Billing Counter / CCTV System">
                      Retail Store / Billing Counter / CCTV System
                    </option>
                    <option value="Medical Diagnostic / Critical Enterprise Equipment">
                      Medical Diagnostic / Critical Enterprise Equipment
                    </option>
                    <option value="Custom Commercial Wattage Setup">
                      Custom Commercial Wattage Setup
                    </option>
                  </select>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Delivery / Installation Location (City / District)
                  </label>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="E.g., Secunderabad, Hyderabad, Warangal, Nizamabad..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    size="lg"
                    variant="primary"
                    fullWidth
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 py-3.5"
                    icon={<Send className="w-4 h-4 ml-1" />}
                  >
                    Open Pre-filled WhatsApp Enquiry
                  </Button>
                </a>
              </div>

              {/* Clarification Disclaimer */}
              <p className="text-[11px] text-slate-400 text-center leading-normal">
                Clicking opens your WhatsApp client directly with the message above. No data is stored until you submit via WhatsApp to Mr. B. V. Raja Shekar Reddy.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
