'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className,
      children,
      icon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#D52B30] text-white hover:bg-[#B51E22] focus-visible:ring-[#D52B30] shadow-sm hover:shadow-md',
      navy:
        'bg-[#142B55] text-white hover:bg-[#0B172F] focus-visible:ring-[#142B55] shadow-sm hover:shadow-md',
      secondary:
        'bg-[#F3F5F8] text-[#142B55] hover:bg-[#E5E9F0] focus-visible:ring-[#142B55]',
      outline:
        'border-2 border-[#142B55] text-[#142B55] hover:bg-[#142B55] hover:text-white focus-visible:ring-[#142B55]',
      ghost:
        'text-[#202B3B] hover:bg-[#F3F5F8] hover:text-[#142B55] focus-visible:ring-[#142B55]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
