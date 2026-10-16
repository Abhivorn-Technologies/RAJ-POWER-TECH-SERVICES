'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquare, Eye, CheckCircle, Clock, FileText, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWhatsAppInquiryUrl, cn } from '@/lib/utils';
import { addToGuestCart } from '@/lib/cart-store';
import { CARD_VIEWPORT, PREMIUM_EASE } from '@/lib/animations';

interface ProductCardProps {
  product: Product;
  index?: number;
  delay?: number;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, index, delay, onQuickView }: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [added, setAdded] = useState(false);
  const whatsappUrl = buildWhatsAppInquiryUrl(product.name, product.categoryName);

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
      label: 'Custom Capacity Quote',
      icon: <FileText className="w-3 h-3 text-slate-600" />,
    },
  };

  const badgeInfo = availabilityBadges[product.availability] || availabilityBadges['Quotation Required'];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={CARD_VIEWPORT}
      transition={{
        duration: 0.5,
        delay: calculatedDelay,
        ease: PREMIUM_EASE,
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* Top Demo Notice & Availability Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {product.isDemo ? (
          <Badge variant="demo" size="sm" className="shadow-xs backdrop-blur-md">
            Catalog Sample
          </Badge>
        ) : (
          <Badge variant="navy" size="sm">
            Verified Model
          </Badge>
        )}

        <Badge
          variant={badgeInfo.variant}
          size="sm"
          className="ml-auto bg-white/95 backdrop-blur-md shadow-xs border border-slate-100"
        >
          {badgeInfo.icon}
          <span className="text-[10px] font-semibold">{product.availability}</span>
        </Badge>
      </div>

      {/* Product Image Area with Aspect Ratio & Smooth Container Zoom */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-100 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-108"
        />
        {/* Delicate hover shimmer vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Product Information Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[#142B55]">{product.brand}</span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200/60">
              {product.categoryName}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#D52B30] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Key Specs Matrix */}
          <div className="mt-3 bg-slate-50/80 rounded-xl p-3 space-y-1.5 text-xs border border-slate-100">
            {product.keySpecs.map((spec, sIdx) => (
              <div key={sIdx} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">{spec.label}:</span>
                <span className="text-slate-900 font-bold">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Price & Guarantee Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Ex-Showroom Price
              </span>
              <span className="text-lg font-extrabold text-[#142B55] tracking-tight">
                ₹{priceValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Warranty</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            className={cn(
              'text-xs font-bold py-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98]',
              added
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-[#142B55] hover:bg-[#0B172F] text-white hover:shadow-md'
            )}
            icon={added ? <Check className="w-3.5 h-3.5 text-white animate-bounce" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          >
            {added ? 'Added to Bag ✓' : 'Add to Bag'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onQuickView?.(product)}
              className="text-xs font-semibold rounded-xl border-slate-200 hover:border-[#142B55] hover:bg-slate-50 transition-colors"
              icon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
            >
              Specs
            </Button>

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
                className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 font-semibold rounded-xl transition-colors"
                icon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Quote
              </Button>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
