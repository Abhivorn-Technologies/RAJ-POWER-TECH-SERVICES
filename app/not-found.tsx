import React from 'react';
import Link from 'next/link';
import { Home, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="py-20 bg-[#F3F5F8]/70 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#D52B30] mx-auto flex items-center justify-center">
          <Zap className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#142B55]">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">
          The requested power backup category or route does not exist. Please return to the homepage or explore our catalog.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="md">
              View Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
