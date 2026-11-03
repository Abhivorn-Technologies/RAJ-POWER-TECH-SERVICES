'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Plus,
  Minus,
  Building2,
  FileText,
  Clock,
  Sparkles,
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
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cityOrDistrict, setCityOrDistrict] = useState('Hyderabad / Secunderabad');
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [scope, setScope] = useState('Standard Installation');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    quotationNumber: string;
    whatsappUrl: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(defaultQuantity > 0 ? defaultQuantity : 1);
      setSuccessData(null);
      setSubmitError(null);
      setErrors({});
    }
  }, [isOpen, defaultQuantity, product]);

  // Handle ESC key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product || !mounted) return null;

  const priceValue = product.price || 0;
  const totalEstimatedPrice = priceValue * quantity;

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
      const combinedNotes = notes.trim()
        ? `Scope: ${scope} | Note: ${notes.trim()}`
        : `Scope: ${scope}`;

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
          notes: combinedNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quotation request');
      }

      const qNum = data.quotation?.quotationNumber || `RPS-QT-${Date.now().toString().slice(-4)}`;

      // 2. Build full quotation consultation WhatsApp link
      const waUrl = buildDetailedQuotationWhatsAppUrl({
        quotationNumber: qNum,
        customerName: cleanName,
        customerPhone: cleanPhone,
        productName: product.name,
        category: product.category,
        quantity,
        price: priceValue,
        cityOrDistrict: cleanLocation,
        notes: combinedNotes,
      });

      setSuccessData({
        quotationNumber: qNum,
        whatsappUrl: waUrl,
        productName: product.name,
        quantity,
        totalAmount: totalEstimatedPrice,
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
    setCityOrDistrict('Hyderabad / Secunderabad');
    setQuantity(1);
    setScope('Standard Installation');
    setNotes('');
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReset();
      }}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 md:p-8 space-y-5 shadow-2xl relative my-6 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#142B55] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#142B55] shrink-0" />
              <span>Official Product Quotation Desk</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#142B55]">
              Request Product Price Quotation
            </h3>
            <p className="text-xs text-slate-500">
              Direct technical pricing, volume discounts &amp; verified GST quotation from Secunderabad Central Hub
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            aria-label="Close quotation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1">
          {successData ? (
            /* SUCCESS STATE */
            <div className="p-6 sm:p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-950 space-y-5 text-center my-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                  Quotation Docket Generated
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-emerald-950">
                  Quotation Request Successfully Recorded!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1.5">
                  Reference ID: <strong className="font-mono text-base font-bold bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">{successData.quotationNumber}</strong>
                </p>
              </div>

              {/* Product summary card */}
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 text-xs text-slate-800 text-left space-y-2 max-w-lg mx-auto shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Selected Equipment:</span>
                  <span className="font-bold text-[#142B55] text-right truncate max-w-[240px]">
                    {successData.productName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Quoted Units:</span>
                  <span className="font-mono font-bold text-slate-900">{successData.quantity} Unit(s)</span>
                </div>
                {successData.totalAmount > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-500">Estimated Total:</span>
                    <span className="font-mono font-extrabold text-[#142B55] text-sm">
                      ₹{successData.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-emerald-100/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 text-left space-y-1 max-w-lg mx-auto">
                <p>
                  • <strong>Central Technical Desk:</strong> Inward inquiry registered in RPS dispatch system.
                </p>
                <p>
                  • <strong>Direct Support Specialist:</strong> Connected to Secunderabad Engineers ({BUSINESS_INFO.phoneFormatted}).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <a
                  href={successData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-5 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
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
                  className="text-xs font-semibold py-3 px-5 rounded-xl cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            /* FORM STATE - SPACIOUS 2-COLUMN BIG POPUP */
            <form onSubmit={handleSubmit} noValidate className="space-y-5 text-xs">
              {submitError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left Column: Default Selection of That Particular Product */}
                <div className="md:col-span-5 bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Selected Equipment
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>In Stock • Secunderabad</span>
                    </span>
                  </div>

                  {/* Product Image Frame */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl bg-white p-3 border border-slate-200/80 flex items-center justify-center overflow-hidden shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl || '/products/inverter-demo-1.jpg'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/products/inverter-demo-1.jpg';
                      }}
                    />
                  </div>

                  {/* Brand, Title & SKU */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#D52B30] uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {product.sku || product.id}
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200/60 ml-auto capitalize">
                        {product.categoryName || product.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {product.name}
                    </h4>
                  </div>

                  {/* Pricing & Interactive Quantity Box */}
                  <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                          Unit Catalogue Price
                        </span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {priceValue > 0 ? `₹${priceValue.toLocaleString('en-IN')}` : 'Request Quote'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">GST Inclusive</span>
                      </div>

                      {/* Interactive Quantity Stepper */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                          Units Required
                        </span>
                        <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-900 text-xs">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors shadow-2xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {priceValue > 0 && (
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Estimated Total:</span>
                        <span className="font-black text-[#142B55] text-base font-mono">
                          ₹{totalEstimatedPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Trust Features */}
                  <div className="text-[11px] text-slate-500 space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Genuine OEM Stock with Direct Warranty</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#142B55] shrink-0" />
                      <span>GST Invoices for Personal &amp; Corporate Purchasing</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer Details & Form */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <div>
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
                        className={`w-full px-3.5 py-2.5 border rounded-xl transition-colors text-xs ${
                          errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#142B55]'
                        }`}
                      />
                      {errors.name && <p className="text-red-600 text-[11px] mt-0.5">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                          WhatsApp / Mobile *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-xs">+91</span>
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
                            className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl font-mono text-xs transition-colors ${
                              errors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#142B55]'
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="text-red-600 text-[11px] mt-0.5">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                          Deployment Scope *
                        </label>
                        <select
                          value={scope}
                          onChange={(e) => setScope(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:border-[#142B55] cursor-pointer"
                        >
                          <option value="Standard Installation">Standard Installation</option>
                          <option value="Commercial Turnkey Setup">Commercial Turnkey Setup</option>
                          <option value="Critical UPS 0ms Backup">Critical UPS 0ms Backup</option>
                          <option value="Buyback / Battery Exchange">Buyback / Battery Exchange</option>
                          <option value="Custom Engineering Project">Custom Engineering Project</option>
                        </select>
                      </div>
                    </div>

                    <div>
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
                        className={`w-full px-3.5 py-2.5 border rounded-xl transition-colors text-xs ${
                          errors.location ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#142B55]'
                        }`}
                      />
                      {errors.location && <p className="text-red-600 text-[11px] mt-0.5">{errors.location}</p>}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        Requirement Notes / Application (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Need backup for 3 fans, 1 PC, and refrigerator. Inquire about buyback value on old battery."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] text-xs"
                      />
                    </div>
                  </div>

                  {/* Consultation Banner */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center gap-2.5 text-[11px] text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Verified RPS Secunderabad Proposal:</strong> Your quotation is generated instantly and delivered via WhatsApp with GST invoices &amp; scheduled technician dispatch.
                    </span>
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#142B55] hover:bg-[#0B172F] shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 text-[#D52B30] shrink-0" />
                      <span className="whitespace-nowrap">{submitting ? 'Preparing Official Quotation...' : 'Submit Quotation Request'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
