'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/product';
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
        {/* Top Badges: Savings */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          {product.comparePrice && product.comparePrice > priceValue ? (
            <span className="bg-[#D52B30] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {Math.round(((product.comparePrice - priceValue) / product.comparePrice) * 100)}% OFF
            </span>
          ) : (
            <span className="bg-slate-900/80 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md backdrop-blur-xs">
              Official Stock
            </span>
          )}
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
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleAddToCart}
              className={cn(
                'w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs',
                added
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-[#142B55] hover:bg-[#0B172F] text-white hover:shadow-md'
              )}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Added ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Add to Bag</span>
                </>
              )}
            </button>

            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setQuoteOpen(true)}
              title={`Request Official Quotation for ${product.name}`}
              aria-label={`Request Official Quotation for ${product.name}`}
              className="w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border-2 border-[#142B55] text-[#142B55] bg-white hover:bg-[#142B55] hover:text-white cursor-pointer shadow-xs group/quote-btn"
            >
              <FileText className="w-3.5 h-3.5 text-[#D52B30] group-hover/quote-btn:text-white transition-colors shrink-0" />
              <span className="truncate">Request Quote</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Product Quotation Request Modal (Portaled to body, logs in Admin & dispatches to WhatsApp) */}
      <ProductQuoteModal
        product={product}
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
    </div>
  );
}
