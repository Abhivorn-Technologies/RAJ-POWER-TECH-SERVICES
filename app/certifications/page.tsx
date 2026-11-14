'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  Search,
  FileCheck2,
  Mail,
} from 'lucide-react';
import { Certification } from '@/types/certification';
import { AUTHENTIC_CERTIFICATIONS } from '@/lib/certifications-data';
import { Button } from '@/components/ui/button';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

function normalizeAuthorityName(authority: string): string {
  if (!authority) return 'Other';
  if (/exide/i.test(authority)) return 'Exide Industries';
  if (/best power|bpe/i.test(authority)) return 'Best Power Equipments (BPE)';
  return authority.trim();
}

export default function CertificationsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [certifications, setCertifications] = useState<Certification[]>(AUTHENTIC_CERTIFICATIONS);
  const loading = false;
  const error: string | null = null;

  // Dynamic filter state & search
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Certificate Inspection Modal
  const [previewCert, setPreviewCert] = useState<Certification | null>(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchCertifications() {
      try {
        const res = await fetch('/api/certifications', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (ignore) return;
        if (Array.isArray(data.certifications) && data.certifications.length > 0) {
          setCertifications(data.certifications);
        }
      } catch {
        // Silently preserve instant authentic fallback
      }
    }

    fetchCertifications();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Dynamically derive filter tabs from the data (no hardcoded lists)
  const filterOptions = useMemo(() => {
    const groups = new Map<string, number>();
    certifications.forEach((cert) => {
      const name = normalizeAuthorityName(cert.issuingAuthority);
      groups.set(name, (groups.get(name) || 0) + 1);
    });

    return Array.from(groups.entries()).map(([name, count]) => ({
      id: name,
      label: name,
      count,
    }));
  }, [certifications]);

  // Dynamically filter certifications by activeFilter and search query
  const filteredCertifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return certifications.filter((cert) => {
      const matchesSearch =
        !query ||
        cert.title.toLowerCase().includes(query) ||
        cert.issuingAuthority.toLowerCase().includes(query) ||
        cert.certificateNumber.toLowerCase().includes(query) ||
        (cert.categoryScope && cert.categoryScope.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;

      const groupName = normalizeAuthorityName(cert.issuingAuthority);
      return groupName.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [certifications, searchQuery, activeFilter]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-14 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Authorisations &amp; Certifications</span>
        </div>

        {/* Hero Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#D52B30] border border-red-100">
            Official Authorisations
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#142B55] tracking-tight">
            Authorised Dealerships &amp; Awards
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Direct OEM dealership accreditations and performance awards conferred upon <strong className="text-slate-800">RAJ POWER TECH SERVICES</strong> for industrial battery systems and enterprise standby power distribution.
          </p>
        </motion.div>

        {/* Dynamic Filter & Search Toolbar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 [scrollbar-width:thin]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#142B55] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({certifications.length})
            </button>
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === opt.id
                    ? 'bg-[#142B55] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label} ({opt.count})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search certifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55]"
            />
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#142B55] mb-2" />
            <p className="text-xs font-semibold">Loading certifications...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-800">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h2 className="text-sm font-bold">Unable to Load Certifications</h2>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        ) : filteredCertifications.length === 0 ? (
          <div className="max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-2xl text-center">
            <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-800">No Matching Certifications</h2>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredCertifications.map((cert, idx) => (
              <motion.div
                key={cert.id}
                variants={cardRevealWithDelay(idx * 0.05)}
                initial="hidden"
                whileInView="visible"
                viewport={CARD_VIEWPORT}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(20,43,85,0.08)] transition-all duration-300 flex flex-col h-full overflow-hidden group"
              >
                {/* Certificate Image Frame */}
                <div
                  onClick={() => setPreviewCert(cert)}
                  className="relative bg-slate-50/80 border-b border-slate-100 h-60 sm:h-64 flex items-center justify-center p-6 cursor-pointer overflow-hidden group/img"
                >
                  {cert.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      className="max-h-full max-w-full object-contain rounded-sm drop-shadow-sm group-hover/img:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <Award className="w-12 h-12 text-[#142B55] mb-2 opacity-80" />
                      <span className="text-xs font-semibold text-slate-600">Official Standards Seal</span>
                    </div>
                  )}

                  {/* Clean hover preview badge */}
                  <div className="absolute inset-0 bg-[#0B172F]/15 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-full bg-white text-[#142B55] text-xs font-bold inline-flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5 text-[#D52B30]" />
                      <span>View Certificate</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#D52B30] uppercase tracking-wider block">
                      {cert.issuingAuthority}
                    </span>

                    <h2 className="text-sm sm:text-base font-bold text-[#142B55] group-hover:text-[#0B172F] transition-colors leading-snug line-clamp-2">
                      {cert.title}
                    </h2>

                    {cert.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  {/* Professional OEM Inquiry Action */}
                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-2xs whitespace-nowrap group/btn"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-300 group-hover/btn:text-white transition-colors" />
                      <span>Inquire with Specialist</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Clean Full Certificate Inspection Lightbox Modal */}
      <AnimatePresence>
        {previewCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 my-6 shadow-2xl relative max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="pr-4 space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D52B30]">
                    {previewCert.issuingAuthority}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#142B55] leading-snug">
                    {previewCert.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Image Frame (Direct, distraction-free display) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 flex items-center justify-center min-h-[300px] max-h-[66vh] overflow-hidden relative">
                {previewCert.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewCert.imageUrl}
                    alt={previewCert.title}
                    className="max-h-[60vh] max-w-full w-auto object-contain rounded shadow-sm border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <Award className="w-12 h-12 mx-auto mb-2 text-[#142B55]" />
                    <p className="text-xs font-semibold text-slate-600">Accredited Standard Record</p>
                  </div>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <Link
                  href="/contact"
                  onClick={() => setPreviewCert(null)}
                  className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inquire with Specialist</span>
                </Link>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setPreviewCert(null)}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
