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
      const main = document.querySelector('main');
      if (!main) return;

      const windowHeight = window.innerHeight;

      const isFramerOrLayout = (el: HTMLElement) => {
        return (
          el.closest('footer') ||
          el.closest('header') ||
          el.closest('nav') ||
          el.closest('[role="dialog"]') ||
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

        sec.setAttribute('data-scroll-section', 'true');
        observeOrStagger(sec, windowHeight);
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

        img.setAttribute('data-scroll-image', 'true');
        observeOrStagger(img, windowHeight);
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

        card.setAttribute('data-scroll-card', 'true');
        observeOrStagger(card, windowHeight);
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

        txt.setAttribute('data-scroll-text', 'true');
        observeOrStagger(txt, windowHeight);
      });
    };

    // Defer initial scan until hydration is 100% completed
    const timer = setTimeout(initScrollElements, 350);

    // Watch for dynamic page elements and client-side page transitions
    const mutationObserver = new MutationObserver(() => {
      initScrollElements();
    });

    const targetNode = document.querySelector('main');
    if (targetNode) {
      mutationObserver.observe(targetNode, { childList: true, subtree: true });
    }

    const handlePopState = () => {
      setTimeout(initScrollElements, 100);
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
