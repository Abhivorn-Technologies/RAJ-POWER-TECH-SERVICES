'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If visiting Admin or Vendor private portal routes, do NOT show customer navbar, announcement bar, or customer footer
  const isPrivatePortal = pathname.startsWith('/admin') || pathname.startsWith('/vendor');

  if (isPrivatePortal) {
    return <main className="flex-1 w-full flex flex-col">{children}</main>;
  }

  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Header />
      </Suspense>
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>
  );
}
