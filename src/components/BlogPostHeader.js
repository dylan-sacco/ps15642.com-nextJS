"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * BlogPostHeader — adaptive blog article header.
 *
 * With imageUrl:  Full-bleed hero image with Ken-Burns scale, gradient overlay,
 *                 article title, date, and tag chips overlaid at the bottom.
 *
 * Without imageUrl: Clean typographic header (white bg, max-w-3xl) that matches
 *                   the article content column — no forced background image.
 */

const tagToSlug = (tag) =>
  tag
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function BlogPostHeader({
  title,
  date,
  tags = [],
  excerpt,
  imageUrl,
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* ── WITH IMAGE ─────────────────────────────────────────────────────────── */
  if (imageUrl) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

          .bph-root {
            position: relative;
            width: 100%;
            height: clamp(300px, 48vh, 500px);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          }

          .bph-bg {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            transform: scale(1.06);
            transition: transform 9s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .bph-bg.ready { transform: scale(1); }

          .bph-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(0,0,0,0.0)  0%,
              rgba(5,15,5,0.38) 38%,
              rgba(5,15,5,0.80) 72%,
              rgba(5,15,5,0.96) 100%
            );
          }

          /* "← All Posts" in top-left */
          .bph-back {
            position: absolute;
            top: 20px;
            left: clamp(16px, 5vw, 48px);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.06em;
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            z-index: 3;
            transition: color 0.15s;
            padding: .5rem 1rem;
            border-radius: .5rem;
            backdrop-filter: blur(10px);
          }
          .bph-back:hover { color: #fff; }

          /* Content block pinned to the bottom */
          .bph-content {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 900px;
            padding: clamp(16px, 5vw, 48px);
            padding-bottom: 40px;
          }

          .bph-date {
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.46);
            margin: 0 0 10px;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
          }

          .bph-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(24px, 4.2vw, 50px);
            font-weight: 700;
            color: #fff;
            line-height: 1.1;
            letter-spacing: -0.015em;
            margin: 0 0 16px;
            opacity: 0;
            transform: translateY(18px);
            transition: opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s;
          }

          .bph-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s;
          }

          .bph-tag {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #a3e635;
            background: rgba(132,204,22,0.1);
            border: 1px solid rgba(132,204,22,0.28);
            padding: 3px 9px;
            border-radius: 2px;
            text-decoration: none;
            transition: background 0.15s;
          }
          .bph-tag:hover { background: rgba(132,204,22,0.2); }

          /* Reveal staggered elements once 'ready' class lands */
          .bph-root.ready .bph-date,
          .bph-root.ready .bph-title,
          .bph-root.ready .bph-tags {
            opacity: 1;
            transform: translateY(0);
          }

          /* Bottom lime accent */
          .bph-accent {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #84cc16 0%, #4ade80 60%, transparent 100%);
          }
        `}</style>

        <div
          className={`bph-root${ready ? " ready" : ""}`}
          role="banner"
          aria-label={title}
        >
          <div
            className={`bph-bg${ready ? " ready" : ""}`}
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
          />
          <div className="bph-overlay" aria-hidden="true" />
          <div className="bph-accent" aria-hidden="true" />

          <Link href="/blog" className="bph-back">
            ← All Posts
          </Link>

          <div className="bph-content">
            {date && <p className="bph-date">{date}</p>}
            <h1 className="bph-title">{title}</h1>
            {tags.length > 0 && (
              <div className="bph-tags">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tagToSlug(tag)}`}
                    className="bph-tag"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ── WITHOUT IMAGE — typographic header ─────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto px-4 pt-10 pb-6">
      <Link
        href="/blog"
        className="text-sm text-gray-400 hover:text-lime-700 transition-colors mb-6 inline-block"
      >
        ← All Posts
      </Link>

      {date && (
        <time className="text-sm text-gray-400 block mb-2 tracking-wide">
          {date}
        </time>
      )}

      <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-tight">
        {title}
      </h1>

      {excerpt && (
        <p className="text-lg text-gray-500 mt-3 leading-relaxed">{excerpt}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tagToSlug(tag)}`}
              className="text-xs font-medium bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-3 py-1 hover:bg-lime-100 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      <hr className="border-gray-200 mt-8" />
    </div>
  );
}
