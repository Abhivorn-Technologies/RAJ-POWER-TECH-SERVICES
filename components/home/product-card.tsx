'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquare, Eye, CheckCircle, Clock, FileText, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { addToGuestCart, openCartDrawer } from '@/lib/cart-store';
import { CARD_VIEWPORT, PREMIUM_EASE } from '@/lib/animations';
import { ProductQuoteModal } from '@/components/quotations/product-quote-modal';

interface ProductCardProps {
  product: Product;
  index?: number;
  delay?: number;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, index, delay }: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [added, setAdded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const priceValue = product.price || (product.category === 'inverters' ? 11500 : product.category === 'batteries' ? 15500 : 8500);

  const calculatedDelay = delay !== undefined ? delay : index !== undefined ? (index % 3) * 0.08 : 0;

  const handleAddToCart = () => {
    addToGuestCart(
      {
        productId: product.id,
        name: product.name,
        price: priceValue,
        image: product.imageUrl,
        category: product.category,
        vendorId: product.vendorId || 'ven-rps-primary',
        vendorName: product.vendorName || 'RAJ POWER TECH ENTERPRISES',
        stock: product.stock || 12,
      },
      1
    );
    setAdded(true);
    openCartDrawer();
    setTimeout(() => setAdded(false), 2200);
  };

  const availabilityBadges: Record<string, { variant: 'success' | 'warning' | 'default'; label: string; icon: React.ReactNode }> = {
    'In Stock': {
      variant: 'success',
      label: 'In Stock (Secunderabad Hub)',
      icon: <CheckCircle className="w-3 h-3 text-emerald-600" />,
    },
    'Available on Order': {
      variant: 'warning',
      label: 'Available on Order (2-3 Days)',
      icon: <Clock className="w-3 h-3 text-amber-600" />,
    },
    'Quotation Required': {
      variant: 'default',
      label: 'Custom Product Quotation',
      icon: <FileText className="w-3 h-3 text-slate-600" />,
    },
  };

  const badgeInfo = availabilityBadges[product.availability] || availabilityBadges['Quotation Required'];

  return (
    <div className="h-full">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={CARD_VIEWPORT}
        transition={{
          duration: 0.4,
          delay: calculatedDelay,
          ease: PREMIUM_EASE,
        }}
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                y: -5,
                transition: { duration: 0.2, ease: 'easeOut' },
              }
        }
        className="group relative flex flex-col h-full rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
      >
        {/* Top Badges: Savings & Stock Availability */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          {product.comparePrice && product.comparePrice > priceValue ? (
            <span className="bg-[#D52B30] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {Math.round(((product.comparePrice - priceValue) / product.comparePrice) * 100)}% OFF
            </span>
          ) : (
            <span className="bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
              Official Stock
            </span>
          )}

          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/95 border border-emerald-200/80 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{product.availability}</span>
          </span>
        </div>

        {/* Product Image Area with Link */}
        <Link
          href={`/products/${product.id}`}
          className="relative aspect-[4/3] w-full bg-slate-50/70 flex items-center justify-center p-6 border-b border-slate-100 overflow-hidden block"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Product Information Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-extrabold uppercase tracking-wider text-[#142B55] text-[11px]">{product.brand}</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200/60">
                {product.categoryName}
              </span>
            </div>

            {/* Product Name with Link */}
            <Link href={`/products/${product.id}`}>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#D52B30] transition-colors line-clamp-2 leading-snug cursor-pointer">
                {product.name}
              </h3>
            </Link>

            {/* Short description */}
            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Key Specs Matrix */}
            <div className="mt-3 bg-slate-50 rounded-xl p-2.5 space-y-1 text-xs border border-slate-100">
              {product.keySpecs.slice(0, 3).map((spec, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{spec.label}:</span>
                  <span className="text-slate-900 font-semibold truncate max-w-[170px] text-right">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Price & Warranty Line */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    ₹{priceValue.toLocaleString('en-IN')}
                  </span>
                  {product.comparePrice && product.comparePrice > priceValue && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{product.comparePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="block text-[10px] text-slate-500 font-medium">
                  Inclusive of GST
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Direct Warranty</span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className={cn(
                'flex-1 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer',
                added
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#142B55] hover:bg-[#0B172F] text-white hover:shadow-md'
              )}
              icon={added ? <Check className="w-3.5 h-3.5 text-white" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            >
              {added ? 'Added to Bag ✓' : 'Add to Bag'}
            </Button>

            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setQuoteOpen(true)}
              title="Request Official Technical Quotation"
              aria-label="Request Official Technical Quotation"
              className="p-2.5 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center justify-center"
            >
              <FileText className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

      {/* Product Quotation Request Modal (Logs in Admin & Dispatches to WhatsApp) */}
      <ProductQuoteModal
        product={product}
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
    </motion.div>
  </div>
  );
}
