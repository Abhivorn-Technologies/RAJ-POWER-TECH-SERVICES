'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Store,
  CreditCard,
  Banknote,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  CartItem,
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  clearGuestCart,
  getCartSubtotal,
} from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BUSINESS_INFO } from '@/lib/constants';

interface ServiceabilityResult {
  serviceable: boolean;
  pincode: string;
  district?: string;
  state?: string;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  message?: string;
  notes?: string;
}

interface OrderConfirmation {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee?: number;
  paymentMethod?: string;
  paymentStatus: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    line1: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  items: {
    id: string;
    productName: string;
    vendorName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  createdAt: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Serviceability check state
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const [serviceResult, setServiceResult] = useState<ServiceabilityResult | null>(null);

  // Guest Checkout form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online_gateway'>('cod');

  // Checkout submission state
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setItems(getGuestCart());
    }, 0);
    const syncCart = () => {
      setItems(getGuestCart());
    };
    window.addEventListener('rps-cart-updated', syncCart);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('rps-cart-updated', syncCart);
    };
  }, []);

  // Check PIN serviceability
  const checkPincode = async (codeToCheck?: string) => {
    const code = (codeToCheck || pincodeQuery || pincode).trim();
    if (!code || code.length !== 6) return;

    try {
      setCheckingServiceability(true);
      const res = await fetch(`/api/serviceability?pincode=${encodeURIComponent(code)}`);
      const data = await res.json();
      setServiceResult(data);
      if (data.serviceable) {
        if (!city.trim() && data.district) {
          setCity(data.district);
        }
        if (!customerState.trim() && data.state) {
          setCustomerState(data.state);
        }
      }
    } catch {
      setServiceResult({
        serviceable: false,
        pincode: code,
        message: 'Could not connect to serviceability network. Please try again.',
      });
    } finally {
      setCheckingServiceability(false);
    }
  };

  // Group items by Vendor (Multi-Vendor cart grouping)
  const itemsByVendor = items.reduce<Record<string, { vendorName: string; items: CartItem[] }>>(
    (acc, item) => {
      const vId = item.vendorId || 'ven-rps-primary';
      if (!acc[vId]) {
        acc[vId] = {
          vendorName: item.vendorName || 'RAJ POWER TECH ENTERPRISES',
          items: [],
        };
      }
      acc[vId].items.push(item);
      return acc;
    },
    {}
  );

  const subtotal = getCartSubtotal(items);
  const isFreeDelivery = subtotal >= (serviceResult?.freeDeliveryThreshold ?? 0);
  const deliveryFee = serviceResult?.serviceable
    ? isFreeDelivery
      ? 0
      : (serviceResult.deliveryFee ?? 0)
    : 0;
  const grandTotal = subtotal + (items.length > 0 && serviceResult?.serviceable ? deliveryFee : 0);

  // Submit Guest Checkout
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    const errs: Record<string, string> = {};

    if (items.length === 0) {
      setCheckoutError('Your shopping bag is empty. Please add items before checking out.');
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errs.fullName = 'Full name is required (min 2 characters)';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone must be exactly 10 digits';
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = 'Phone must start with 6, 7, 8, or 9';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please provide a valid email address';
      }
    }

    if (!line1.trim() || line1.trim().length < 5) {
      errs.line1 = 'Please provide complete street / premises address (min 5 characters)';
    }

    if (!city.trim()) {
      errs.city = 'City / locality is required';
    }

    if (!customerState.trim()) {
      errs.customerState = 'State is required';
    }

    const cleanPin = pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.pincode = 'PIN code must be exactly 6 digits';
    } else if (serviceResult && !serviceResult.serviceable && serviceResult.pincode === cleanPin) {
      errs.pincode = serviceResult.message || 'Delivery is currently unavailable for this PIN code.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setCheckoutError('Please correct the highlighted validation errors below.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          district: serviceResult?.district || city.trim(),
          state: customerState.trim() || serviceResult?.state || 'India',
          pincode: pincode.trim(),
        },
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
        paymentMethod: paymentMethod === 'online_gateway' ? 'online_gateway' : 'cod',
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout allocation failed');
      }

      // Success: Clear guest cart and show official confirmation
      clearGuestCart();
      setOrderConfirmation(data.order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#142B55] mb-2" />
        <p className="text-sm font-semibold">Loading shopping bag...</p>
      </div>
    );
  }

  // 1. Order Placed Confirmation View
  if (orderConfirmation) {
    return (
      <div className="py-14 bg-[#F3F5F8] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Order Confirmed &amp; Stock Allocated
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B55] mt-2">
                Thank You for Choosing RPS!
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Your power backup order reference is:{' '}
                <strong className="text-[#142B55] font-mono text-base">{orderConfirmation.orderNumber}</strong>
              </p>
            </div>

            {/* Order Details Receipt Card */}
            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold text-slate-500">Payment Status:</span>
                <Badge variant="warning">{orderConfirmation.paymentStatus.toUpperCase()}</Badge>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold text-slate-500">Payment Mode:</span>
                <span className="text-xs font-bold text-slate-800">{orderConfirmation.paymentMethod}</span>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Delivering To:</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  <strong>{orderConfirmation.customer.fullName}</strong> ({orderConfirmation.customer.phone})
                  <br />
                  {orderConfirmation.customer.line1}, {orderConfirmation.customer.city},{' '}
                  {orderConfirmation.customer.state} — {orderConfirmation.customer.pincode}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 block">Allocated Equipment:</span>
                {orderConfirmation.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-800 font-medium">
                      {it.quantity}x {it.productName}
                    </span>
                    <span className="text-slate-900 font-bold">₹{it.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-bold text-[#142B55]">Grand Total:</span>
                <span className="font-extrabold text-[#142B55] text-lg">
                  ₹{orderConfirmation.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50/70 rounded-xl p-4 text-xs text-slate-700 text-left border border-blue-100 flex items-start gap-3">
              <Truck className="w-4 h-4 text-[#142B55] shrink-0 mt-0.5" />
              <span>
                <strong>Next Step:</strong> Our Secunderabad engineering desk will verify voltage compatibility and coordinate safe delivery to your premises. For any immediate assistance, call <strong>{BUSINESS_INFO.phoneFormatted}</strong>.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/shop">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
                  Continue Shopping
                </Button>
              </Link>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(`Hello RPS, I placed order ${orderConfirmation.orderNumber} for ₹${orderConfirmation.totalAmount}. Please confirm dispatch ETA.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md">
                  WhatsApp Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart View
  if (items.length === 0) {
    return (
      <div className="py-16 bg-[#F3F5F8]/70 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Shopping Bag</span>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#142B55] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B55]">
              Your Shopping Bag is Empty
            </h1>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Explore our verified pure sine wave inverters, high-cycle tubular batteries, and enterprise UPS systems.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/shop">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
                  Browse Catalog
                </Button>
              </Link>
              <Link href="/certifications">
                <Button variant="outline" size="md">
                  View Certifications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Multi-Vendor Cart & Guest Checkout View
  return (
    <div className="py-10 bg-[#F3F5F8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Shopping Bag &amp; Guest Checkout</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B55]">
              Shopping Bag &amp; Doorstep Delivery
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Multi-vendor power backup equipment with server-validated pricing and stock reservations.
            </p>
          </div>
          <button
            onClick={() => clearGuestCart()}
            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Multi-Vendor Item Groups & Checkout Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items Grouped by Vendor */}
            {Object.entries(itemsByVendor).map(([vendorId, vendorGroup]) => (
              <div
                key={vendorId}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Vendor Header */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#142B55]" />
                    <span className="text-xs font-bold text-slate-800">
                      Fulfilled by: <strong className="text-[#142B55]">{vendorGroup.vendorName}</strong>
                    </span>
                  </div>
                  <Badge variant="navy" size="sm">
                    {vendorGroup.items.length} {vendorGroup.items.length === 1 ? 'Item' : 'Items'}
                  </Badge>
                </div>

                {/* Vendor Items */}
                <div className="divide-y divide-slate-100 p-4 sm:p-5">
                  {vendorGroup.items.map((item) => (
                    <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center p-2">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D52B30] block">
                          {item.category}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900 truncate">{item.name}</h2>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-[#142B55]">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-500">per unit</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateGuestCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateGuestCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromGuestCart(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Guest Shipping Address & Checkout Form */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#142B55]">
                    Delivery Address (Guest Checkout)
                  </h2>
                  <p className="text-xs text-slate-500">
                    No account required. Orders are fulfilled directly to your premises.
                  </p>
                </div>
                <Badge variant="navy">GUEST</Badge>
              </div>

              {checkoutError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} id="checkout-form" noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B. V. Raja Shekar"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: '' }));
                      }}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-lg border transition-colors ${
                        fieldErrors.fullName
                          ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55]'
                      } focus:outline-none`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number * (10 Digits)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9346021289"
                      value={phone}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(clean);
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: '' }));
                      }}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-lg border transition-colors ${
                        fieldErrors.phone
                          ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55]'
                      } focus:outline-none`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (For Order Receipts)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. customer@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-lg border transition-colors ${
                      fieldErrors.email
                        ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                        : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55]'
                    } focus:outline-none`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    House / Plot / Building Address *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plot No: 12A, Vijaya Nagar Colony, Picket"
                    value={line1}
                    onChange={(e) => {
                      setLine1(e.target.value);
                      if (fieldErrors.line1) setFieldErrors((p) => ({ ...p, line1: '' }));
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-lg border transition-colors ${
                      fieldErrors.line1
                        ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                        : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55]'
                    } focus:outline-none`}
                  />
                  {fieldErrors.line1 && (
                    <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.line1}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Apartment / Suite (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Block B"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Community Hall"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Locality *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Secunderabad"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (fieldErrors.city) setFieldErrors((p) => ({ ...p, city: '' }));
                      }}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-lg border transition-colors ${
                        fieldErrors.city
                          ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55]'
                      } focus:outline-none`}
                    />
                    {fieldErrors.city && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.city}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Andhra Pradesh, Karnataka, Maharashtra..."
                      value={customerState}
                      onChange={(e) => {
                        setCustomerState(e.target.value);
                        if (fieldErrors.customerState) setFieldErrors((p) => ({ ...p, customerState: '' }));
                      }}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-lg border ${
                        fieldErrors.customerState ? 'border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#142B55]'
                      } text-slate-900 font-medium`}
                    />
                    {fieldErrors.customerState && (
                      <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.customerState}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PIN Code * (6 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 500003"
                      value={pincode}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPincode(clean);
                        setPincodeQuery(clean);
                        if (fieldErrors.pincode) setFieldErrors((p) => ({ ...p, pincode: '' }));
                        if (clean.length === 6) {
                          checkPincode(clean);
                        }
                      }}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-lg border transition-colors ${
                        fieldErrors.pincode || (serviceResult && !serviceResult.serviceable && serviceResult.pincode === pincode)
                          ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55]'
                      } focus:outline-none font-mono`}
                    />
                    {fieldErrors.pincode ? (
                      <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.pincode}</span>
                      </p>
                    ) : serviceResult && !serviceResult.serviceable && serviceResult.pincode === pincode ? (
                      <p className="text-[11px] text-red-600 font-medium mt-1 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{serviceResult.message}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Call before arrival; residential 3rd floor with lift access."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55] focus:outline-none"
                  />
                </div>

                {/* Payment Selection */}
                <div className="pt-2">
                  <span className="block text-xs font-semibold text-slate-700 mb-2">
                    Payment Method *
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#142B55] bg-blue-50/50 ring-1 ring-[#142B55]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-0.5 text-[#142B55]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pay cash or UPI directly to technician upon equipment delivery.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'online_gateway'
                          ? 'border-[#142B55] bg-blue-50/50 ring-1 ring-[#142B55]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'online_gateway'}
                        onChange={() => setPaymentMethod('online_gateway')}
                        className="mt-0.5 text-[#142B55]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <CreditCard className="w-4 h-4 text-[#142B55]" />
                          <span>Online Payment Gateway</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Cards, NetBanking, UPI (Secure staged server integration).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Serviceability Checker & Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* PIN Code Serviceability Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#142B55]">
                <Truck className="w-4 h-4 text-[#D52B30]" />
                <span>Delivery Serviceability Check</span>
              </div>
              <p className="text-xs text-slate-600">
                Verify official delivery eligibility for your postal area:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code"
                  value={pincodeQuery}
                  onChange={(e) => setPincodeQuery(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#142B55] font-mono"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => checkPincode()}
                  disabled={checkingServiceability}
                  className="text-xs font-semibold"
                >
                  {checkingServiceability ? 'Checking...' : 'Verify'}
                </Button>
              </div>

              {serviceResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    serviceResult.serviceable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {serviceResult.serviceable ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Serviceable in {serviceResult.district}{serviceResult.state ? `, ${serviceResult.state}` : ''}!</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Delivery Charge: <strong>₹{serviceResult.deliveryFee}</strong>{' '}
                        {isFreeDelivery && <span className="underline">(Free delivery applied!)</span>}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Address Not Serviceable</span>
                      </div>
                      <p className="text-[11px] text-red-700">{serviceResult.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary & Placement */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <h2 className="text-base font-bold text-[#142B55] border-b border-slate-100 pb-3">
                Order Financial Summary
              </h2>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Equipment Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-bold text-slate-900">
                    {!serviceResult ? (
                      <span className="text-slate-500 font-normal">Calculated with PIN code</span>
                    ) : !serviceResult.serviceable ? (
                      <span className="text-red-600 font-semibold">Unserviceable</span>
                    ) : deliveryFee === 0 ? (
                      <span className="text-emerald-600 uppercase font-extrabold">FREE</span>
                    ) : (
                      `₹${deliveryFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                {isFreeDelivery && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                    ✓ Free delivery unlocked (Order value exceeds ₹50,000 threshold).
                  </p>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
                  <span className="font-extrabold text-[#142B55]">Total Payable:</span>
                  <span className="font-extrabold text-[#142B55] text-xl">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                form="checkout-form"
                variant="primary"
                size="lg"
                fullWidth
                disabled={submittingOrder}
                className="bg-[#D52B30] hover:bg-[#b52226] text-white font-bold py-3.5 shadow-md"
                icon={
                  submittingOrder ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-1" />
                  )
                }
              >
                {submittingOrder ? 'Reserving Stock...' : 'Confirm & Place Order'}
              </Button>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Concurrency-safe atomic inventory reservation guaranteed.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#142B55]" />
                  <span>Secunderabad Central Warehouse Dispatch.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
