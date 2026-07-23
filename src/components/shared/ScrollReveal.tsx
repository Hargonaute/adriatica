'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global reveal-on-view driver.
 *
 * Watches every `[data-reveal]` element on the page and adds `is-visible`
 * once it scrolls into view, which triggers a subtle fade + rise (see the
 * `.reveal-ready [data-reveal]` rules in globals.css). Mounted once in the
 * site layout so it covers every page — including block-rendered pages and
 * content that streams in later (Repeater entries, bound blocks), which the
 * MutationObserver picks up.
 *
 * The initial hidden state is gated on a `reveal-ready` class set by an inline
 * script in the layout <head>, so without JS the content is simply visible and
 * there is no flash of hidden content.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // No animation wanted / possible → make sure everything is visible.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observed = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.classList.contains('is-visible') || observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
    };

    observeAll();

    // Content that arrives after first paint (async fetches inside Repeater /
    // bound blocks) still gets picked up.
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
