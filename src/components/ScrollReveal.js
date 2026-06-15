'use client';

import { useEffect, useRef } from 'react';

const transforms = {
  bottom: 'translateY(48px)',
  left:   'translateX(-52px)',
  right:  'translateX(52px)',
  scale:  'scale(0.93)',
};

/**
 * ScrollReveal — wraps children in a div that fades + slides into view
 * once it enters the viewport. Elements already visible on page load
 * are skipped so above-the-fold content never flashes.
 *
 * Props:
 *   from     — 'bottom' | 'left' | 'right' | 'scale'  (default: 'bottom')
 *   delay    — ms to wait after entering viewport       (default: 0)
 *   className — forwarded to the wrapper div
 */
export default function ScrollReveal({ children, className = '', delay = 0, from = 'bottom' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation for anything already in view on mount
    const { top } = el.getBoundingClientRect();
    if (top < window.innerHeight * 0.98) return;

    el.style.opacity = '0';
    el.style.transform = transforms[from] ?? transforms.bottom;
    el.style.transition = [
      `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      `transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    ].join(', ');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          io.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay, from]);

  return <div ref={ref} className={className}>{children}</div>;
}
