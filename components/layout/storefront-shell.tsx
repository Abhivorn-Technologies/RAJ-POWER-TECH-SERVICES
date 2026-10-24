'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { ScrollAnimationProvider } from '@/components/providers/scroll-animation-provider';

function StorefrontHeader() {
  const pathname = usePathname();
  const isPrivatePortal = pathname ? pathname.startsWith('/admin') || pathname.startsWith('/vendor') : false;

  if (isPrivatePortal) {
    return null;
  }

  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Header />
      </Suspense>
    </>
  );
}

function StorefrontFooter() {
  const pathname = usePathname();
  const isPrivatePortal = pathname ? pathname.startsWith('/admin') || pathname.startsWith('/vendor') : false;

  if (isPrivatePortal) {
    return null;
  }

  return <Footer />;
}

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ScrollAnimationProvider />
      </Suspense>
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <StorefrontHeader />
      </Suspense>
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Suspense fallback={null}>
        <StorefrontFooter />
      </Suspense>
      <CartDrawer />
    </>
  );
}
