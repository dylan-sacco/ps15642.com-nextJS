"use client"
import React, { useRef, useEffect, useState, useCallback } from 'react';

// src/components/ScrollContext.js

/**
 * ScrollContext
 * - Renders horizontally-scrolling reviews (right-to-left).
 * - Smoothly slows to a stop when hovered, and smoothly resumes on mouse leave.
 *
 * Props:
 * - reviews: array of { text: string, author?: string } OR strings. (default sample provided)
 * - speed: number (pixels per second) default 120
 * - slowSpeed: number (pixels per second) speed while hovered (default 10)
 * - gap: number (px) gap between items (default 40)
 *
 * Usage:
 * <ScrollContext reviews={[{text: 'Great!', author: 'Amy'}, 'Nice place']} />
 *
 * This component duplicates the content (2x) to create a seamless loop.
 */

export default function ScrollContext({
  reviews = [
    { text: '1Excellent service — highly recommended!', author: 'Google User' },
    { text: '2Very professional and friendly staff.', author: 'S. M.' },
    { text: '3Clean facilities and great communication.', author: 'A. R.' },
    { text: '4Five stars. Will come again.', author: 'C. D.' },
  ],
  speed = 40, // px per second when not hovered
  slowSpeed = 6, // px per second when hovered (near-stop)
  gap = 40, // px gap between items
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const reqRef = useRef(null);
  const lastTimeRef = useRef(null);

  const [contentWidth, setContentWidth] = useState(0);
  const offsetRef = useRef(0); // current offset in px (0.. -contentWidth)
  const currentSpeedRef = useRef(speed); // px/s (positive)
  const targetSpeedRef = useRef(speed);
  const hoveredRef = useRef(false);

  // Build a flat array of rendered items (strings)
  const items = reviews.map((r, i) =>
    typeof r === 'string' ? { text: r, author: null, key: `r-${i}` } : { text: r.text, author: r.author || null, key: `r-${i}` }
  );

  // Measure content width (one copy)
  const measure = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const first = el.querySelector('.scroll-copy');
    if (!first) return;

    // bounding width + computed margin-right (margin isn't included in getBoundingClientRect)
    const rectW = first.getBoundingClientRect().width;
    const style = window.getComputedStyle(first);
    const marginRight = parseFloat(style.marginRight) || 0;
    const w = rectW + marginRight;

    setContentWidth(w);

    // ensure offset within bounds
    if (offsetRef.current <= -w) {
      offsetRef.current += w;
    }
  }, []);


  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, items.length, gap]);

  // Hover handlers
  const handleMouseEnter = () => {
    hoveredRef.current = true;
    targetSpeedRef.current = slowSpeed;
  };
  const handleMouseLeave = () => {
    hoveredRef.current = false;
    targetSpeedRef.current = speed;
  };

  // Animation loop with smoothing for speed changes
  useEffect(() => {
    lastTimeRef.current = performance.now();

    const step = (time) => {
      const last = lastTimeRef.current || time;
      const dt = Math.min(0.05, (time - last) / 1000); // clamp dt to avoid big jumps
      lastTimeRef.current = time;

      // smooth currentSpeed towards targetSpeed
      // using exponential smoothing factor based on dt
      const smoothing = 10; // larger -> faster convergence
      const alpha = 1 - Math.exp(-smoothing * dt);
      currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * alpha;

      // update offset
      if (contentWidth > 0) {
        offsetRef.current -= currentSpeedRef.current * dt;
        // wrap around to create seamless loop
        if (offsetRef.current <= -contentWidth) {
          offsetRef.current += contentWidth;
        }
      }

      // apply transform
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }

      reqRef.current = requestAnimationFrame(step);
    };

    reqRef.current = requestAnimationFrame(step);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [contentWidth, speed, slowSpeed]);

  // When speed props change, update refs
  useEffect(() => {
    if (!hoveredRef.current) {
      targetSpeedRef.current = speed;
      currentSpeedRef.current = Math.max(0.1, currentSpeedRef.current); // avoid zero stuck
    }
  }, [speed]);

  useEffect(() => {
    if (hoveredRef.current) {
      targetSpeedRef.current = slowSpeed;
    }
  }, [slowSpeed]);

  // Simple inline styles
  const wrapperStyle = {
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.03)',
  };

  const scrollerViewportStyle = {
    display: 'block',
    whiteSpace: 'nowrap',
  };

  const copyStyle = {
    display: 'inline-flex',
    gap: `${gap}px`,
    alignItems: 'center',
  };

  const itemStyle = {
    display: 'inline-block',
    background: '#fff',
    color: '#111',
    padding: '10px 14px',
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    minWidth: 160,
    maxWidth: 420,
    fontSize: 14,
    lineHeight: '1.2',
  };

  const authorStyle = {
    display: 'block',
    marginTop: 6,
    fontSize: 12,
    color: '#555',
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Google reviews scrolling"
      className='mt-6'
    >
      <div style={scrollerViewportStyle}>
        {/* containerRef is translated; contentRef holds two copies */}
        <div
          ref={containerRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            willChange: 'transform',
          }}
        >
          <div ref={contentRef} style={{ display: 'inline-flex' }}>
            {/* first copy */}
            <div className="scroll-copy" style={{ ...copyStyle, marginRight: `${gap}px` }}>
              {items.map((it) => (
                <div key={it.key} style={itemStyle}>
                  <div>{it.text}</div>
                  {it.author ? <span style={authorStyle}>— {it.author}</span> : null}
                </div>
              ))}
            </div>

            {/* second copy (duplicate) */}
            <div className="scroll-copy" style={copyStyle} aria-hidden>
              {items.map((it) => (
                <div key={it.key + '-dup'} style={itemStyle}>
                  <div>{it.text}</div>
                  {it.author ? <span style={authorStyle}>— {it.author}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}