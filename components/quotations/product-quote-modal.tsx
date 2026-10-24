'use client';

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { buildDetailedQuotationWhatsAppUrl } from '@/lib/utils';
import { BUSINESS_INFO } from '@/lib/constants';

interface ProductQuoteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  defaultQuantity?: number;
}

export function ProductQuoteModal({
  product,
  isOpen,
  onClose,
  defaultQuantity = 1,
}: ProductQuoteModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cityOrDistrict, setCityOrDistrict] = useState('Hyderabad');
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    quotationNumber: string;
    whatsappUrl: string;
  } | null>(null);

  if (!isOpen || !product) return null;

  const priceValue = product.price || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs: Record<string, string> = {};

    const cleanName = customerName.trim();
    if (!cleanName || cleanName.length < 2) {
      errs.name = 'Please enter your full name';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Please enter your mobile number';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Mobile number should start with 6, 7, 8, or 9';
    }

    const cleanLocation = cityOrDistrict.trim();
    if (!cleanLocation) {
      errs.location = 'Please specify your area, city, or pincode';
    }

    if (quantity < 1) {
      errs.quantity = 'Quantity must be at least 1';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // 1. Send quotation request to Admin database
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cleanName,
          customerPhone: cleanPhone,
          cityOrDistrict: cleanLocation,
          category: product.category,
          productId: product.id,
          quantity,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quotation request');
      }

      const qNum = data.quotation?.quotationNumber || `RPS-QT-${Date.now().toString().slice(-4)}`;

      // 2. Build full quotation consultation link
      const waUrl = buildDetailedQuotationWhatsAppUrl({
        quotationNumber: qNum,
        customerName: cleanName,
        customerPhone: cleanPhone,
        productName: product.name,
        category: product.category,
        quantity,
        price: priceValue,
        cityOrDistrict: cleanLocation,
        notes: notes.trim() || undefined,
      });

      setSuccessData({
        quotationNumber: qNum,
        whatsappUrl: waUrl,
      });

      // 3. Immediately launch consultation chat in a new tab
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to record quotation request. Please call our technical desk directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setCustomerName('');
    setCustomerPhone('');
    setCityOrDistrict('Hyderabad');
    setQuantity(1);
    setNotes('');
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#142B55] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#142B55] shrink-0" />
              <span>Official Product Quotation Desk</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#142B55]">
              Request Product Price Quotation
            </h3>
            <p className="text-xs text-slate-500">
              Direct consultation &amp; technical pricing with RPS Secunderabad Hub
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            aria-label="Close quotation modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {successData ? (
            /* SUCCESS STATE */
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950">
                  Product Quotation Request Recorded!
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Reference ID: <strong className="font-mono text-sm">{successData.quotationNumber}</strong>
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200/80 text-xs text-slate-700 text-left space-y-1">
                <p>
                  • <strong>Central Technical Desk:</strong> Inward inquiry registered for engineering verification.
                </p>
                <p>
                  • <strong>Direct Support Line:</strong> Connected to RPS Technical Specialists ({BUSINESS_INFO.phoneFormatted}).
                </p>
              </div>

              <p className="text-xs text-slate-600">
                You can connect directly with our engineering desk to finalize your quotation:
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={successData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-300" />
                  <span>Connect with Specialist</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Product Dossier Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl || '/products/inverter-demo-1.jpg'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/products/inverter-demo-1.jpg';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#D52B30] uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                      {product.sku || product.id}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 truncate mt-0.5">
                    {product.name}
                  </h4>
                  {priceValue > 0 && (
                    <span className="text-xs font-extrabold text-[#142B55] block mt-0.5">
                      Catalogue: ₹{priceValue.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Reddy"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-red-600 text-[11px] mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Mobile / Contact Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-semibold text-xs">+91</span>
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
                      className={`w-full pl-10 pr-3 py-2 border rounded-xl font-mono text-xs transition-colors ${
                        errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-600 text-[11px] mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Requirement Scope *
                  </label>
                  <select
                    value={notes.startsWith('Scope: ') ? notes.split(' | ')[0].replace('Scope: ', '') : 'Standard Installation'}
                    onChange={(e) => {
                      const scope = e.target.value;
                      setNotes((prev) => {
                        const rest = prev.includes(' | ') ? prev.split(' | ')[1] : '';
                        return rest ? `Scope: ${scope} | ${rest}` : `Scope: ${scope}`;
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#142B55]"
                  >
                    <option value="Standard Installation">Standard Installation</option>
                    <option value="Commercial Turnkey Setup">Commercial Turnkey Setup</option>
                    <option value="Critical UPS Backup">Critical UPS Backup</option>
                    <option value="Custom Engineering Project">Custom Engineering Project</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Delivery Area / Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijaya Nagar Colony, Picket, Secunderabad - 500009"
                    value={cityOrDistrict}
                    onChange={(e) => {
                      setCityOrDistrict(e.target.value);
                      if (errors.location) setErrors((p) => ({ ...p, location: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-xl transition-colors ${
                      errors.location ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.location && <p className="text-red-600 text-[11px] mt-0.5">{errors.location}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Requirement Notes / Application (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need backup for 3 fans, 1 PC, and refrigerator. Inquire about buyback on old battery."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                </div>
              </div>

              {/* Verified Technical Desk Notice */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-[11px] text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Authorized Engineering Consultation:</strong> Inquiries are logged directly with our technical desk for verified capacity calculations and formal pricing.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="bg-[#142B55] hover:bg-[#0B172F] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
                >
                  {submitting ? 'Submitting Quotation Request...' : 'Submit Quotation Request'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
