'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import TagsLinked from './Tags';

const PLAYFAIR = "'Playfair Display', Georgia, serif";

/**
 * Returns an inline-style object for the staggered entrance animation.
 * Using style (not Tailwind) because the delay/duration values are
 * dynamic — Tailwind can't statically scan template-literal class names.
 */
function fade(ready, delayMs, translatePx = 10, durationMs = 500) {
  return {
    opacity: ready ? 1 : 0,
    transform: ready ? 'translateY(0)' : `translateY(${translatePx}px)`,
    transition: `opacity ${durationMs}ms ease ${delayMs}ms, transform ${durationMs}ms ease ${delayMs}ms`,
  };
}

export default function PostHeader({ title, date, tags = [], excerpt, imageUrl }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden flex flex-col justify-end"
      style={{
        height: 'clamp(300px, 48vh, 500px)', // this max height is causing me problems. Either remove the Max Height, or move the all posts button
        background: 'var(--gradient-dark-panel)',
      }}
      role="banner"
      aria-label={title}
    >

      {/* ── WITH IMAGE: Ken Burns photo layer ──────────────────────────── */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${imageUrl})`,
            transform: ready ? 'scale(1)' : 'scale(1.06)',
            transition: 'transform 9000ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Gradient overlay — heavier when a photo is present */}
      <div
        className="absolute inset-0"
        style={{
          background: imageUrl
            ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(5,15,5,0.38) 38%, rgba(5,15,5,0.80) 72%, rgba(5,15,5,0.96) 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(5,15,5,0.5) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom lime accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: 'var(--gradient-accent-bar)' }}
        aria-hidden="true"
      />

      {/* ← All Posts */}
      <Link
        href="/blog"
        className="absolute top-5 z-40 text-[12px] font-medium tracking-[0.06em] text-white/90 hover:text-white transition-colors px-4 py-2 rounded-lg backdrop-blur-sm"
        style={{ left: 'clamp(16px, 5vw, 48px)' }}
      >
        ← All Posts
      </Link>

      {/* Content — pinned to bottom of header */}
      <div
        id='header-card-content-width-control' 
        className=' w-full max-w-7xl mx-auto'>
        <div
          id='header-card-content'
          className="relative z-10 w-full max-w-[900px] mt-8"
          style={{
            paddingTop:    'clamp(16px, 5vw, 48px)',
            paddingLeft:   'clamp(16px, 5vw, 48px)',
            paddingRight:  'clamp(16px, 5vw, 48px)',
            paddingBottom: '40px',
          }}
        >
          {date && (
            <p
              className="text-[11px] font-medium tracking-[0.2em] uppercase mb-[10px]"
              style={{ color: 'rgba(255,255,255,0.46)', ...fade(ready, 100) }}
            >
              {date}
            </p>
          )}

          <h1
            className="font-bold text-white leading-[1.1] tracking-[-0.015em] mb-4"
            style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(24px, 4.2vw, 50px)', ...fade(ready, 200, 18, 650) }}
          >
            {title}
          </h1>

          {/* Excerpt shown only for text-only posts — adds context in place of an image */}
          {excerpt && !imageUrl && (
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'rgba(255,255,255,0.58)', ...fade(ready, 280) }}
            >
              {excerpt}
            </p>
          )}

          {tags.length > 0 && (
            <div style={fade(ready, 350, 8)}>
              <TagsLinked tags={tags} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
