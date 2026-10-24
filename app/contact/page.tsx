'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ScrollRevealCard } from '@/components/ui/scroll-reveal-card';
import { buildDetailedQuotationWhatsAppUrl } from '@/lib/utils';

const INQUIRY_TYPES = [
  { id: 'combo', label: 'Inverter + Battery Setup', category: 'Inverters & Battery Combo' },
  { id: 'inverters', label: 'Inverter Only', category: 'Pure Sine Wave Inverters Only' },
  { id: 'batteries', label: 'Battery Only / Exchange', category: 'Tall Tubular Inverter Batteries Only' },
  { id: 'ups', label: 'UPS System', category: 'Online / Line-Interactive UPS Systems' },
];

const CONTACT_PRODUCT_OPTIONS = [
  {
    group: '✨ Recommendations',
    items: ['Let RPS Engineer Recommend Best Match for My Setup'],
  },
  {
    group: '⚡ Inverter & Battery Complete Combos',
    items: [
      'Microtek vTURBO 1550 + Exide 150Ah Battery Combo (Popular)',
      'Microtek Smart Hybrid 1275 + Amaron 150Ah Battery Combo',
      'Microtek vTURBO 2000 24V + 2x Exide 150Ah Commercial Combo',
    ],
  },
  {
    group: '⚡ Microtek Pure Sine Wave Inverters',
    items: [
      'Microtek Heavy Duty vTURBO 1550 Pure Sine Inverter (1400VA)',
      'Microtek Smart Hybrid 1275 Pure Sine Inverter (1125VA)',
      'Microtek Heavy Duty vTURBO 2000 24V Commercial Inverter',
      'Microtek Super Power 1100 Advanced Inverter',
    ],
  },
  {
    group: '🔋 Exide Powersafe Plus SMF VRLA Batteries',
    items: [
      'Exide Powersafe Plus EP 150-12 (12V 150Ah)',
      'Exide Powersafe Plus EP 100-12 (12V 100Ah)',
      'Exide Powersafe Plus EP 65-12 (12V 65Ah)',
      'Exide Powersafe Plus EP 42-12 (12V 42Ah)',
      'Exide Powersafe Plus EP 26-12 (12V 26Ah)',
    ],
  },
  {
    group: '🔋 Amaron Quanta Industrial VRLA Batteries',
    items: [
      'Amaron Quanta 12AL150 (12V 150Ah Radgrid™)',
      'Amaron Quanta 12AL100 (12V 100Ah Radgrid™)',
      'Amaron Quanta 12AL065 (12V 65Ah Radgrid™)',
      'Amaron Quanta 12AL042 (12V 42Ah Radgrid™)',
      'Amaron Quanta 12AL026 (12V 26Ah Radgrid™)',
    ],
  },
  {
    group: '🖥️ BPE Online & Line-Interactive UPS',
    items: [
      'BPE MF-1kVA True Online UPS (0ms Transfer)',
      'BPE MF-2kVA True Online UPS (Double Conversion)',
      'BPE MF-3kVA High Frequency Online UPS',
      'BPE BP-650 (650VA Line-Interactive UPS)',
    ],
  },
];

function ContactPageContent() {
  const searchParams = useSearchParams();

  const urlProductId = searchParams.get('productId') || '';
  const urlProductName = searchParams.get('name') || '';
  const urlCategory = searchParams.get('category') || '';

  // Core Customer State
  const [selectedProductId, setSelectedProductId] = useState(urlProductId);
  const [selectedProductName, setSelectedProductName] = useState(urlProductName);
  const [inquiryType, setInquiryType] = useState<string>(
    urlCategory === 'inverters'
      ? 'inverters'
      : urlCategory === 'batteries'
      ? 'batteries'
      : urlCategory === 'ups'
      ? 'ups'
      : 'combo'
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cityOrDistrict, setCityOrDistrict] = useState('Hyderabad / Secunderabad');
  const [notes, setNotes] = useState(
    urlProductName ? `Requesting price quotation and installation details for ${urlProductName}.` : ''
  );
  const [customerEmail, setCustomerEmail] = useState('');

  // Business GST Toggle
  const [isBusinessCustomer, setIsBusinessCustomer] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  // Status & Error
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    quotationNumber: string;
    message: string;
    whatsappUrl: string;
  } | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const googleMapsUrl = BUSINESS_INFO.address.mapsUrl;

  const directWhatsAppUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
    'Hello Mr. Raja Shekar Reddy (RPS), I would like to consult on power backup equipment.'
  )}`;

  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    const errs: Record<string, string> = {};

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errs.name = 'Please enter your name';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Mobile number should start with 6, 7, 8, or 9';
    }

    const trimmedLocation = cityOrDistrict.trim();
    if (!trimmedLocation) {
      errs.location = 'Please specify your area, city, or pincode';
    }

    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    if (Object.keys(errs).length > 0) {
      setContactErrors(errs);
      setSubmissionError('Please fill in the required fields highlighted above.');
      return;
    }

    setContactErrors({});
    setSubmitting(true);

    const activeCat = INQUIRY_TYPES.find((t) => t.id === inquiryType)?.category || 'Inverters & Battery Combo';

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: trimmedName,
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim() || undefined,
          companyName: isBusinessCustomer && companyName.trim() ? companyName.trim() : undefined,
          gstin: isBusinessCustomer && gstin.trim() ? gstin.trim().toUpperCase() : undefined,
          cityOrDistrict: trimmedLocation,
          category: activeCat,
          productId: selectedProductId || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quotation request');
      }

      const qNum = data.quotation?.quotationNumber || `RPS-QT-${Date.now().toString().slice(-4)}`;
      const waUrl = buildDetailedQuotationWhatsAppUrl({
        quotationNumber: qNum,
        customerName: trimmedName,
        customerPhone: cleanPhone,
        productName: selectedProductName || undefined,
        category: activeCat,
        cityOrDistrict: trimmedLocation,
        notes: notes.trim() || undefined,
        companyName: isBusinessCustomer && companyName.trim() ? companyName.trim() : undefined,
      });

      setSubmissionSuccess({
        quotationNumber: qNum,
        message: 'Your inquiry has been logged in our store Admin desk and dispatched to WhatsApp.',
        whatsappUrl: waUrl,
      });

      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setSubmissionError(
        err instanceof Error ? err.message : 'Submission failed. Please call or WhatsApp us directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Contact &amp; Quotation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Office Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollRevealCard className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#142B55] block mb-1">
                  Raj Power Tech Services
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Get in Touch
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Providing authorized industrial &amp; residential power backup systems, genuine factory warranties, and certified technician installation.
                </p>
              </div>

              {/* Direct Communication Channels */}
              <div className="space-y-4 pt-2">
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-start gap-3.5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#142B55] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Direct Phone
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm group-hover:text-[#142B55]">
                      {BUSINESS_INFO.phoneFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500 block">Available Mon – Sat (9 AM – 8 PM)</span>
                  </div>
                </a>

                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/80 flex items-start gap-3.5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      WhatsApp Quick Desk
                    </span>
                    <span className="font-extrabold text-emerald-950 text-sm">
                      Mr. B. V. Raja Shekar Reddy
                    </span>
                    <span className="text-[11px] text-emerald-700 block">Instant sizing &amp; stock availability</span>
                  </div>
                </a>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-start gap-3.5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#D52B30]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Office &amp; Logistics Hub
                    </span>
                    <span className="font-bold text-slate-900 text-xs leading-snug block">
                      Plot No: 12A, Vijaya Nagar Colony, Picket, Secunderabad, Telangana - 500009
                    </span>
                    <span className="text-[11px] text-blue-700 font-semibold mt-1 inline-flex items-center gap-1">
                      <span>View on Google Maps &rarr;</span>
                    </span>
                  </div>
                </a>
              </div>

              {/* Service Highlights */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Doorstep Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Warranty</span>
                </div>
              </div>
            </ScrollRevealCard>

            {/* Interactive Google Maps Card */}
            <ScrollRevealCard delay={0.1} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#142B55]/10 flex items-center justify-center text-[#142B55]">
                    <Compass className="w-4 h-4 text-[#D52B30]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#142B55] uppercase tracking-wider">Store Location Map</h3>
                    <p className="text-[11px] text-slate-500">Secunderabad Storefront &amp; Warehouse</p>
                  </div>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#142B55] hover:text-[#D52B30] inline-flex items-center gap-1 hover:underline"
                >
                  <span>Open in App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 sm:h-64 relative bg-slate-100 shadow-inner">
                <iframe
                  title="RAJ POWER TECH SERVICES Store Location"
                  src={BUSINESS_INFO.address.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>GPS: 17.4532287° N, 78.499837° E</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Get Driving Directions &rarr;
                </a>
              </div>
            </ScrollRevealCard>
          </div>

          {/* Right Column: Customer-Centric Inquiry & Quotation Form */}
          <div className="lg:col-span-7">
            <ScrollRevealCard className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Request a Product Quotation or Service
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Fill in your basic details below. Our technical team will calculate the right capacity and share an official product quotation.
                </p>

                {/* Pre-selected Product Banner */}
                {selectedProductName && (
                  <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        Inquiring About
                      </span>
                      <span className="text-sm font-extrabold text-[#142B55] block">
                        {selectedProductName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId('');
                        setSelectedProductName('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 px-2 py-1 rounded bg-white border border-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {submissionSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base text-emerald-950">
                        Product Quotation Request Received
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Reference ID: <strong className="font-mono text-sm">{submissionSuccess.quotationNumber}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you, <strong>{customerName}</strong>. Our team in Secunderabad will review your power requirements and contact you at <strong>{customerPhone}</strong> with a formal product quotation.
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs space-y-1 text-slate-700">
                    <p>
                      • <strong>Central Technical Desk:</strong> Inward inquiry registered for engineering verification.
                    </p>
                    <p>
                      • <strong>Official WhatsApp:</strong> Sent to RPS Technical Desk ({BUSINESS_INFO.phoneFormatted}).
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href={submissionSuccess.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Open WhatsApp Chat Directly</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionSuccess(null);
                        setCustomerName('');
                        setCustomerPhone('');
                        setNotes('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuotationSubmit} noValidate className="space-y-4">
                  {submissionError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  {/* 1. What are you looking for? (Visual Selector) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      What are you looking for?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {INQUIRY_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setInquiryType(type.id)}
                          className={`p-2.5 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            inquiryType === type.id
                              ? 'bg-[#142B55] text-white border-[#142B55] shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Product / Model Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Specific Product / Equipment Model</span>
                      <span className="text-[11px] text-blue-600 font-semibold lowercase">Official 4-brand stock</span>
                    </label>
                    <select
                      value={selectedProductName || 'Let RPS Engineer Recommend Best Match for My Setup'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedProductName(val);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] cursor-pointer"
                    >
                      {CONTACT_PRODUCT_OPTIONS.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                          {group.items.map((prod) => (
                            <option key={prod} value={prod}>
                              {prod}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* 2. Customer Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (contactErrors.name) setContactErrors((p) => ({ ...p, name: '' }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.name
                            ? 'border-red-500 bg-red-50/20 text-red-900'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.name && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{contactErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setCustomerPhone(digits);
                          if (contactErrors.phone) setContactErrors((p) => ({ ...p, phone: '' }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.phone
                            ? 'border-red-500 bg-red-50/20 text-red-900'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.phone && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{contactErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* 3. Delivery Area / City / Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Area / City / Pincode *
                      </label>
                      <input
                        type="text"
                        value={cityOrDistrict}
                        onChange={(e) => {
                          setCityOrDistrict(e.target.value);
                          if (contactErrors.location) setContactErrors((p) => ({ ...p, location: '' }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.location
                            ? 'border-red-500 bg-red-50/20 text-red-900'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.location && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{contactErrors.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if (contactErrors.email) setContactErrors((p) => ({ ...p, email: '' }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] transition-all"
                      />
                      {contactErrors.email && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{contactErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* 4. Requirements / Appliances to Power */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Appliances to Run or Requirements (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] transition-all"
                    />
                  </div>

                  {/* 5. Clean GST & Business Toggle */}
                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={isBusinessCustomer}
                        onChange={(e) => setIsBusinessCustomer(e.target.checked)}
                        className="w-4 h-4 rounded text-[#142B55] border-slate-300 focus:ring-[#142B55]"
                      />
                      <span>I am buying for a business / clinic / require GST invoice</span>
                    </label>

                    {isBusinessCustomer && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Business / Company Name
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            GSTIN (15 Digits)
                          </label>
                          <input
                            type="text"
                            maxLength={15}
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. Submit Button & Quick Chat Alternative */}
                  <div className="pt-3 space-y-3">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={submitting}
                      fullWidth
                      className="bg-[#142B55] hover:bg-[#0B172F] text-white font-bold py-3.5 rounded-xl shadow-md transition-all"
                      icon={<Send className="w-4 h-4 ml-1.5" />}
                    >
                      {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry & Request Product Quotation'}
                    </Button>

                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center"
                    >
                      <Button
                        type="button"
                        size="md"
                        variant="outline"
                        fullWidth
                        className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 font-bold rounded-xl py-2.5 transition-all"
                        icon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
                      >
                        Or Chat with Engineer on WhatsApp
                      </Button>
                    </a>
                  </div>
                </form>
              )}
            </ScrollRevealCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#142B55] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
