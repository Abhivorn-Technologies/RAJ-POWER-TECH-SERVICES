'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { PREMIUM_EASE, CARD_VIEWPORT } from '@/lib/animations';

interface ScrollRevealCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollRevealCard({
  children,
  delay = 0,
  className,
  ...props
}: ScrollRevealCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={CARD_VIEWPORT}
      transition={{ duration: 0.5, delay, ease: PREMIUM_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
