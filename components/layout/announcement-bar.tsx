import React from 'react';
import { Phone, MapPin, MessageSquareQuote } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export function AnnouncementBar() {
  return (
    <aside aria-label="Regional Service Notice" className="bg-[#0B172F] text-slate-200 text-xs py-2 px-4 border-b border-[#142B55]/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left message: Service territory & authenticity */}
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D52B30] text-white uppercase tracking-wider">
            Notice
          </span>
          <span className="font-medium text-slate-300">
            Dedicated power backup solutions &amp; doorstep service across serviceable regions.
          </span>
        </div>

        {/* Right contacts: Phone, WhatsApp, Location */}
        <div className="flex items-center gap-4 text-[11px] text-slate-300 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#D52B30]" />
            <span>Secunderabad Central Hub</span>
          </div>

          <div className="h-3 w-px bg-slate-700 hidden sm:block" />

          <a
            href={`tel:${BUSINESS_INFO.phoneTel}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#D52B30]" />
            <span className="font-medium">{BUSINESS_INFO.phoneFormatted}</span>
          </a>

          <div className="h-3 w-px bg-slate-700 hidden sm:block" />

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent('Hello Raj Power Tech Services, I would like to request power backup guidance.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>WhatsApp Enquiry</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
