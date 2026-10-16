import { type Variants } from 'framer-motion';

/**
 * RPS Storefront Unified Premium Animation System
 * Engineered with custom cubic-bezier easing for smooth, natural entrance
 * and strict viewport={{ once: true }} to prevent replaying on scroll.
 */

// Luxury ease curve (smooth decelerated ease-out)
export const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Standard container that staggers its direct children
 */
export const staggerContainer = (
  staggerDelay = 0.12,
  delayChildren = 0.05
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Subtle vertical entrance for headlines, copy, and badges
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Gentle scale-in with soft opacity fade for cards and hero imagery
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Directional reveals for alternating two-column layouts
 */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: PREMIUM_EASE,
    },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Staggered card item for product and category grids
 */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: PREMIUM_EASE,
    },
  },
};

/**
 * Individual card item with custom delay for independent row stagger
 */
export const cardRevealWithDelay = (delay: number = 0): Variants => ({
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: PREMIUM_EASE,
    },
  },
});

/**
 * Standard viewport configuration for scroll-triggered arrivals
 * once: true prevents annoying replaying when scrolling up and down
 */
export const VIEWPORT_ONCE = {
  once: true,
  margin: '-60px',
} as const;

export const CARD_VIEWPORT = {
  once: true,
  margin: '-40px',
} as const;

export const HERO_VIEWPORT = {
  once: true,
  margin: '0px',
} as const;
