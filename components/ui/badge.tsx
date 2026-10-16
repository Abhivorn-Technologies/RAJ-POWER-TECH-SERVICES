import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'navy' | 'red' | 'success' | 'warning' | 'outline' | 'demo';
  size?: 'sm' | 'md';
}

export function Badge({
  variant = 'default',
  size = 'sm',
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    navy: 'bg-[#142B55]/10 text-[#142B55] border-[#142B55]/20 font-semibold',
    red: 'bg-[#D52B30]/10 text-[#D52B30] border-[#D52B30]/20 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    outline: 'border border-slate-300 text-slate-700 bg-transparent',
    demo: 'bg-amber-100 text-amber-900 border-amber-300 font-medium',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
