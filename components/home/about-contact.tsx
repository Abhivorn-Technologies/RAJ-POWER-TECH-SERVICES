'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  User,
  ShieldCheck,
  Compass,
  Building2,
  Clock,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { fadeUp, slideFromLeft, slideFromRight, VIEWPORT_ONCE } from '@/lib/animations';

export function AboutContact() {
  const googleMapsUrl = BUSINESS_INFO.address.mapsUrl;

  return (
    <section className="py-20 bg-white overflow-hidden" aria-labelledby="about-contact-heading">
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
            About RPS &amp; Contact Center
          </div>
          <h2
            id="about-contact-heading"
            className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight"
          >
            Direct Contact &amp; Operating Headquarters
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Conveniently located in Secunderabad. Reach out for technical inquiries, on-site load evaluation, or equipment quotation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Business Overview */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 flex flex-col justify-between space-y-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#142B55] text-white rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#142B55]">
                    {BUSINESS_INFO.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#D52B30] uppercase tracking-wider">
                    Brand: {BUSINESS_INFO.shortName}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                RAJ POWER TECH SERVICES is an established regional energy solutions vendor based in Secunderabad, specializing in pure sine wave home &amp; commercial inverters, tall tubular heavy-duty storage batteries, and zero-transfer UPS systems.
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">
                Our business prioritizes authentic power equipment, technical load diagnostics, and responsive doorstep service for residential homes, healthcare centers, commercial clinics, and billing points.
              </p>
            </div>

            {/* Leadership & Integrity Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#142B55]/10 text-[#142B55] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Executive Contact
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {BUSINESS_INFO.contactPerson}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Authorized consultation and billing under RAJ POWER TECH SERVICES.</span>
              </div>
            </div>

            {/* Operating Territory Alert */}
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Working Hours: Monday through Saturday, 9:30 AM – 7:30 PM (IST)</span>
            </div>
          </motion.div>

          {/* Right Column: Verified Contact Matrix */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-5 bg-[#0B172F] text-white rounded-3xl p-8 sm:p-10 border border-[#142B55] flex flex-col justify-between space-y-6 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <span className="text-xs uppercase font-bold text-[#D52B30] tracking-wider block">
                  Get In Touch
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Verified Contact Channels
                </h3>
              </div>

              {/* Address Item */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#D52B30] shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Registered Facility &amp; Store
                  </h4>
                  <p className="text-sm text-slate-200 mt-1 leading-snug">
                    {BUSINESS_INFO.address.full}
                  </p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#00E5FF] hover:underline mt-2 font-medium"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>View Map Directions</span>
                  </a>
                </div>
              </div>

              {/* Telephone Item */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Direct Telephone
                  </h4>
                  <a
                    href={`tel:${BUSINESS_INFO.phoneTel}`}
                    className="text-base font-bold text-white hover:text-emerald-400 transition-colors block mt-1"
                  >
                    {BUSINESS_INFO.phoneFormatted}
                  </a>
                  <span className="text-xs text-slate-400">Direct line to Secunderabad desk</span>
                </div>
              </div>

              {/* Email Item */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-sky-400 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Official Email
                  </h4>
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="text-sm font-semibold text-white hover:text-sky-300 transition-colors block mt-1"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                  <span className="text-xs text-slate-400">Formal inquiries &amp; tenders</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="pt-4 border-t border-slate-700/60">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
                  'Hello Mr. Raja Shekar Reddy (RPS), I would like to visit or consult regarding power backup products in Secunderabad.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  size="md"
                  variant="primary"
                  fullWidth
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Chat with Sales Specialist
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
