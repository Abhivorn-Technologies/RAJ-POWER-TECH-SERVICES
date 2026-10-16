'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Truck,
  Award,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { BUSINESS_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ScrollRevealCard } from '@/components/ui/scroll-reveal-card';
import { fadeUp } from '@/lib/animations';

export default function ContactPage() {
  const shouldReduceMotion = useReducedMotion();

  // Quotation inquiry state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cityOrDistrict, setCityOrDistrict] = useState('Hyderabad / Secunderabad');
  const [category, setCategory] = useState('Inverters & Battery Combo');
  const [estimatedWatts, setEstimatedWatts] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    quotationNumber: string;
    message: string;
  } | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Plot No 12A Vijaya Nagar Colony Picket Secunderabad 500009 India'
  )}`;

  const directWhatsAppUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
    'Hello Mr. Raja Shekar Reddy (RPS), I would like to consult on power backup equipment.'
  )}`;

  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    const errs: Record<string, string> = {};

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errs.name = 'Full name is required (at least 2 characters)';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone must be exactly 10 digits';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Mobile number must start with 6, 7, 8, or 9';
    }

    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    const trimmedLocation = cityOrDistrict.trim();
    if (!trimmedLocation) {
      errs.location = 'Please specify your location or district';
    }

    if (estimatedWatts && (Number(estimatedWatts) <= 0 || Number(estimatedWatts) > 100000)) {
      errs.watts = 'Please enter a realistic estimated running load in Watts';
    }

    if (Object.keys(errs).length > 0) {
      setContactErrors(errs);
      setSubmissionError('Please correct the highlighted errors in the form.');
      return;
    }

    setContactErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: trimmedName,
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim() || undefined,
          cityOrDistrict: trimmedLocation,
          category,
          estimatedRunningWatts: estimatedWatts ? Number(estimatedWatts) : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register quotation inquiry');
      }

      setSubmissionSuccess({
        quotationNumber: data.quotation?.quotationNumber || 'RPS-QT-CONFIRMED',
        message: 'Your official quotation inquiry has been registered in our system.',
      });
    } catch (err) {
      setSubmissionError(
        err instanceof Error ? err.message : 'Submission failed. Please call or WhatsApp us directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-14 bg-[#F3F5F8] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Contact Us</span>
        </div>

        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55]">
            <Sparkles className="w-3.5 h-3.5 text-[#D52B30]" />
            Direct Support &amp; Technical Consultation
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142B55] tracking-tight">
            Get in Touch with RPS
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Direct access to executive technical leadership, verified equipment pricing, and doorstep delivery.
          </p>
        </motion.div>

        {/* 2-Column Layout: Direct Details on Left, Clean Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Business Information (Unique & Non-Duplicate) */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollRevealCard
              delay={0.05}
              className="bg-[#0B172F] text-white rounded-3xl p-6 sm:p-8 border border-[#142B55] shadow-xl space-y-6"
            >
              {/* Header Profile */}
              <div className="border-b border-slate-800 pb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#D52B30]">
                    Authorized Operations
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Operations
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {BUSINESS_INFO.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-slate-400">Leadership:</span>
                  <span className="text-white font-semibold">{BUSINESS_INFO.contactPerson}</span>
                </div>
              </div>

              {/* Contact Channels List */}
              <div className="space-y-4 text-xs">
                {/* 1. Phone */}
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 text-[#D52B30] flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Direct Phone Desk
                      </span>
                      <a
                        href={`tel:${BUSINESS_INFO.phoneTel}`}
                        className="text-sm font-bold text-white hover:text-red-400 transition-colors"
                      >
                        {BUSINESS_INFO.phoneFormatted}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`tel:${BUSINESS_INFO.phoneTel}`}
                    className="px-3 py-1.5 rounded-xl bg-[#D52B30] hover:bg-[#b82226] text-white font-bold text-[11px] shrink-0 self-center transition-colors"
                  >
                    Call Now
                  </a>
                </div>

                {/* 2. WhatsApp */}
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        WhatsApp Technical Desk
                      </span>
                      <span className="text-sm font-bold text-white block">
                        +91 93460 21289
                      </span>
                      <span className="text-[10px] text-emerald-400">Instant sizing &amp; appliance guidance</span>
                    </div>
                  </div>
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shrink-0 self-center transition-colors"
                  >
                    Chat
                  </a>
                </div>

                {/* 3. Email */}
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-start justify-between gap-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Official Inquiries
                      </span>
                      <a
                        href={`mailto:${BUSINESS_INFO.email}`}
                        className="text-xs font-bold text-white hover:text-sky-300 transition-colors truncate block"
                      >
                        {BUSINESS_INFO.email}
                      </a>
                    </div>
                  </div>
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] shrink-0 self-center transition-colors"
                  >
                    Email
                  </a>
                </div>

                {/* 4. Headquarters Location */}
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Secunderabad Headquarters
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {BUSINESS_INFO.address.full}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Working Hours & Scope Footer */}
              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Operating Hours:
                  </span>
                  <span className="text-white font-semibold">Mon – Sat: 9:30 AM – 7:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    Dispatch Coverage:
                  </span>
                  <span className="text-white font-semibold">Serviceable Delivery Areas</span>
                </div>
              </div>
            </ScrollRevealCard>
          </div>

          {/* Right Column: Clean, Modern Sizing & Quotation Form */}
          <div className="lg:col-span-7">
            <ScrollRevealCard
              delay={0.1}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Quotation &amp; Sizing Form</span>
                </div>
                <h2 className="text-2xl font-bold text-[#142B55]">
                  Request an Equipment Quotation
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Share your power backup requirement. Our Secunderabad engineering team generates verified model recommendations and competitive pricing.
                </p>
              </div>

              {submissionSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base text-emerald-950">
                        Inquiry Registered Successfully
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Official Reference: <strong className="font-mono text-sm">{submissionSuccess.quotationNumber}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {submissionSuccess.message} Our technical team will reach out via WhatsApp or phone to confirm equipment availability and site delivery details.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
                        `Hello RPS, I submitted quotation inquiry ${submissionSuccess.quotationNumber} on your website. Please share technical models and pricing.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Reference on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmissionSuccess(null)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuotationSubmit} noValidate className="space-y-4">
                  {submissionError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{submissionError}</span>
                    </div>
                  )}

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
                        placeholder="E.g., K. V. Sharma"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.name
                            ? 'border-red-500 bg-red-50/20 text-red-900 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.name && (
                        <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{contactErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone / WhatsApp Number * (10 Digits)
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
                        placeholder="93460XXXXX"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.phone
                            ? 'border-red-500 bg-red-50/20 text-red-900 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.phone && (
                        <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{contactErrors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="name@example.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.email
                            ? 'border-red-500 bg-red-50/20 text-red-900 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.email && (
                        <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{contactErrors.email}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Location / District *
                      </label>
                      <input
                        type="text"
                        value={cityOrDistrict}
                        onChange={(e) => {
                          setCityOrDistrict(e.target.value);
                          if (contactErrors.location) setContactErrors((p) => ({ ...p, location: '' }));
                        }}
                        placeholder="E.g., Secunderabad, Warangal, Karimnagar..."
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                          contactErrors.location
                            ? 'border-red-500 bg-red-50/20 text-red-900 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 focus:ring-2 focus:ring-[#142B55]'
                        }`}
                      />
                      {contactErrors.location && (
                        <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{contactErrors.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Product Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] transition-all"
                      >
                        <option value="Inverters & Battery Combo">Inverters &amp; Battery Combo</option>
                        <option value="Pure Sine Wave Inverters Only">Pure Sine Wave Inverters Only</option>
                        <option value="Tall Tubular Inverter Batteries Only">Tall Tubular Inverter Batteries Only</option>
                        <option value="Online / Line-Interactive UPS Systems">Online / Line-Interactive UPS Systems</option>
                        <option value="Solar-Ready Hybrid Inverters">Solar-Ready Hybrid Inverters</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estimated Running Load (Optional)
                      </label>
                      <input
                        type="number"
                        value={estimatedWatts}
                        onChange={(e) => setEstimatedWatts(e.target.value)}
                        placeholder="E.g., 600 Watts (Fans, Lights, TV)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Appliances or Requirements (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify specific appliances (e.g. 1 Refrigerator, Wi-Fi router, oxygen concentrator) or desired backup hours."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] transition-all"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      disabled={submitting}
                      className="bg-[#142B55] hover:bg-[#0B172F] text-white font-bold py-3 px-8 shadow-md"
                      icon={<Send className="w-4 h-4 ml-1.5" />}
                    >
                      {submitting ? 'Registering Quotation...' : 'Submit Quotation Request'}
                    </Button>
                    <span className="text-[11px] text-slate-400">
                      Directly routed to RPS technical engineering team.
                    </span>
                  </div>
                </form>
              )}
            </ScrollRevealCard>
          </div>
        </div>

        {/* Value Assurance Highlights Strip (3 concise, non-redundant items) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <ScrollRevealCard
            delay={0.15}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D52B30] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#142B55]">100% Certified Equipment</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                BIS compliant, ISO quality tested inverters, pure sine wave systems, and heavy-duty tubular batteries.
              </p>
            </div>
          </ScrollRevealCard>

          <ScrollRevealCard
            delay={0.2}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#142B55]">Prompt Doorstep Delivery</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Rapid transit dispatch from our Secunderabad hub with professional technician installation across serviceable areas.
              </p>
            </div>
          </ScrollRevealCard>

          <ScrollRevealCard
            delay={0.25}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#142B55]">Authorized Warranty Care</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Official manufacturer warranty registration and priority technician assistance for uninterrupted power.
              </p>
            </div>
          </ScrollRevealCard>
        </div>
      </div>
    </div>
  );
}
