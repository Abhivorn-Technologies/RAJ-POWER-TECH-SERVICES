import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

import { ScrollRevealCard } from '@/components/ui/scroll-reveal-card';

export const metadata = {
  title: 'About RPS | RAJ POWER TECH SERVICES',
  description:
    'Learn about RAJ POWER TECH SERVICES, dedicated power backup equipment specialist based in Secunderabad.',
};

export default function AboutPage() {
  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">About Us</span>
        </div>

        {/* Heading */}
        <ScrollRevealCard delay={0}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55] mb-2">
            Company Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142B55]">
            About RAJ POWER TECH SERVICES (RPS)
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Providing reliable power backup systems and energy storage solutions across serviceable regions.
          </p>
        </ScrollRevealCard>

        {/* Story & Scope */}
        <ScrollRevealCard delay={0.05} className="prose max-w-none text-slate-700 leading-relaxed space-y-4">
          <p>
            <strong>{BUSINESS_INFO.name}</strong>, widely recognized by its brand abbreviation <strong>{BUSINESS_INFO.shortName}</strong>, is a specialized power-solutions company operating from Secunderabad. Under the leadership of <strong>{BUSINESS_INFO.contactPerson}</strong>, the business focuses on delivering dependable energy storage equipment and clean electrical backup to residential, commercial, and institutional clients.
          </p>
          <p>
            Unlike general appliance retailers, RPS specializes exclusively in the core power backup trio: <strong>pure sine wave inverters</strong>, <strong>heavy-duty tall tubular batteries</strong>, and <strong>line-interactive &amp; online UPS systems</strong>. Our primary objective is ensuring uninterrupted productivity, safeguarding sensitive home electronics, medical instruments, and commercial computing equipment against grid instability.
          </p>
        </ScrollRevealCard>

        {/* Key Business Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <ScrollRevealCard delay={0} className="p-5 rounded-2xl bg-[#F3F5F8] border border-slate-200">
            <div className="p-2.5 bg-[#142B55] text-white rounded-xl inline-block mb-3">
              <Zap className="w-5 h-5 text-[#D52B30]" />
            </div>
            <h3 className="font-bold text-[#142B55] text-sm">Specialized Categories</h3>
            <p className="text-xs text-slate-600 mt-1">Inverters, Batteries, and UPS units engineered for heavy duty duty cycles.</p>
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.08} className="p-5 rounded-2xl bg-[#F3F5F8] border border-slate-200">
            <div className="p-2.5 bg-[#142B55] text-white rounded-xl inline-block mb-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-[#142B55] text-sm">Regional Logistics Hub</h3>
            <p className="text-xs text-slate-600 mt-1">Dedicated supply, logistics hub, and consultative support across serviceable regions in India.</p>
          </ScrollRevealCard>

          <ScrollRevealCard delay={0.16} className="p-5 rounded-2xl bg-[#F3F5F8] border border-slate-200">
            <div className="p-2.5 bg-[#142B55] text-white rounded-xl inline-block mb-3">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-bold text-[#142B55] text-sm">Direct Guidance</h3>
            <p className="text-xs text-slate-600 mt-1">Direct access to technical experts via WhatsApp and direct telephone line.</p>
          </ScrollRevealCard>
        </div>

        {/* Authorised OEM Dealerships & Certifications Card */}
        <ScrollRevealCard delay={0.09} className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#D52B30] uppercase tracking-wider block">
                Official OEM Credentials
              </span>
              <h2 className="text-lg font-bold text-[#142B55]">
                Authorised Dealerships &amp; Certified Accreditations
              </h2>
            </div>
            <Link
              href="/certifications"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white text-xs font-semibold transition-colors w-fit"
            >
              <Award className="w-4 h-4 text-[#D52B30]" />
              <span>Verify All 4 Certificates</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  Dealer Code: 92884
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Valid 2025–2026</span>
              </div>
              <h3 className="text-sm font-bold text-[#142B55]">
                Exide Reserve Power ALL STARS Gold Dealer
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Conferred by Exide Industries Limited for excellence in industrial standby power and high-demand energy storage installations.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#142B55]">
                  Benchmark &amp; Platinum Partner
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Vision 25 Milestone</span>
              </div>
              <h3 className="text-sm font-bold text-[#142B55]">
                Best Power Equipments (BPE)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Honored with BPE Benchmark Partner plaque &amp; Platinum Partner awards for strategic UPS system distribution and technical leadership.
              </p>
            </div>
          </div>
        </ScrollRevealCard>

        {/* Corporate Address Box */}
        <ScrollRevealCard delay={0.1} className="p-6 rounded-2xl bg-[#0B172F] text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D52B30]">
              Registered Address &amp; Key Contact
            </h3>
            <a
              href={BUSINESS_INFO.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#00E5FF] hover:text-white transition-colors font-medium w-fit"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D52B30]" />
              <span>View on Google Maps &rarr;</span>
            </a>
          </div>
          <p className="text-sm text-slate-200">{BUSINESS_INFO.address.full}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <span className="text-slate-400 block">Contact Person:</span>
              <span className="font-semibold text-white">{BUSINESS_INFO.contactPerson}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Phone / WhatsApp:</span>
              <span className="font-semibold text-white">{BUSINESS_INFO.phoneFormatted}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Official Email:</span>
              <span className="font-semibold text-white">{BUSINESS_INFO.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Operating Domain:</span>
              <span className="font-semibold text-white">{BUSINESS_INFO.operatingTerritory}</span>
            </div>
          </div>
        </ScrollRevealCard>
      </div>
    </div>
  );
}
