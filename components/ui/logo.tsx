'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'header' | 'footer';
}

/**
 * Official RPS Brand Logo Component
 * Displays the clean authentic logo provided by RAJ POWER TECH SERVICES (/images/rps-logo.png).
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D52B30] rounded-lg p-1',
        className
      )}
      aria-label="RAJ POWER TECH SERVICES (RPS) Homepage"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Image
          src="/images/rps-logo.png"
          alt="RAJ POWER TECH SERVICES (RPS) Logo"
          width={180}
          height={55}
          priority
          className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
    </Link>
  );
}
