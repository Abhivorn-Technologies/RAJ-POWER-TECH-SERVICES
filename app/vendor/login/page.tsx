'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function VendorLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the unified Admin Portal
    const timer = setTimeout(() => {
      router.replace('/admin/login');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#F3F5F8]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-[#D52B30] rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-[#142B55]">Unified Store Administration</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Raj Power Tech Services is managed directly by the store administrator. All operations are consolidated in the Admin Portal.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B55] hover:bg-[#0B172F] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Proceed to Admin Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
