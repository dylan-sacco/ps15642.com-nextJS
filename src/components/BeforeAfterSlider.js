'use client';

import { useState, useRef, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeSrc, afterSrc, title, description }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const lockAxisRef = useRef(null);

  function handleMove(clientX) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lockAxisRef.current = null;
    }

    function onTouchMove(e) {
      if (!touchStartRef.current) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartRef.current.y);

      if (!lockAxisRef.current) {
        lockAxisRef.current = dx > dy ? 'horizontal' : 'vertical';
      }

      if (lockAxisRef.current === 'horizontal') {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
      }
    }

    function onTouchEnd() {
      touchStartRef.current = null;
      lockAxisRef.current = null;
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden cursor-col-resize aspect-video"
        onMouseMove={e => handleMove(e.clientX)}
      >
        {/* After (base layer) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt={`After — ${title}`} className="absolute inset-0 w-full h-full object-cover" draggable={false} />

        {/* Before (clipped to left of slider) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt={`Before — ${title}`} className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} draggable={false} />

        {/* Divider */}
        <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{ left: `${position}%` }}>
          <div className="w-0.5 h-full bg-white/80" />
          <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 text-xs font-bold border border-gray-200" style={{transform: 'translateX(-45%)'}}>
            ⇔
          </div>
        </div>

        {/* Labels */}
        <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded pointer-events-none">Before</span>
        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded pointer-events-none">After</span>
      </div>

      {(title || description) && (
        <div className="p-3 bg-white">
          {title && <p className="font-semibold text-sm text-gray-800">{title}</p>}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
}
