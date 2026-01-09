'use client';

import { useEffect, useRef, RefObject } from 'react';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
): RefObject<T | null> {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      element.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}

// Component version for easier use with Server Components
export function RevealOnScroll({
  children,
  className = '',
  as: Component = 'div',
  stagger = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
  stagger?: boolean;
}) {
  const ref = useReveal();

  return (
    <Component
      ref={ref as RefObject<HTMLDivElement>}
      className={`reveal ${stagger ? 'stagger' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
