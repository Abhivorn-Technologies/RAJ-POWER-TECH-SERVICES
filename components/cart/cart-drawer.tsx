'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  CartItem,
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  getCartSubtotal,
  getCartTotalItems,
} from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  const loadCart = () => {
    setItems(getGuestCart());
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => loadCart();
    const handleOpenDrawer = () => setIsOpen(true);

    window.addEventListener('rps-cart-updated', handleCartUpdate);
    window.addEventListener('rps-open-cart-drawer', handleOpenDrawer);

    return () => {
      window.removeEventListener('rps-cart-updated', handleCartUpdate);
      window.removeEventListener('rps-open-drawer', handleOpenDrawer);
    };
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
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
  }, [isOpen]);

  const subtotal = getCartSubtotal(items);
  const totalCount = getCartTotalItems(items);

  const handleQuotationForCart = () => {
    const itemSummary = items
      .map((it, idx) => `${idx + 1}. ${it.name} (Qty: ${it.quantity}) - ₹${(it.price * it.quantity).toLocaleString('en-IN')}`)
      .join('\n');

    const msg = `Hello Raj Power Tech Services (RPS),

I would like to request an official quotation for the items in my cart:
${itemSummary}

• Estimated Subtotal: ₹${subtotal.toLocaleString('en-IN')}
• Delivery Scope: Hyderabad / Secunderabad Hub

Please provide GST invoice terms and installation scheduling. Thank you!`;

    const url = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#142B55] text-white flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Selected Equipment Bag
                    </h2>
                    <p className="text-xs text-slate-500">
                      {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label="Close cart drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Banner */}
              <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Authorized Master Stockist:</strong> Genuine factory warranty &amp; doorstep setup.
                </span>
              </div>

              {/* Drawer Body (Items List) */}
              <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Your equipment bag is empty
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Explore our authorized selection of Microtek, Exide, Amaron Quanta, and BPE systems.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-xs bg-[#142B55] hover:bg-[#0B172F]"
                    >
                      <Link href="/shop">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.productId} className="py-3.5 flex gap-3.5 items-center">
                      {/* Product Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/80 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        <Image
                          src={item.image || '/products/bpe-online-ups-hq.png'}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] font-mono font-extrabold text-[#142B55] mt-0.5">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateGuestCartQuantity(item.productId, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-l-lg cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-800 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateGuestCartQuantity(item.productId, item.quantity + 1)}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-r-lg cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromGuestCart(item.productId)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove from bag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/80 space-y-3 shrink-0">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Estimated Subtotal</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Delivery &amp; Logistics</span>
                      <span className="text-emerald-700 font-semibold">Doorstep Setup Available</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 px-4 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Official Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleQuotationForCart}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#D52B30]" />
                      <span>Request Commercial Quotation for Bag</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Official Authorized Stockist • GST Invoices Provided</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
