'use client';

import { useEffect } from 'react';

/**
 * Universal Scroll Animation Provider
 * Automatically detects sections, headings, text lines, cards, images, and footer elements
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
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.08,
      }
    );

    let initialAboveFoldIndex = 0;

    const observeOrStagger = (el: HTMLElement, windowHeight: number) => {
      const rect = el.getBoundingClientRect();
      // If element is already in the viewport upon mount / navigation, animate it in with a fast stagger!
      if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
        const delay = Math.min(initialAboveFoldIndex * 40, 350);
        initialAboveFoldIndex++;
        setTimeout(() => {
          el.setAttribute('data-revealed', 'true');
        }, delay);
      } else {
        observer.observe(el);
      }
    };

    const initScrollElements = () => {
      const container = document.querySelector('body');
      if (!container) return;

      const windowHeight = window.innerHeight;

      // 1. Process Sections & Major Layout Blocks
      const sections = container.querySelectorAll<HTMLElement>(
        'main > section, main > div > section, main section, main > div > div[class*="space-y"], main > div > div[class*="pt-"], main > div > div[class*="pb-"], main > div > div[class*="p-"], footer'
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
        observeOrStagger(sec, windowHeight);
      });

      // 2. Process Images & Media Frames
      const images = container.querySelectorAll<HTMLElement>(
        'main img, main [class*="aspect-"], main figure'
      );

      images.forEach((img) => {
        if (
          img.closest('header') ||
          img.closest('nav') ||
          img.closest('[role="dialog"]') ||
          img.hasAttribute('data-scroll-image') ||
          (img.tagName === 'IMG' && img.parentElement?.hasAttribute('data-scroll-image'))
        ) {
          return;
        }

        img.setAttribute('data-scroll-image', 'true');
        observeOrStagger(img, windowHeight);
      });

      // 3. Process Cards & Grid items
      const cards = container.querySelectorAll<HTMLElement>(
        'main .grid > *, footer .grid > *, main [class*="rounded-2xl"], main [class*="rounded-3xl"]'
      );

      cards.forEach((card) => {
        if (
          card.closest('header') ||
          card.closest('nav') ||
          card.closest('[role="dialog"]') ||
          card.hasAttribute('data-scroll-section') ||
          card.hasAttribute('data-scroll-image') ||
          card.hasAttribute('data-scroll-card')
        ) {
          return;
        }

        card.setAttribute('data-scroll-card', 'true');
        observeOrStagger(card, windowHeight);
      });

      // 4. Process Headings, Text Lines, Badges & Lists
      const textElements = container.querySelectorAll<HTMLElement>(
        'main h1, main h2, main h3, main h4, main h5, main p, main li, main blockquote, main [class*="rounded-full"][class*="text-xs"], main [class*="rounded-full"][class*="text-[10px]"]'
      );

      textElements.forEach((txt) => {
        if (
          txt.closest('header') ||
          txt.closest('nav') ||
          txt.closest('button') ||
          txt.closest('input') ||
          txt.closest('select') ||
          txt.closest('[role="dialog"]') ||
          txt.hasAttribute('data-scroll-text') ||
          txt.hasAttribute('data-scroll-card') ||
          txt.hasAttribute('data-scroll-image')
        ) {
          return;
        }

        const content = txt.textContent?.trim();
        if (!content || content.length === 0) return;

        txt.setAttribute('data-scroll-text', 'true');
        observeOrStagger(txt, windowHeight);
      });
    };

    // Defer initial scan slightly so React finishes hydration cleanly
    const timer = setTimeout(initScrollElements, 120);

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
