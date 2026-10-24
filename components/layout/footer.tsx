'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageSquare, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { BUSINESS_INFO } from '@/lib/constants';
import { ScrollRevealCard } from '@/components/ui/scroll-reveal-card';

export function Footer() {
  return (
    <footer className="bg-[#0B172F] text-slate-300 border-t border-[#142B55]">
      {/* Top Value Assurance Ribbon */}
      <div className="border-b border-slate-800 bg-[#091224] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <ScrollRevealCard delay={0} className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-[#142B55]/30 border border-[#142B55]/50">
              <div className="p-3 bg-[#D52B30]/15 rounded-lg text-[#D52B30] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Authentic Power Equipment</h4>
                <p className="text-xs text-slate-400 mt-0.5">High-grade inverters, batteries &amp; UPS systems</p>
              </div>
            </ScrollRevealCard>

            <ScrollRevealCard delay={0.08} className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-[#142B55]/30 border border-[#142B55]/50">
              <div className="p-3 bg-[#10B981]/15 rounded-lg text-emerald-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Doorstep Delivery Coverage</h4>
                <p className="text-xs text-slate-400 mt-0.5">Local consultation, delivery &amp; installation support</p>
              </div>
            </ScrollRevealCard>

            <ScrollRevealCard delay={0.16} className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-[#142B55]/30 border border-[#142B55]/50">
              <div className="p-3 bg-[#38BDF8]/15 rounded-lg text-sky-400 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Direct Technical Quotations</h4>
                <p className="text-xs text-slate-400 mt-0.5">Verified engineering pricing and sizing guidance</p>
              </div>
            </ScrollRevealCard>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Address */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block">
              <Logo />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              <span className="text-white font-semibold">{BUSINESS_INFO.name} ({BUSINESS_INFO.shortName})</span> is your specialized power backup and energy storage partner based in Secunderabad, catering to residential, commercial, and enterprise clients.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-slate-300">
              <a
                href={BUSINESS_INFO.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
                title="Open store location in Google Maps"
              >
                <MapPin className="w-4 h-4 text-[#D52B30] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{BUSINESS_INFO.address.full}</span>
              </a>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D52B30] shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phoneTel}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D52B30] shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white transition-colors">
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#D52B30] pl-2">
              Product Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {BUSINESS_INFO.categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={cat.href}
                    className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-[#D52B30] hover:text-[#E84D52] flex items-center gap-1 pt-1"
                >
                  <span>Explore Full Catalog</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#D52B30] pl-2">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Our Solutions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About RPS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Location
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-white transition-colors">
                  Certifications &amp; Standards
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent('Hello RPS, I would like to request an official power backup quotation.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Quotation</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Institutional Policies & Privacy */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#D52B30] pl-2">
              Policies &amp; Legal
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Customer protection &amp; commercial terms:
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Delivery &amp; Shipping Terms
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" className="hover:text-white transition-colors">
                  Manufacturer Warranty Info
                </Link>
              </li>
              <li>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('rps-open-cookie-settings'));
                    }
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-800/80 bg-[#070E1E] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">
            &copy; 2026 {BUSINESS_INFO.name}. All rights reserved. Sells and operates across serviceable regions in India.
          </p>
          <div className="flex items-center gap-6">
            <span>Contact: {BUSINESS_INFO.contactPerson}</span>
            <span className="text-slate-600">|</span>
            <span>Secunderabad - 500009</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
