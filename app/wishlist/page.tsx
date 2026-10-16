import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Wishlist | RAJ POWER TECH SERVICES (RPS)',
  description: 'Your saved power backup products at RAJ POWER TECH SERVICES.',
};

export default function WishlistPage() {
  return (
    <div className="py-16 bg-[#F3F5F8]/70 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Wishlist</span>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B55]">
            Your Saved Wishlist
          </h1>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your wishlist is currently empty. Persistent account favorites and quotation pinning will be fully enabled in upcoming project phases.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/shop">
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Browse Products
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="md">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
