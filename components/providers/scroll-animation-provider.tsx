'use client';

import { useEffect } from 'react';

/**
 * Universal Scroll Animation Provider
 * Automatically detects sections, headings, text lines, cards, and footer elements
 * across every page in the website and orchestrates smooth, hardware-accelerated scroll reveals.
 * Uses pure IntersectionObserver and DOM MutationObserver with zero dynamic URL hooks
 * to ensure 100% static prerendering compatibility in Next.js builds.
 */
export function ScrollAnimationProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Signal that JS scroll reveals are active
    document.documentElement.classList.add('js-scroll-reveals-ready');

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
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05,
      }
    );

    const initScrollElements = () => {
      const container = document.querySelector('body');
      if (!container) return;

      const windowHeight = window.innerHeight;

      // 1. Process Sections
      const sections = container.querySelectorAll<HTMLElement>(
        'main > section, main > div > section, main > div > div[class*="py-"], main > div > div[class*="space-y"], footer'
      );

      sections.forEach((sec) => {
        if (
          sec.closest('header') ||
          sec.closest('nav') ||
          sec.closest('[role="dialog"]') ||
          sec.hasAttribute('data-scroll-section')
        ) {
          return;
        }

        sec.setAttribute('data-scroll-section', 'true');

        const rect = sec.getBoundingClientRect();
        if (rect.top < windowHeight * 0.9 && rect.bottom > 0) {
          sec.setAttribute('data-revealed', 'true');
        } else {
          observer.observe(sec);
        }
      });

      // 2. Process Cards & Grid items
      const cards = container.querySelectorAll<HTMLElement>(
        'main .grid > *, footer .grid > *'
      );

      cards.forEach((card) => {
        if (
          card.closest('header') ||
          card.closest('nav') ||
          card.closest('[role="dialog"]') ||
          card.hasAttribute('data-scroll-card')
        ) {
          return;
        }

        card.setAttribute('data-scroll-card', 'true');

        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight * 0.9 && rect.bottom > 0) {
          card.setAttribute('data-revealed', 'true');
        } else {
          observer.observe(card);
        }
      });

      // 3. Process Standalone Headings & Lines of Text
      const textElements = container.querySelectorAll<HTMLElement>(
        'main h1, main h2, main h3, main h4, main h5, main p, main blockquote'
      );

      textElements.forEach((txt) => {
        if (
          txt.closest('header') ||
          txt.closest('nav') ||
          txt.closest('button') ||
          txt.closest('[role="dialog"]') ||
          txt.closest('[data-scroll-card]') ||
          txt.hasAttribute('data-scroll-text')
        ) {
          return;
        }

        const content = txt.textContent?.trim();
        if (!content || content.length === 0) return;

        txt.setAttribute('data-scroll-text', 'true');

        const rect = txt.getBoundingClientRect();
        if (rect.top < windowHeight * 0.9 && rect.bottom > 0) {
          txt.setAttribute('data-revealed', 'true');
        } else {
          observer.observe(txt);
        }
      });
    };

    // Defer initial scan so React finishes hydration cleanly
    const timer = setTimeout(initScrollElements, 150);

    // Watch for dynamic page elements and client-side page transitions
    const mutationObserver = new MutationObserver(() => {
      initScrollElements();
    });

    const targetNode = document.querySelector('main') || document.body;
    if (targetNode) {
      mutationObserver.observe(targetNode, { childList: true, subtree: true });
    }

    const handlePopState = () => {
      setTimeout(initScrollElements, 60);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
}
