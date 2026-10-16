import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { CookieBanner } from '@/components/layout/cookie-banner';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'RAJ POWER TECH SERVICES (RPS) | Inverters, Batteries & UPS Systems',
  description:
    'Dedicated power backup systems and energy storage retailer. Pure sine wave inverters, tall tubular batteries, and zero-transfer UPS systems.',
  keywords: [
    'Inverters',
    'Inverter Batteries',
    'UPS Systems',
    'Power Backup',
    'Solar Inverters',
    'Energy Storage',
    'RAJ POWER TECH SERVICES',
    'RPS',
  ],
  authors: [{ name: BUSINESS_INFO.name }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/icons/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icons/favicon.png',
    apple: '/icons/favicon-192.png',
  },
  openGraph: {
    title: 'RAJ POWER TECH SERVICES (RPS) | Power Backup Specialist',
    description:
      'Pure sine wave inverters, tubular batteries, and UPS systems. Request direct quotations on WhatsApp.',
    siteName: 'RAJ POWER TECH SERVICES',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/icons/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/favicon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#202B3B] antialiased">
        <StorefrontShell>{children}</StorefrontShell>
        <CookieBanner />
      </body>
    </html>
  );
}
