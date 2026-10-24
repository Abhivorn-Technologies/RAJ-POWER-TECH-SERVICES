'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  Cpu,
  Terminal,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { slideFromLeft, slideFromRight, VIEWPORT_ONCE } from '@/lib/animations';

const POPULAR_PRODUCTS = [
  {
    group: '✨ Engineering Consultation',
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

export function QuotationCta() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('Let RPS Engineer Recommend Best Match for My Setup');
  const [selectedCategory, setSelectedCategory] = useState('Inverters & Battery Combo');
  const [powerNeed, setPowerNeed] = useState('Residential Home (Lights, Fans, TV, Refrigerator)');
  const [userLocation, setUserLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    quotationNumber: string;
    waUrl: string;
  } | null>(null);

  // Dynamic engineering manifest based on user input
  const getEngineeringSpecs = () => {
    switch (selectedCategory) {
      case 'Pure Sine Wave Inverters Only':
        return {
          capacity: '900VA - 2.5kVA',
          waveform: 'Pure Sine Wave (50Hz ± 0.5Hz)',
          topology: 'Microcontroller DSP Switched',
          latency: '< 8ms UPS Mode',
        };
      case 'Tall Tubular Inverter Batteries Only':
        return {
          capacity: '150Ah - 220Ah C10',
          waveform: 'DC Storage Buffer',
          topology: 'Spine-Cast Tall Tubular Plates',
          latency: 'Continuous Deep Cycle Discharge',
        };
      case 'Online / Line-Interactive UPS Systems':
        return {
          capacity: '1kVA - 10kVA Online',
          waveform: 'Pure Galvanic Isolated Sine Wave',
          topology: 'True Double Conversion IGBT',
          latency: '0.00ms (Zero Interruption)',
        };
      case 'Solar-Ready Hybrid Inverters':
        return {
          capacity: '1.5kVA - 5kVA Solar Hybrid',
          waveform: 'Synchronous Grid/Solar Sine Wave',
          topology: 'High Efficiency MPPT / PWM',
          latency: '< 10ms Priority Solar Switching',
        };
      default: // Combo
        return {
          capacity: '1100VA - 2000VA Combo',
          waveform: 'Pure Sine Wave Clean Output',
          topology: 'Integrated Smart Charger DSP',
          latency: '< 10ms Automatic Transfer',
        };
    }
  };

  const specs = getEngineeringSpecs();

  const handleDualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errs: Record<string, string> = {};
    const cleanName = customerName.trim();
    if (!cleanName || cleanName.length < 2) {
      errs.name = 'Please enter your full name';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Mobile number should start with 6, 7, 8, or 9';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // 1. Submit quotation request to database
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cleanName,
          customerPhone: cleanPhone,
          category: selectedCategory,
          cityOrDistrict: userLocation.trim() || 'Secunderabad / Hyderabad',
          notes: `Requested Model: ${selectedProduct} | Application: ${powerNeed} | Topology: ${specs.capacity} (${specs.waveform}) | Scope: Verified Installation`,
        }),
      });

      const data = await res.json();
      const qNum = data.quotation?.quotationNumber || `RPS-QT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      // 2. Build official WhatsApp inquiry message
      const rawMessage = `Hello Raj Power Tech Services (RPS),

I would like to request an official product quotation (Ref: #${qNum}):
• Name: ${cleanName}
• Mobile: +91 ${cleanPhone}
• Requested Model: ${selectedProduct}
• Equipment Category: ${selectedCategory}
• Application: ${powerNeed}
• Target Topology: ${specs.capacity}
• Delivery Location: ${userLocation.trim() || 'Secunderabad / Hyderabad'}

Please share formal pricing, warranty terms, and installation scope. Thank you!`;

      const waUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(rawMessage)}`;

      setSuccessData({
        quotationNumber: qNum,
        waUrl,
      });

      // 3. Automatically launch WhatsApp chat
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Offline fallback: still construct quote and open WhatsApp
      const fallbackQNum = `RPS-QT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const fallbackMsg = `Hello Raj Power Tech Services (RPS),

I would like to request an official product quotation:
• Name: ${cleanName}
• Mobile: +91 ${cleanPhone}
• Requested Model: ${selectedProduct}
• Equipment Category: ${selectedCategory}
• Application: ${powerNeed}
• Target Topology: ${specs.capacity}
• Delivery Location: ${userLocation.trim() || 'Secunderabad / Hyderabad'}`;

      const fallbackWaUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(fallbackMsg)}`;

      setSuccessData({
        quotationNumber: fallbackQNum,
        waUrl: fallbackWaUrl,
      });

      if (typeof window !== 'undefined') {
        window.open(fallbackWaUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedProduct('Let RPS Engineer Recommend Best Match for My Setup');
    setUserLocation('');
    setErrors({});
    setSubmitError(null);
  };

  return (
    <section className="py-20 bg-white text-slate-900 overflow-hidden border-t border-slate-100" id="quotation-section-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Industrial Credentials */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-[#142B55]">
              <Sparkles className="w-3.5 h-3.5 text-[#D52B30]" />
              <span>Official Quotation &amp; Sizing Desk</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Request a Certified Technical Quotation
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every home, clinic, and commercial facility has specific electrical surge demands. Submit your requirements below to receive verified equipment sizing and formal GST pricing directly on WhatsApp.
            </p>

            {/* Industrial Benefits List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="p-1.5 rounded-lg bg-blue-100 text-[#142B55] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Verified Electrical Load Sizing</h4>
                  <p className="text-xs text-slate-600">Our engineers calculate running watts and surge current to prevent premature inverter tripping.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Direct Line to Senior Leadership</h4>
                  <p className="text-xs text-slate-600">Personalized consultation with Mr. B. V. Raja Shekar Reddy ({BUSINESS_INFO.phoneFormatted}).</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Authorized Factory Warranty &amp; Doorstep Delivery</h4>
                  <p className="text-xs text-slate-600">Genuine distributor pricing with zero middleman markups across Hyderabad &amp; Secunderabad.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D52B30]" />
                <span className="font-mono font-bold text-slate-900">{BUSINESS_INFO.phoneFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#142B55]" />
                <span>Mon – Sat: 9:00 AM – 8:00 PM</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Clean White Form Card */}
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="lg:col-span-6"
          >
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#142B55]">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Power Backup Sizing Form</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instant response with verified technical parameters
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {successData ? (
                  /* SUCCESS STATE */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold block">
                        Quotation Request Confirmed
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">
                        Reference ID: #{successData.quotationNumber}
                      </h4>
                      <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                        Your inquiry has been registered. You can now chat directly with our technical specialist on WhatsApp.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <a
                        href={successData.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-cyan-300" />
                        <span>Connect with Specialist</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 inline-flex items-center gap-1.5 cursor-pointer font-semibold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Another Quotation</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* FORM STATE */
                  <motion.form
                    key="form"
                    onSubmit={handleDualSubmit}
                    noValidate
                    className="space-y-4"
                  >
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Name Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Reddy"
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] ${
                            errors.name ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {errors.name && <p className="text-red-600 text-[10px] mt-1">{errors.name}</p>}
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">+91</span>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            placeholder="93460XXXXX"
                            value={customerPhone}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setCustomerPhone(clean);
                              if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                            }}
                            className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] ${
                              errors.phone ? 'border-red-500' : 'border-slate-200'
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="text-red-600 text-[10px] mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Select Product / Model *</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Authorized 4-Brand Stock</span>
                      </label>
                      <select
                        suppressHydrationWarning
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] cursor-pointer"
                      >
                        {POPULAR_PRODUCTS.map((group) => (
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

                    {/* Category Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Equipment Category
                        </label>
                        <select
                          suppressHydrationWarning
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] cursor-pointer"
                        >
                          <option value="Inverters & Battery Combo">Inverters &amp; Battery Combo</option>
                          <option value="Pure Sine Wave Inverters Only">Pure Sine Wave Inverters Only</option>
                          <option value="Tall Tubular Inverter Batteries Only">Tall Tubular Inverter Batteries Only</option>
                          <option value="Online / Line-Interactive UPS Systems">Online / Line-Interactive UPS Systems</option>
                          <option value="Solar-Ready Hybrid Inverters">Solar-Ready Hybrid Inverters</option>
                        </select>
                      </div>

                      {/* Power Application */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Power Application
                        </label>
                        <select
                          suppressHydrationWarning
                          value={powerNeed}
                          onChange={(e) => setPowerNeed(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] cursor-pointer"
                        >
                          <option value="Residential Home (Lights, Fans, TV, Refrigerator)">
                            Residential Home
                          </option>
                          <option value="Home Office / Computer / Wi-Fi Router Setup">
                            Home Office / PC Setup
                          </option>
                          <option value="Retail Store / Billing Counter / CCTV System">
                            Retail &amp; Billing Counter
                          </option>
                          <option value="Medical Diagnostic / Critical Enterprise Equipment">
                            Medical &amp; Hospital Gear
                          </option>
                          <option value="Custom Commercial Setup">
                            Commercial High-Load Setup
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Location Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Delivery / Installation Area
                      </label>
                      <input
                        suppressHydrationWarning
                        type="text"
                        value={userLocation}
                        placeholder="e.g. Secunderabad, Hyderabad (500003)"
                        onChange={(e) => setUserLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#142B55] placeholder:text-slate-400"
                      />
                    </div>

                    {/* Product Quotation Manifest Summary */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-200">
                        <span className="flex items-center gap-1 text-[#142B55] font-bold">
                          <Cpu className="w-3.5 h-3.5 text-[#D52B30]" />
                          <span>Quotation Request Summary</span>
                        </span>
                        <span className="text-emerald-700 font-bold">READY TO TRANSMIT</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-slate-500 text-[11px] shrink-0">Selected Model:</span>
                          <span className="font-semibold text-slate-900 truncate text-right">{selectedProduct}</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-slate-500 text-[11px] shrink-0">Application:</span>
                          <span className="text-slate-700 font-medium truncate text-right">{powerNeed}</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-500">Warranty &amp; Service:</span>
                          <span className="text-emerald-700 font-bold text-right">Official Manufacturer Warranty + RPS Support</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Action Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        size="lg"
                        variant="primary"
                        fullWidth
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 py-4 cursor-pointer transition-all disabled:opacity-60"
                        icon={<Send className="w-4 h-4 ml-1" />}
                      >
                        {submitting ? 'Preparing Official Quotation...' : 'Request Official Quotation'}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
