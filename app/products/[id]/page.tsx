'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Truck,
  MessageSquare,
  ShoppingBag,
  Zap,
  MapPin,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addToGuestCart } from '@/lib/cart-store';
import { buildWhatsAppInquiryUrl, cn } from '@/lib/utils';
import { ProductQuoteModal } from '@/components/quotations/product-quote-modal';

function ProductDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Cart & Quantity state
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Delivery PIN checker state
  const [pinCode, setPinCode] = useState('');
  const [pinChecking, setPinChecking] = useState(false);
  const [pinResult, setPinResult] = useState<{ serviceable: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Product not found');
        }
        setProduct(data.product);
        setSelectedImage(data.product.imageUrl || '/products/bpe-online-ups-hq.png');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const priceValue = product.price || 0;
    addToGuestCart(
      {
        productId: product.id,
        name: product.name,
        price: priceValue,
        image: product.imageUrl,
        category: product.category,
        vendorId: product.vendorId || 'ven-rps-primary',
        vendorName: product.vendorName || 'RAJ POWER TECH ENTERPRISES',
        stock: product.stock || 10,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const handleCheckDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || pinCode.trim().length !== 6) {
      setPinResult({ serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }

    setPinChecking(true);
    setPinResult(null);

    try {
      const res = await fetch(`/api/serviceability?pincode=${encodeURIComponent(pinCode.trim())}`);
      const data = await res.json();
      if (data.serviceable) {
        setPinResult({
          serviceable: true,
          message: `Delivery & certified installation available in ${data.district || 'your location'} (${data.deliveryDays || '1-3 Business Days'}).`,
        });
      } else {
        setPinResult({
          serviceable: false,
          message:
            data.message ||
            'Delivery is currently unavailable for this PIN code. Please enter an eligible delivery PIN code or contact our sales & support team.',
        });
      }
    } catch {
      setPinResult({
        serviceable: false,
        message: 'Could not verify delivery serviceability. Please check your connection and try again.',
      });
    } finally {
      setPinChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 bg-[#F3F5F8]">
        <RefreshCw className="w-9 h-9 animate-spin text-[#142B55] mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading Power Backup Equipment Details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#F3F5F8] text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Equipment Model Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested product could not be located in our catalog.'}</p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => router.push('/shop')}
            className="bg-[#142B55] text-white"
          >
            Browse All Solutions
          </Button>
        </div>
      </div>
    );
  }

  const priceValue = product.price || 0;
  const whatsappUrl = buildWhatsAppInquiryUrl(product.name, product.categoryName);
  const images = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <div className="py-8 sm:py-12 bg-[#F3F5F8] min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#142B55] transition-colors font-medium">
            Solutions
          </Link>
          <span>/</span>
          <Link href={`/categories/${product.category}`} className="hover:text-[#142B55] transition-colors font-medium capitalize">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery & Trust Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Main Image Container */}
            <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center p-6 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage || '/products/bpe-online-ups-hq.png'}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/products/bpe-online-ups-hq.png';
                }}
              />
              <div className="absolute top-3 left-3">
                <Badge variant={product.stock && product.stock > 0 ? 'success' : 'warning'}>
                  {product.availability || 'In Stock'}
                </Badge>
              </div>
            </div>

            {/* Thumbnail Carousel / Selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 bg-slate-50 p-1 cursor-pointer transition-all ${
                      selectedImage === img
                        ? 'border-[#142B55] shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurances Under Gallery */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Manufacturer Warranty</span>
                  <span className="text-[11px] text-slate-500">Genuine brand on-site service</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Express Delivery</span>
                  <span className="text-[11px] text-slate-500">Telangana &amp; Andhra Pradesh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs, Sizing & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand, Category & SKU Row */}
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-[#142B55] text-white">
                    {product.brand}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {product.categoryName}
                  </span>
                </div>
                {product.sku && (
                  <span className="font-mono text-slate-400 text-[11px]">SKU: {product.sku}</span>
                )}
              </div>

              {/* Product Headline */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B55] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Short Summary Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Commercial Price Display */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ex-Showroom Price (Inclusive of GST)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-[#D52B30] tracking-tight">
                      ₹{priceValue.toLocaleString('en-IN')}
                    </span>
                    {product.comparePrice && product.comparePrice > priceValue && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-emerald-700 block">✓ Official GST Invoice Included</span>
                  <span className="text-[11px] text-slate-400">Tax Invoice &amp; Official Warranty Included</span>
                </div>
              </div>

              {/* Key Features / Specs Pills */}
              {product.keySpecs && product.keySpecs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Core Technical Specifications
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {product.keySpecs.map((spec, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{spec.label}</span>
                        <span className="font-bold text-slate-900 block truncate">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Delivery PIN Code Checker */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D52B30]" />
                  <span>Check Delivery &amp; Installation Serviceability</span>
                </label>
                <form onSubmit={handleCheckDelivery} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 500003)"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55]"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={pinChecking}
                    className="text-xs font-bold border-slate-300 hover:bg-[#142B55] hover:text-white"
                  >
                    {pinChecking ? 'Checking...' : 'Check'}
                  </Button>
                </form>
                {pinResult && (
                  <p
                    className={`text-xs font-semibold flex items-start gap-1.5 pt-1 ${
                      pinResult.serviceable ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {pinResult.serviceable ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{pinResult.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Purchase & Action Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleAddToCart}
                  className={cn(
                    'text-sm font-bold py-3 rounded-xl transition-all shadow-md',
                    added
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      : 'bg-[#142B55] hover:bg-[#0B172F] text-white shadow-[#142B55]/20'
                  )}
                  icon={added ? <Check className="w-4 h-4 animate-bounce" /> : <ShoppingBag className="w-4 h-4" />}
                >
                  {added ? 'Added to Bag ✓' : `Add to Bag (${quantity} Unit${quantity > 1 ? 's' : ''})`}
                </Button>
              </div>

              {/* Consultation & Commercial Quote Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 font-bold rounded-xl py-2.5"
                    icon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
                  >
                    Direct Technical Inquiry
                  </Button>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setQuoteModalOpen(true)}
                  className="text-xs text-[#142B55] border-slate-200 hover:bg-slate-50 font-bold rounded-xl py-2.5 cursor-pointer"
                  icon={<FileText className="w-4 h-4 text-[#D52B30]" />}
                >
                  Request Official Quotation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Technical Specifications & Load Matrix Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Zap className="w-5 h-5 text-[#D52B30]" />
            <h2 className="text-xl font-extrabold text-[#142B55]">Engineering &amp; Technical Datasheet</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Left specs table */}
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                Electrical Parameters &amp; Architecture
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                <div className="flex justify-between p-3 bg-slate-50/60">
                  <span className="text-slate-500 font-medium">Equipment Brand</span>
                  <span className="font-bold text-slate-900">{product.brand}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-slate-500 font-medium">Category / Solution</span>
                  <span className="font-bold text-slate-900 capitalize">{product.categoryName}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50/60">
                  <span className="text-slate-500 font-medium">Model Code</span>
                  <span className="font-mono font-bold text-slate-900">{product.sku || product.id}</span>
                </div>
                {product.technicalSpecs?.specs && (
                  <>
                    {'vaRating' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">Apparent Power Rating</span>
                        <span className="font-bold text-slate-900">{product.technicalSpecs.specs.vaRating} VA</span>
                      </div>
                    )}
                    {'wattageCapacity' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3 bg-slate-50/60">
                        <span className="text-slate-500 font-medium">Active Wattage Capacity</span>
                        <span className="font-bold text-slate-900">{product.technicalSpecs.specs.wattageCapacity} Watts</span>
                      </div>
                    )}
                    {'nominalBatteryVoltage' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">Nominal DC Battery Bank</span>
                        <span className="font-bold text-slate-900">{product.technicalSpecs.specs.nominalBatteryVoltage}</span>
                      </div>
                    )}
                    {'waveform' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3 bg-slate-50/60">
                        <span className="text-slate-500 font-medium">Output Waveform</span>
                        <span className="font-bold text-[#D52B30]">{product.technicalSpecs.specs.waveform}</span>
                      </div>
                    )}
                    {'capacityAh' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">Battery Ampere-Hour Rating</span>
                        <span className="font-bold text-slate-900">{product.technicalSpecs.specs.capacityAh} Ah</span>
                      </div>
                    )}
                    {'plateTechnology' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3 bg-slate-50/60">
                        <span className="text-slate-500 font-medium">Lead Plate Technology</span>
                        <span className="font-bold text-slate-900">{product.technicalSpecs.specs.plateTechnology}</span>
                      </div>
                    )}
                    {'warrantyMonths' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">Warranty Duration</span>
                        <span className="font-bold text-emerald-700">{product.technicalSpecs.specs.warrantyMonths} Months</span>
                      </div>
                    )}
                    {'topology' in product.technicalSpecs.specs && (
                      <div className="flex justify-between p-3">
                        <span className="text-slate-500 font-medium">UPS Topology</span>
                        <span className="font-bold text-slate-900">{product.technicalSpecs.specs.topology}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right load calculation & application */}
            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                Recommended Appliances &amp; Deployment Scope
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  {product.fullDescription ||
                    `Engineered for high-reliability applications where sudden grid failure causes data loss or downtime. Optimized for domestic homes, retail billing counters, clinical laboratory diagnostics, and telecom equipment.`}
                </p>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Typical Load Compatibility:</span>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>3 to 5 Ceiling Fans (75W each) + 6 LED Bulbs (9W each)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>1 Inverter Refrigerator or Desktop PC workstation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>Wi-Fi Routers, CCTV Surveillance Cameras &amp; TV unit</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Verified Vendor Card */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Verified Seller / Fulfillment Hub
                  </span>
                  <span className="font-extrabold text-[#142B55] text-xs block">
                    {product.vendorName || 'RAJ POWER TECH ENTERPRISES'}
                  </span>
                  <span className="text-[11px] text-slate-500">Secunderabad / Hyderabad Central Warehouse</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#142B55] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Quotation Request Modal (Logs in Admin & Dispatches to WhatsApp) */}
        <ProductQuoteModal
          product={product}
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          defaultQuantity={quantity}
        />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#142B55] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductDetailView />
    </React.Suspense>
  );
}
