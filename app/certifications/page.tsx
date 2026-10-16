'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  Check,
  Copy,
  ExternalLink,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Certification } from '@/types/certification';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { fadeUp, cardRevealWithDelay, VIEWPORT_ONCE, CARD_VIEWPORT } from '@/lib/animations';

export default function CertificationsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search state
  const [activeFilter, setActiveFilter] = useState<'all' | 'inverter' | 'battery' | 'ups'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Certificate Inspection Modal
  const [previewCert, setPreviewCert] = useState<Certification | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedCertNo, setCopiedCertNo] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchCertifications() {
      try {
        setLoading(true);
        const res = await fetch('/api/certifications');
        const data = await res.json();
        if (ignore) return;
        if (!res.ok) throw new Error(data.error || 'Failed to load certifications');
        setCertifications(data.certifications || []);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load certifications');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchCertifications();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopyCertNo = (certNo: string) => {
    navigator.clipboard.writeText(certNo);
    setCopiedCertNo(true);
    setTimeout(() => setCopiedCertNo(false), 2000);
  };

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.categoryScope && cert.categoryScope.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'inverter') {
      return (
        cert.title.toLowerCase().includes('inverter') ||
        (cert.categoryScope && cert.categoryScope.toLowerCase().includes('inverter'))
      );
    }
    if (activeFilter === 'battery') {
      return (
        cert.title.toLowerCase().includes('battery') ||
        (cert.categoryScope && cert.categoryScope.toLowerCase().includes('battery')) ||
        cert.title.toLowerCase().includes('recycling')
      );
    }
    if (activeFilter === 'ups') {
      return (
        cert.title.toLowerCase().includes('ups') ||
        (cert.categoryScope && cert.categoryScope.toLowerCase().includes('ups'))
      );
    }
    return true;
  });

  return (
    <div className="bg-[#F3F5F8] min-h-screen py-10 sm:py-14 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Technical Certifications &amp; Compliance</span>
        </div>

        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D52B30]" />
            Accredited Quality &amp; Regulatory Standards
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142B55] tracking-tight">
            Verified Equipment Certifications
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Every power backup system supplied by RAJ POWER TECH SERVICES is certified by the Bureau of Indian Standards (BIS), ISO 9001 quality frameworks, and statutory environmental authorities.
          </p>
        </motion.div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#142B55] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Accreditations ({certifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('inverter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'inverter'
                  ? 'bg-[#142B55] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inverters &amp; Sine Wave
            </button>
            <button
              onClick={() => setActiveFilter('battery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'battery'
                  ? 'bg-[#142B55] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Batteries &amp; Recycling
            </button>
            <button
              onClick={() => setActiveFilter('ups')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === 'ups'
                  ? 'bg-[#142B55] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              UPS Systems
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search standard, authority, cert #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55]"
            />
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-24 text-center text-slate-500">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[#142B55] mb-3" />
            <p className="text-sm font-semibold">Loading accredited equipment records...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-800">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h2 className="text-base font-bold">Unable to Load Certifications</h2>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        ) : filteredCertifications.length === 0 ? (
          <div className="max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-2xl text-center">
            <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No Matching Certifications</h2>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert, idx) => (
              <motion.div
                key={cert.id}
                variants={cardRevealWithDelay(idx * 0.06)}
                initial="hidden"
                whileInView="visible"
                viewport={CARD_VIEWPORT}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Certificate Image Frame (Handles Vertical, Horizontal, and Big documents) */}
                  <div
                    onClick={() => {
                      setPreviewCert(cert);
                      setIsZoomed(false);
                    }}
                    className="mb-4 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100/70 h-52 w-full flex items-center justify-center p-3 relative cursor-pointer group/img"
                  >
                    {cert.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="max-h-full max-w-full object-contain rounded-md shadow-xs group-hover/img:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Award className="w-12 h-12 text-[#142B55] mb-2 opacity-80" />
                        <span className="text-xs font-semibold text-slate-600">Official Standards Seal</span>
                      </div>
                    )}

                    {/* Interactive Zoom Overlay with centered, aligned eye icon badge */}
                    <div className="absolute inset-0 bg-[#0B172F]/55 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-2xs p-3">
                      <div className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-md">
                        <Eye className="w-4 h-4 shrink-0 text-white" />
                        <span className="whitespace-nowrap">Inspect Document</span>
                      </div>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <Badge variant={cert.status === 'active' ? 'success' : 'warning'}>
                        {cert.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#D52B30] uppercase tracking-wider block mb-1">
                    {cert.categoryScope || 'Compliance Standard'}
                  </span>

                  <h2 className="text-base font-bold text-[#142B55] leading-snug mb-2 line-clamp-2">
                    {cert.title}
                  </h2>

                  {cert.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {cert.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Authority: <strong className="text-slate-800">{cert.issuingAuthority}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Cert No: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-[#142B55] font-semibold">{cert.certificateNumber}</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Valid: {new Date(cert.validFrom).toLocaleDateString('en-IN')}
                      {cert.validUntil ? ` to ${new Date(cert.validUntil).toLocaleDateString('en-IN')}` : ' (Indefinite)'}
                    </span>
                  </div>

                  {/* Single-line centered View Full Certificate Button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewCert(cert);
                        setIsZoomed(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-[#142B55] text-[#142B55] hover:text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group/btn"
                    >
                      <Eye className="w-4 h-4 shrink-0 text-[#142B55] group-hover/btn:text-white transition-colors" />
                      <span className="whitespace-nowrap">View Full Certificate</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FULL CERTIFICATE INSPECTION LIGHTBOX MODAL (Handles Vertical, Horizontal, and Big documents) */}
      <AnimatePresence>
        {previewCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 space-y-5 my-6 shadow-2xl relative max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="pr-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Official Verified Accreditation</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#142B55] leading-snug">
                    {previewCert.title}
                  </h3>
                  <span className="text-xs text-slate-500">{previewCert.categoryScope}</span>
                </div>
                <button
                  onClick={() => {
                    setPreviewCert(null);
                    setIsZoomed(false);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  aria-label="Close inspection modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Viewer Controls Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Display Mode:</span>
                  <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {isZoomed ? '100% Original Resolution' : 'Fit to Screen (Vertical & Horizontal Auto-Adapt)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {previewCert.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                    >
                      {isZoomed ? (
                        <>
                          <ZoomOut className="w-3.5 h-3.5 text-[#142B55]" />
                          <span>Fit Window</span>
                        </>
                      ) : (
                        <>
                          <ZoomIn className="w-3.5 h-3.5 text-[#142B55]" />
                          <span>Zoom 100%</span>
                        </>
                      )}
                    </button>
                  )}
                  {previewCert.imageUrl && (
                    <a
                      href={previewCert.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1.5 text-xs transition-colors"
                      title="Open full size original file in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#142B55]" />
                      <span className="hidden sm:inline">Open Original</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Certificate Image Frame (Handles Vertical, Horizontal, and Big documents) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-3 sm:p-5 flex items-center justify-center min-h-[260px] max-h-[55vh] sm:max-h-[60vh] overflow-auto shadow-inner relative">
                {previewCert.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewCert.imageUrl}
                    alt={previewCert.title}
                    className={`rounded-lg shadow-md border border-slate-200 bg-white transition-all duration-200 ${
                      isZoomed
                        ? 'max-w-none w-auto cursor-grab active:cursor-grabbing'
                        : 'max-h-[50vh] sm:max-h-[55vh] max-w-full w-auto object-contain'
                    }`}
                  />
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <Award className="w-16 h-16 mx-auto mb-2 text-[#142B55]" />
                    <p className="text-xs font-semibold text-slate-600">Accredited Standard Record</p>
                  </div>
                )}
              </div>

              {/* Certificate Metadata Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                    Issuing Authority
                  </span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate" title={previewCert.issuingAuthority}>
                    {previewCert.issuingAuthority}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                    Certificate Number
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-xs text-[#142B55] font-bold truncate">
                      {previewCert.certificateNumber}
                    </code>
                    <button
                      onClick={() => handleCopyCertNo(previewCert.certificateNumber)}
                      className="p-1 rounded text-slate-500 hover:text-[#142B55] cursor-pointer shrink-0"
                      title="Copy Certificate Number"
                    >
                      {copiedCertNo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                    Validity Period
                  </span>
                  <span className="font-semibold text-slate-700 mt-0.5 block text-xs">
                    {new Date(previewCert.validFrom).toLocaleDateString('en-IN')}
                    {previewCert.validUntil ? ` to ${new Date(previewCert.validUntil).toLocaleDateString('en-IN')}` : ' (Indefinite)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
                    Regulatory Status
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-0.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Active &amp; Verified</span>
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <Link
                  href="/contact"
                  onClick={() => {
                    setPreviewCert(null);
                    setIsZoomed(false);
                  }}
                  className="text-xs text-[#142B55] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Request Attested Copy for Tenders</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setPreviewCert(null);
                    setIsZoomed(false);
                  }}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white"
                >
                  Close Inspection
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
