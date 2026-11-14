'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight, Zap, Award, Truck } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/social-icons';
import { BUSINESS_INFO } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-[#0A1120] text-slate-300 border-t border-[#142B55]">
      {/* Top Value Assurance Trust Strip */}
      <div className="border-b border-slate-800/80 bg-[#070D1A] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-xl text-[#D52B30] shrink-0 border border-red-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">100% Authentic OEM</h4>
                <p className="text-[11px] text-slate-400">Direct factory warranty on every unit</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0 border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Doorstep Delivery</h4>
                <p className="text-[11px] text-slate-400">GHMC &amp; regional installation support</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 shrink-0 border border-sky-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Expert Sizing</h4>
                <p className="text-[11px] text-slate-400">Calculated power backup load guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm">Certified Reliability</h4>
                <p className="text-[11px] text-slate-400">Engineering excellence &amp; support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer: 4-Column Balanced Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info & Central Hub Contact */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block shadow-sm">
              <Logo />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              <strong className="text-white font-semibold">{BUSINESS_INFO.name}</strong> is your authorized energy storage &amp; power backup partner headquartered in Secunderabad, delivering engineered solutions across Telangana.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
              <a
                href={BUSINESS_INFO.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors group"
                title="Open Secunderabad Hub on Google Maps"
              >
                <MapPin className="w-4 h-4 text-[#D52B30] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>{BUSINESS_INFO.address.full}</span>
              </a>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D52B30] shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phoneTel}`} className="hover:text-white transition-colors font-medium">
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

            {/* Social Channels */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={BUSINESS_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-[#1877F2] text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/60"
                  title="Follow RPS on Facebook"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>

                <a
                  href={BUSINESS_INFO.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/60"
                  title="Follow RPS on Instagram"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent('Hello Raj Power Tech Services, I would like to request power backup guidance.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700/60"
                  title="Chat with RPS Support on WhatsApp"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Power Solutions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-[#D52B30] pl-2.5">
              Power Solutions
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/categories/ups" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Online UPS Systems
                </Link>
              </li>
              <li>
                <Link href="/categories/lithium" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Lithium LiFePO4 Systems
                </Link>
              </li>
              <li>
                <Link href="/categories/high-capacity-ups" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  High-Capacity Commercial UPS
                </Link>
              </li>
              <li>
                <Link href="/categories/inverters" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Sine Wave Inverters
                </Link>
              </li>
              <li>
                <Link href="/categories/batteries" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Tubular &amp; SMF VRLA Batteries
                </Link>
              </li>
              <li>
                <Link href="/categories/solar" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Solar Hybrid Systems
                </Link>
              </li>
              <li>
                <Link href="/categories/combo" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Inverter &amp; Battery Combos
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-[#D52B30] hover:text-[#E84D52] inline-flex items-center gap-1 group"
                >
                  <span>Browse Full Store Catalog</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-[#D52B30] pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  About RPS &amp; Leadership
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Doorstep Services &amp; Setup
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Authorizations &amp; Certifications
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Contact &amp; Store Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies & Compliance */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-l-2 border-[#D52B30] pl-2.5">
              Policies &amp; Warranty
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/policies/privacy" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Terms of Service &amp; Invoicing
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Delivery &amp; Logistics Terms
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" className="hover:text-white hover:translate-x-1 inline-block transition-all text-slate-300">
                  Manufacturer Warranty Coverage
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
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left text-xs"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>

            <div className="pt-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-white font-semibold block mb-0.5">GST Invoices Provided</span>
              All purchases include authentic OEM serial tracking and official GST tax invoices for warranty support.
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-800/80 bg-[#060B16] py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p>
            &copy; 2026 <span className="text-slate-300 font-semibold">{BUSINESS_INFO.name}</span>. All rights reserved. Secunderabad, Telangana - 500009.
          </p>

          <p className="text-[11px] text-slate-400 flex items-center justify-center md:justify-end gap-1.5 flex-wrap">
            <span>Developed by</span>
            <a
              href="https://www.abhivorn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-white font-medium inline-flex items-center gap-0.5 underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors"
            >
              <span>ABHIVORN TECHNOLOGIES</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </a>
            <span>&amp;</span>
            <a
              href="https://www.digilevelup.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-white font-medium inline-flex items-center gap-0.5 underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors"
            >
              <span>DIGILEVELUP</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
