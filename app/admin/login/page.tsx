'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { scaleIn } from '@/lib/animations';

type PortalRole = 'admin' | 'super_admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [activePortal, setActivePortal] = useState<PortalRole>('super_admin');
  const [email, setEmail] = useState('admin@rajpowertech.com');
  const [password, setPassword] = useState('SuperAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: Record<string, string> = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errs.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please resolve the highlighted credential errors.');
      return;
    }
    setFieldErrors({});

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      if (data.user.role !== 'super_admin' && data.user.role !== 'admin') {
        throw new Error('Access denied. This portal is strictly for Super Admins and authorized Administrators.');
      }

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePortalChange = (portal: PortalRole) => {
    setActivePortal(portal);
    setError(null);
    if (portal === 'super_admin') {
      setEmail('admin@rajpowertech.com');
      setPassword('SuperAdmin@2026');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="relative min-h-[90vh] py-12 bg-[#F3F5F8] text-slate-800 flex items-center justify-center px-4 overflow-hidden">
      {/* Background Architectural Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#142B55_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <motion.div
        variants={scaleIn}
        initial={shouldReduceMotion ? false : 'hidden'}
        animate="visible"
        className="relative max-w-md w-full space-y-4 z-10"
      >
        {/* Top Return Navigation */}
        <div className="flex justify-between items-center text-xs px-1">
          <Link
            href="/"
            className="text-slate-500 hover:text-[#142B55] transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to RPS Storefront</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured SSL</span>
          </span>
        </div>

        {/* White Administrative Login Card with Hover Border and Reduced Height */}
        <div className="bg-white border border-slate-200/90 hover:border-[#142B55]/50 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 group">
          {/* RPS Brand & Identity */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Image
                src="/images/rps-logo.png"
                alt="RAJ POWER TECH SERVICES Logo"
                width={160}
                height={46}
                className="h-9 w-auto object-contain mx-auto"
                priority
              />
            </Link>

            <div>
              <h1 className="text-xl font-extrabold text-[#142B55] tracking-tight">
                RPS Management Portal
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized platform governance &amp; operational control
              </p>
            </div>
          </div>

          {/* Compact Role Switcher Pill */}
          <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => handlePortalChange('super_admin')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'super_admin'
                  ? 'bg-[#D52B30] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-[#142B55]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalChange('admin')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-[#142B55] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-[#142B55]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Login Form with Compact Layout */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Account Email
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder={
                    activePortal === 'super_admin'
                      ? 'admin@rajpowertech.com'
                      : 'operations@rajpowertech.com'
                  }
                  className={`w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                    fieldErrors.email
                      ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#142B55] focus:ring-1 focus:ring-[#142B55]'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-11 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-mono ${
                    fieldErrors.password
                      ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#142B55] focus:ring-1 focus:ring-[#142B55]'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={loading}
              className="bg-[#D52B30] hover:bg-[#b82226] text-white font-bold py-2.5 rounded-xl shadow-md shadow-[#D52B30]/20 transition-all duration-200 mt-2"
              icon={
                loading ? (
                  <RefreshCw className="w-4 h-4 ml-1 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-1" />
                )
              }
            >
              {loading
                ? 'Verifying Credentials...'
                : activePortal === 'super_admin'
                ? 'Sign In to Super Admin'
                : 'Sign In to Admin Portal'}
            </Button>
          </form>

          {/* Quick Switch to Vendor Portal */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              href="/vendor/login"
              className="text-xs text-slate-500 hover:text-emerald-700 font-semibold transition-colors"
            >
              Looking for Vendor Portal? Sign in here &rarr;
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
