'use client';

import { useEffect } from 'react';

/**
 * Universal Scroll Animation Provider
 * Orchestrates smooth, hardware-accelerated scroll reveals for below-the-fold elements.
 * Defers scanning until React hydration is 100% completed to eliminate hydration mismatches.
 * Does not mutate above-the-fold elements, preventing initial paint flicker and layout shifts.
 */
export function ScrollAnimationProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.setAttribute('data-revealed', 'true');
            obs.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.08,
      }
    );

    const observeBelowFoldOnly = (el: HTMLElement, windowHeight: number, attributeName: string) => {
      const rect = el.getBoundingClientRect();
      // If element is already visible above the fold, DO NOT touch it or mutate attributes.
      // This guarantees zero hydration conflict and zero initial paint flicker!
      if (rect.top < windowHeight * 0.88 && rect.bottom > 0) {
        return;
      }

      el.setAttribute(attributeName, 'true');
      observer.observe(el);
    };

    const initScrollElements = () => {
      const main = document.querySelector('main');
      if (!main) return;

      const windowHeight = window.innerHeight;

      const isFramerOrLayout = (el: HTMLElement) => {
        return (
          el.closest('footer') ||
          el.closest('header') ||
          el.closest('nav') ||
          el.closest('[role="dialog"]') ||
          el.closest('form') ||
          el.hasAttribute('data-projection-id') ||
          el.closest('[data-projection-id]')
        );
      };

      // 1. Process Sections & Major Layout Blocks inside main
      const sections = main.querySelectorAll<HTMLElement>(
        'section, div[class*="space-y-"], div[class*="pt-"], div[class*="pb-"]'
      );

      sections.forEach((sec) => {
        if (isFramerOrLayout(sec) || sec.hasAttribute('data-scroll-section')) {
          return;
        }
        observeBelowFoldOnly(sec, windowHeight, 'data-scroll-section');
      });

      // 2. Process Images & Media Frames inside main
      const images = main.querySelectorAll<HTMLElement>(
        'img, [class*="aspect-"], figure'
      );

      images.forEach((img) => {
        if (
          isFramerOrLayout(img) ||
          img.hasAttribute('data-scroll-image') ||
          (img.tagName === 'IMG' && img.parentElement?.hasAttribute('data-scroll-image'))
        ) {
          return;
        }
        observeBelowFoldOnly(img, windowHeight, 'data-scroll-image');
      });

      // 3. Process Cards & Grid items inside main
      const cards = main.querySelectorAll<HTMLElement>(
        '.grid > *, [class*="rounded-2xl"], [class*="rounded-3xl"]'
      );

      cards.forEach((card) => {
        if (
          isFramerOrLayout(card) ||
          card.hasAttribute('data-scroll-section') ||
          card.hasAttribute('data-scroll-image') ||
          card.hasAttribute('data-scroll-card')
        ) {
          return;
        }
        observeBelowFoldOnly(card, windowHeight, 'data-scroll-card');
      });

      // 4. Process Headings, Text Lines, Badges & Lists inside main
      const textElements = main.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, h5, p, li, blockquote, [class*="rounded-full"][class*="text-xs"], [class*="rounded-full"][class*="text-[10px]"]'
      );

      textElements.forEach((txt) => {
        if (
          isFramerOrLayout(txt) ||
          txt.closest('button') ||
          txt.closest('input') ||
          txt.closest('select') ||
          txt.hasAttribute('data-scroll-text') ||
          txt.hasAttribute('data-scroll-card') ||
          txt.hasAttribute('data-scroll-image')
        ) {
          return;
        }

        const content = txt.textContent?.trim();
        if (!content || content.length === 0) return;

        observeBelowFoldOnly(txt, windowHeight, 'data-scroll-text');
      });
    };

    let mutationObserver: MutationObserver | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;

    const startScrollSystem = () => {
      // Signal that scroll reveals are active
      document.documentElement.classList.add('js-scroll-reveals-ready');

      // Initial scan for below-the-fold elements
      initScrollElements();

      // Setup debounced mutation observer for client-side route transitions
      mutationObserver = new MutationObserver((mutations) => {
        const hasRelevantMutations = mutations.some((m) => {
          if (m.type !== 'childList' || m.addedNodes.length === 0) return false;
          return Array.from(m.addedNodes).some((n) => {
            if (n.nodeType !== Node.ELEMENT_NODE) return false;
            const el = n as HTMLElement;
            return !el.closest('input') && !el.closest('select') && !el.closest('textarea');
          });
        });

        if (!hasRelevantMutations) return;

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          initScrollElements();
        }, 300);
      });

      const targetNode = document.querySelector('main');
      if (targetNode) {
        mutationObserver.observe(targetNode, { childList: true, subtree: true });
      }
    };

    // Wait until browser is idle and React hydration is 100% completed
    const initialTimer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => startScrollSystem());
      } else {
        startScrollSystem();
      }
    }, 800);

    const handlePopState = () => {
      setTimeout(initScrollElements, 150);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(initialTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
}
