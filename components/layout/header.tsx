'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Zap,
  BatteryCharging,
  Server,
  Layers,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { NAV_LINKS, SOLUTIONS_LINKS, BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getGuestCart, getCartTotalItems, openCartDrawer } from '@/lib/cart-store';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [cartCount, setCartCount] = useState(0);

  // Synchronize drawer and search overlay states on route changes without cascading effect renders
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSolutionsDropdownOpen(false);
  }

  // Reactive guest cart counter synchronization
  useEffect(() => {
    const updateCount = () => {
      setCartCount(getCartTotalItems(getGuestCart()));
    };
    updateCount();
    window.addEventListener('rps-cart-updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('rps-cart-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  // Handle scroll effect for compact sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setMobileMenuOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 w-full',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-2.5'
          : 'bg-white border-b border-slate-100 py-3.5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* RPS Brand Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation Links (with Our Solutions Dropdown) */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {NAV_LINKS.map((item) => {
              const hasDropdown = 'hasDropdown' in item && item.hasDropdown;
              const isSolutionsActive =
                pathname === '/shop' || pathname.startsWith('/categories/');
              const isActive = hasDropdown ? isSolutionsActive : pathname === item.href;

              if (hasDropdown) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setSolutionsDropdownOpen(true)}
                    onMouseLeave={() => setSolutionsDropdownOpen(false)}
                  >
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => {
                        setSolutionsDropdownOpen(!solutionsDropdownOpen);
                        router.push('/shop');
                      }}
                      className={cn(
                        'relative px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer',
                        isActive
                          ? 'text-[#D52B30] font-semibold'
                          : 'text-[#202B3B] hover:text-[#142B55] hover:bg-[#F3F5F8]'
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          solutionsDropdownOpen && 'rotate-180 text-[#D52B30]'
                        )}
                      />
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D52B30] rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>

                    {/* Solutions Dropdown Menu */}
                    <AnimatePresence>
                      {solutionsDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 w-84 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2.5 z-50 mt-1"
                        >
                          <div className="px-3 py-1.5 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D52B30]">
                              Power Solutions
                            </span>
                            <span className="text-[10px] text-slate-400">Doorstep Delivery</span>
                          </div>

                          <div className="space-y-1">
                            {SOLUTIONS_LINKS.map((sol) => {
                              const isSubActive = pathname === sol.href;
                              return (
                                <Link
                                  key={sol.href}
                                  href={sol.href}
                                  onClick={() => setSolutionsDropdownOpen(false)}
                                  className={cn(
                                    'flex items-start gap-3 p-2.5 rounded-xl transition-all',
                                    isSubActive
                                      ? 'bg-red-50/70 text-[#D52B30]'
                                      : 'hover:bg-slate-50 text-slate-800'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                                      sol.slug === 'inverters'
                                        ? 'bg-red-50 text-[#D52B30]'
                                        : sol.slug === 'batteries'
                                        ? 'bg-amber-50 text-amber-600'
                                        : sol.slug === 'ups'
                                        ? 'bg-sky-50 text-sky-600'
                                        : 'bg-blue-50 text-[#142B55]'
                                    )}
                                  >
                                    {sol.slug === 'inverters' ? (
                                      <Zap className="w-4 h-4" />
                                    ) : sol.slug === 'batteries' ? (
                                      <BatteryCharging className="w-4 h-4" />
                                    ) : sol.slug === 'ups' ? (
                                      <Server className="w-4 h-4" />
                                    ) : (
                                      <Layers className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold leading-snug flex items-center gap-1.5">
                                      <span>{sol.label}</span>
                                      {sol.slug === 'all' && (
                                        <span className="px-1.5 py-0.2 bg-[#142B55] text-white text-[9px] rounded font-bold">
                                          All
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                      {sol.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          <div className="pt-2 mt-1.5 border-t border-slate-100 flex items-center justify-between px-2 text-[11px]">
                            <Link
                              href="/contact"
                              onClick={() => setSolutionsDropdownOpen(false)}
                              className="text-[#142B55] hover:text-[#D52B30] font-semibold flex items-center gap-1"
                            >
                              <span>Custom Capacity Sizing</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                            <span className="text-emerald-600 font-bold">Doorstep Service</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive
                      ? 'text-[#D52B30] font-semibold'
                      : 'text-[#202B3B] hover:text-[#142B55] hover:bg-[#F3F5F8]'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D52B30] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Search, Wishlist, Cart & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle Button */}
            <div className="relative">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-slate-700 hover:text-[#142B55] hover:bg-[#F3F5F8] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B55] cursor-pointer"
                aria-label="Search power backup products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quick Search Dropdown */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        suppressHydrationWarning
                        type="text"
                        placeholder="Search Inverters, Batteries, UPS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#142B55] focus:ring-1 focus:ring-[#142B55]"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </form>
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Suggested Categories
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href="/categories/inverters"
                          onClick={() => setSearchOpen(false)}
                          className="text-xs px-2.5 py-1 bg-[#F3F5F8] hover:bg-[#142B55] hover:text-white rounded-md text-slate-700 transition-colors"
                        >
                          Sine Wave Inverters
                        </Link>
                        <Link
                          href="/categories/batteries"
                          onClick={() => setSearchOpen(false)}
                          className="text-xs px-2.5 py-1 bg-[#F3F5F8] hover:bg-[#142B55] hover:text-white rounded-md text-slate-700 transition-colors"
                        >
                          Tubular Batteries
                        </Link>
                        <Link
                          href="/categories/ups"
                          onClick={() => setSearchOpen(false)}
                          className="text-xs px-2.5 py-1 bg-[#F3F5F8] hover:bg-[#142B55] hover:text-white rounded-md text-slate-700 transition-colors"
                        >
                          Online UPS
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 text-slate-700 hover:text-[#142B55] hover:bg-[#F3F5F8] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B55]"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Button with Drawer Trigger */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative p-2 text-slate-700 hover:text-[#142B55] hover:bg-[#F3F5F8] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B55] cursor-pointer"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D52B30] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Direct Technical Helpline Action */}
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
                'Hello RPS, I would like to request an official power backup quotation and technical guidance.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#142B55] hover:bg-[#0B172F] transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-300" />
              <span>Sales Desk</span>
            </a>

            {/* Mobile Navigation Toggle Button */}
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-800 hover:bg-[#F3F5F8] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B55] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              <div className="mb-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    suppressHydrationWarning
                    type="text"
                    placeholder="Search power backup products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#142B55]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </form>
              </div>

              {NAV_LINKS.map((item) => {
                const hasDropdown = 'hasDropdown' in item && item.hasDropdown;
                const isSolutionsActive =
                  pathname === '/shop' || pathname.startsWith('/categories/');
                const isActive = hasDropdown ? isSolutionsActive : pathname === item.href;

                if (hasDropdown) {
                  return (
                    <div key={item.href} className="space-y-1 pt-1 pb-2">
                      <Link
                        href="/shop"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-bold transition-colors',
                          isActive
                            ? 'bg-[#142B55] text-white'
                            : 'text-slate-900 bg-slate-50 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#D52B30]" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase bg-red-100 text-[#D52B30] px-2 py-0.5 rounded">
                          Browse All
                        </span>
                      </Link>

                      <div className="pl-4 pr-1 space-y-1 border-l-2 border-slate-200 ml-3 mt-1">
                        {SOLUTIONS_LINKS.map((sol) => (
                          <Link
                            key={sol.href}
                            href={sol.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                              pathname === sol.href
                                ? 'text-[#D52B30] font-bold bg-red-50'
                                : 'text-slate-600 hover:text-[#142B55] hover:bg-slate-50'
                            )}
                          >
                            <span>{sol.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-[#142B55] text-white'
                        : 'text-slate-800 hover:bg-[#F3F5F8] hover:text-[#142B55]'
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')}
                    />
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
                <a
                  href={`tel:${BUSINESS_INFO.phoneTel}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  <Phone className="w-4 h-4 text-[#D52B30]" />
                  <span>Call {BUSINESS_INFO.phoneFormatted}</span>
                </a>

                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(
                    'Hello RPS, I would like to request an official power backup quotation.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Sales Desk Quotation</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
