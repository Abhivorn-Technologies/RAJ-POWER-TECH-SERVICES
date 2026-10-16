import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldAlert, Clock } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

const POLICIES: Record<string, { title: string; subtitle: string; description: string }> = {
  privacy: {
    title: 'Privacy Policy (Draft)',
    subtitle: 'Customer Information & WhatsApp Communications',
    description:
      'This document outlines how customer contact numbers, delivery addresses, and inquiry details are handled solely for quotation and order fulfillment. Full finalized legal disclosures will be published during Phase 2.',
  },
  terms: {
    title: 'Terms of Service (Draft)',
    subtitle: 'Purchasing & Consultation Terms',
    description:
      'All equipment offerings, capacity recommendations, and quotations are subject to local power grid conditions and physical site evaluation. Official consumer terms will be formalized alongside the checkout phase.',
  },
  shipping: {
    title: 'Delivery & Shipping Terms (Draft)',
    subtitle: 'Doorstep Logistics & Territory Guidelines',
    description:
      'RAJ POWER TECH SERVICES operates and coordinates delivery across serviceable regions in India. Battery and inverter transit adheres to safe hazardous materials handling and road transport regulations.',
  },
  warranty: {
    title: 'Manufacturer Warranty Guidelines (Draft)',
    subtitle: 'OEM Inverter & Battery Coverage',
    description:
      'Product warranties are provided and serviced according to original manufacturer specifications. Serial numbers, warranty cards, and tax invoices must be retained for on-site claim verification.',
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({
    slug,
  }));
}

export const instant = false;

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="py-16 bg-[#F3F5F8]/70 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Policies</span>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Phase 1 Draft Policy Placeholder</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B55]">
            {policy.title}
          </h1>

          <p className="text-sm font-semibold text-[#D52B30]">
            {policy.subtitle}
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            {policy.description}
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> This preliminary text is a placeholder provided for project structure during Phase 1. Complete statutory and merchant legal agreements will be posted before online financial transactions commence.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            Business Contact: <span className="font-semibold text-slate-800">{BUSINESS_INFO.name}</span> • {BUSINESS_INFO.phoneFormatted}
          </div>
        </div>
      </div>
    </div>
  );
}
