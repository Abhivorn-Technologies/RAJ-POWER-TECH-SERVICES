'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  Zap,
  Cpu,
  BatteryCharging,
  Server,
  Wrench,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { FacebookIcon, InstagramIcon } from '@/components/ui/social-icons';
import { Button } from '@/components/ui/button';
import { ScrollRevealCard } from '@/components/ui/scroll-reveal-card';
import { buildDetailedQuotationWhatsAppUrl } from '@/lib/utils';
import { Product } from '@/types/product';

interface InquiryTypeConfig {
  id: string;
  label: string;
  category: 'combo' | 'inverters' | 'batteries' | 'ups' | 'service';
  categoryTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  fieldLabel: string;
}

const INQUIRY_TYPES: InquiryTypeConfig[] = [
  {
    id: 'combo',
    label: 'Inverter + Battery Combo',
    category: 'combo',
    categoryTitle: 'Inverters & Battery Combo',
    icon: Zap,
    fieldLabel: 'Select Inverter + Battery Package',
  },
  {
    id: 'inverters',
    label: 'Inverter Only',
    category: 'inverters',
    categoryTitle: 'Pure Sine Wave Inverters Only',
    icon: Cpu,
    fieldLabel: 'Select Pure Sine Wave Inverter Model',
  },
  {
    id: 'batteries',
    label: 'Battery Only',
    category: 'batteries',
    categoryTitle: 'Tall Tubular Inverter Batteries Only',
    icon: BatteryCharging,
    fieldLabel: 'Select Battery Model & Capacity',
  },
  {
    id: 'ups',
    label: 'Online UPS System',
    category: 'ups',
    categoryTitle: 'Online / Line-Interactive UPS Systems',
    icon: Server,
    fieldLabel: 'Select Online UPS Model',
  },
  {
    id: 'service',
    label: 'Power Audit & Service',
    category: 'service',
    categoryTitle: 'On-Site Power Audit & Engineering Service',
    icon: Wrench,
    fieldLabel: 'Select Engineering Service Scope',
  },
];

const DEFAULT_RECOMMENDATIONS: Record<string, string> = {
  combo: '✨ Let RPS Engineer Recommend Best Inverter + Battery Combo',
  inverters: '✨ Let RPS Engineer Calculate Required VA / Sizing for My Load',
  batteries: '✨ Let RPS Engineer Recommend Battery Capacity (Ah) for Required Backup',
  ups: '✨ Let RPS Technical Team Size Online UPS (kVA) for Critical Equipment',
  service: '✨ Free Initial Power Consultation & Sizing',
};

const SERVICE_OPTIONS = [
  '✨ Free Initial Power Consultation & Sizing',
  'On-Site Power Audit & Load Analysis (Home / Office / Hospital)',
  'Annual Maintenance Contract (AMC) for Online UPS Systems',
  'Annual Maintenance Contract (AMC) for Inverter & Battery Bank',
  'Battery Bank Health Diagnostics & Testing',
  'Emergency Breakdown Assistance & Inverter Repair',
];

const FALLBACK_PRODUCTS_BY_CATEGORY: Record<string, string[]> = {
  combo: [
    'Microtek vTURBO 1550 + Exide 150Ah Tall Tubular Combo (Popular Home)',
    'Microtek Smart Hybrid 1275 + Amaron 150Ah Tubular Combo',
    'Microtek vTURBO 2000 (24V) + 2x Exide 150Ah Heavy Duty Combo',
    'Microtek Super Power 1100 + 100Ah Tubular Budget Combo',
    'Custom High-Capacity Hybrid Inverter + Battery Setup',
  ],
  inverters: [
    'Microtek Heavy Duty vTURBO 1550 Pure Sine Inverter (1400VA / 1120W)',
    'Microtek Smart Hybrid 1275 Pure Sine Inverter (1125VA / 900W)',
    'Microtek Heavy Duty vTURBO 2000 24V Commercial Inverter (2000VA / 1600W)',
    'Microtek Super Power 1100 Advanced Inverter (950VA / 760W)',
    'High-Capacity Sine Wave Inverter (3.5kVA – 5kVA System)',
  ],
  batteries: [
    'Exide Powersafe Plus EP 150-12 (12V 150Ah)',
    'Exide Powersafe Plus EP 100-12 (12V 100Ah)',
    'Exide Powersafe Plus EP 65-12 (12V 65Ah)',
    'Amaron Quanta 12AL150 (12V 150Ah Radgrid™)',
    'Amaron Quanta 12AL100 (12V 100Ah Radgrid™)',
    'Amaron Quanta 12AL065 (12V 65Ah Radgrid™)',
  ],
  ups: [
    'BPE MF-1kVA True Online UPS (1kVA / 900W, 0ms Transfer)',
    'BPE MF-2kVA True Online UPS (2kVA / 1800W, Pure Double Conversion)',
    'BPE MF-3kVA High-Frequency Online UPS (3kVA / 2700W)',
    'BPE MF-6kVA / 10kVA 3-Phase Industrial Online UPS',
    'BPE BP-650 (650VA Line-Interactive UPS for PC & Router)',
  ],
};

function ContactPageContent() {
  const searchParams = useSearchParams();

  const urlProductId = searchParams.get('productId') || '';
  const urlProductName = searchParams.get('name') || '';
  const urlCategory = searchParams.get('category')?.toLowerCase() || '';

  // Determine initial inquiry type from URL if provided
  const initialInquiryType =
    urlCategory === 'inverters' || urlCategory === 'inverter'
      ? 'inverters'
      : urlCategory === 'batteries' || urlCategory === 'battery'
      ? 'batteries'
      : urlCategory === 'ups' || urlCategory === 'online-ups'
      ? 'ups'
      : urlCategory === 'service' || urlCategory === 'services' || urlCategory === 'audit'
      ? 'service'
      : 'combo';

  const [inquiryType, setInquiryType] = useState<string>(initialInquiryType);

  // Selected product / service
  const [selectedProductId, setSelectedProductId] = useState(urlProductId);
  const [selectedProductName, setSelectedProductName] = useState(
    urlProductName || DEFAULT_RECOMMENDATIONS[initialInquiryType] || ''
  );

  // Live products fetched dynamically from database (automatically includes newly added admin/vendor products)
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.products)) {
            setLiveProducts(data.products);
          }
        }
      } catch (err) {
        console.warn('Failed to load live products for contact form:', err);
      }
    }
    loadLiveProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products matching current category from live database
  const categoryProducts = useMemo(() => {
    if (inquiryType === 'service') return [];

    return liveProducts.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      if (inquiryType === 'inverters') return pCat === 'inverters' || pCat === 'inverter';
      if (inquiryType === 'batteries') return pCat === 'batteries' || pCat === 'battery';
      if (inquiryType === 'ups') return pCat === 'ups' || pCat === 'online-ups';
      if (inquiryType === 'combo') return pCat === 'combo' || pCat.includes('combo');
      return pCat === inquiryType;
    });
  }, [liveProducts, inquiryType]);

  // Group dropdown items dynamically by brand so newly added products automatically show up under their brand
  const groupedProductOptions = useMemo(() => {
    const groups: { group: string; items: { id: string; name: string }[] }[] = [];

    // 1. Top recommendation option
    const rec = DEFAULT_RECOMMENDATIONS[inquiryType] || '✨ Let RPS Engineer Recommend Best Option';
    groups.push({
      group: '✨ Recommendations',
      items: [{ id: '', name: rec }],
    });

    if (inquiryType === 'service') {
      groups.push({
        group: '🛠️ On-Site Engineering Services',
        items: SERVICE_OPTIONS.slice(1).map((s) => ({ id: '', name: s })),
      });
      return groups;
    }

    if (categoryProducts.length > 0) {
      // Dynamically group live database products by brand (e.g. Microtek, Exide, Amaron, BPE, etc.)
      const brandMap = new Map<string, { id: string; name: string }[]>();
      categoryProducts.forEach((prod) => {
        const b = prod.brand?.trim() || 'Other Products';
        if (!brandMap.has(b)) brandMap.set(b, []);
        const displayName = prod.capacity ? `${prod.name} (${prod.capacity})` : prod.name;
        brandMap.get(b)!.push({ id: prod.id, name: displayName });
      });

      brandMap.forEach((items, brandName) => {
        groups.push({
          group: `${brandName} Products`,
          items,
        });
      });
    } else {
      // Fallback default list if database catalog is still loading
      const fallbacks = FALLBACK_PRODUCTS_BY_CATEGORY[inquiryType] || [];
      if (fallbacks.length > 0) {
        groups.push({
          group: '⚡ Catalog Products',
          items: fallbacks.map((name) => ({ id: '', name })),
        });
      }
    }

    return groups;
  }, [inquiryType, categoryProducts]);

  // Customer Contact State
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

  // When switching solutions, automatically update the product selection so cross-solution mismatch is impossible
  const handleInquiryTypeChange = (newTypeId: string) => {
    setInquiryType(newTypeId);
    setSelectedProductName(DEFAULT_RECOMMENDATIONS[newTypeId] || '');
    setSelectedProductId(''); // Clear specific product ID since category changed
  };

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

    const activeConfig = INQUIRY_TYPES.find((t) => t.id === inquiryType);
    const activeCat = activeConfig?.category || 'combo';
    const activeCatTitle = activeConfig?.categoryTitle || 'Inverters & Battery Combo';

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
          productName: selectedProductName || undefined,
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
        category: activeCatTitle,
        cityOrDistrict: trimmedLocation,
        notes: notes.trim() || undefined,
        companyName: isBusinessCustomer && companyName.trim() ? companyName.trim() : undefined,
      });

      setSubmissionSuccess({
        quotationNumber: qNum,
        message: 'Your inquiry has been received and forwarded to our technical team via WhatsApp.',
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

  const activeInquiryConfig = INQUIRY_TYPES.find((t) => t.id === inquiryType) || INQUIRY_TYPES[0];

  // Check if current selectedProductName is in options list
  const allCurrentNames = groupedProductOptions.flatMap((g) => g.items.map((i) => i.name));
  const isCustomOrUrlItem = selectedProductName && !allCurrentNames.includes(selectedProductName);

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
                  Providing authorized industrial &amp; residential power backup systems, genuine factory warranties, and certified technician installation across Telangana &amp; Andhra Pradesh.
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

              {/* Social Media Connect */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  Connect on Social Media:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={BUSINESS_INFO.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-[#1877F2]/10 border border-slate-200/80 hover:border-[#1877F2]/40 flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-[#1877F2] transition-all group"
                    title="Follow RPS on Facebook"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                      <FacebookIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Facebook</span>
                  </a>

                  <a
                    href={BUSINESS_INFO.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-rose-600 transition-all group"
                    title="Follow RPS on Instagram"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0">
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Instagram</span>
                  </a>
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
                <p suppressHydrationWarning className="text-xs sm:text-sm text-slate-600 mt-1">
                  Choose your requirement below. Products from our live catalogue automatically appear in the list.
                </p>
              </div>

              {submissionSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base text-emerald-950">
                        Quotation Request Received
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Reference ID: <strong className="font-mono text-sm">{submissionSuccess.quotationNumber}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you, <strong>{customerName}</strong>. Our team in Secunderabad has received your inquiry for <strong>{selectedProductName}</strong> and will contact you directly at <strong>{customerPhone}</strong>.
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs space-y-1 text-slate-700">
                    <p>
                      • <strong>Official Desk:</strong> Inward inquiry registered for pricing &amp; installation verification.
                    </p>
                    <p>
                      • <strong>WhatsApp:</strong> Sent to RPS Desk ({BUSINESS_INFO.phoneFormatted}).
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

                  {/* 1. What are you looking for? (Clean Solution Tabs) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      What are you looking for? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {INQUIRY_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = inquiryType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleInquiryTypeChange(type.id)}
                            className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-[#142B55] text-white border-[#142B55] shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-[#142B55]'}`} />
                            <span className="text-xs font-bold leading-tight">
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Specific Product / Equipment Model (Filtered by Selected Solution & Live Database) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>{activeInquiryConfig.fieldLabel} *</span>
                      <span className="text-[11px] text-blue-600 font-semibold lowercase">
                        {activeInquiryConfig.label}
                      </span>
                    </label>
                    <select
                      suppressHydrationWarning
                      value={selectedProductName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedProductName(val);
                        // Also associate the specific live product ID if matched
                        const matched = categoryProducts.find(
                          (p) => p.name === val || `${p.name} (${p.capacity})` === val || p.id === val
                        );
                        setSelectedProductId(matched ? matched.id : '');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] cursor-pointer"
                    >
                      {/* If user arrived with a specific catalogue model from another page */}
                      {isCustomOrUrlItem && (
                        <optgroup label="Selected Model">
                          <option value={selectedProductName}>{selectedProductName}</option>
                        </optgroup>
                      )}

                      {groupedProductOptions.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                          {group.items.map((prod) => (
                            <option key={prod.name} value={prod.name}>
                              {prod.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* 3. Customer Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
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
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="93460XXXXX"
                          value={customerPhone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setCustomerPhone(digits);
                            if (contactErrors.phone) setContactErrors((p) => ({ ...p, phone: '' }));
                          }}
                          className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                            contactErrors.phone
                              ? 'border-red-500 bg-red-50/20 text-red-900'
                              : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                          }`}
                        />
                      </div>
                      {contactErrors.phone && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{contactErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* 4. Delivery Area / City & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Area / City / Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Begumpet, Secunderabad - 500003"
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
                        placeholder="name@company.com"
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

                  {/* 5. Requirements / Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Requirements or Appliances to Power (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 3 fans, 4 lights, 1 TV, 1 fridge, or general requirements"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] transition-all"
                    />
                  </div>

                  {/* 6. Clean GST & Business Toggle */}
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
                            placeholder="e.g. Care Diagnostics Pvt Ltd"
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
                            placeholder="36AAAAA0000A1Z5"
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Submit Button & Quick Chat Alternative */}
                  <div className="pt-2 space-y-3">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={submitting}
                      fullWidth
                      className="bg-[#142B55] hover:bg-[#0B172F] text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                      icon={<Send className="w-4 h-4 ml-1.5" />}
                    >
                      {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry & Request Quotation →'}
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
                        className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 font-bold rounded-xl py-2.5 transition-all cursor-pointer"
                        icon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
                      >
                        Or Chat Directly with Technical Engineer on WhatsApp
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
