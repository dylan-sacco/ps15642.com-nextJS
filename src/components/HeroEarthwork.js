"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * HeroEarthwork — Option 1
 * Aesthetic: Raw / grounded. Dark overlay, diagonal lime-green slash,
 * big Playfair serif, staggered entrance animation. EST. 2007 badge.
 * Feels like a contractor who takes pride in their craft.
 */
export default function HeroEarthwork({ imgUrl = "/hs1.webp" }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Raleway:wght@300;400;600;700&display=swap');

        .hw-root {
          position: relative;
          width: 100%;
          min-height: clamp(400px, 58vh, 560px);
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding-bottom: 56px;
        }

        .hw-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 35%;
          background-repeat: no-repeat;
          transform: scale(1.06);
          transition: transform 9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hw-bg.ready { transform: scale(1); }

        .hw-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            148deg,
            rgba(8, 16, 8, 0.88) 0%,
            rgba(12, 28, 10, 0.78) 45%,
            rgba(8, 16, 8, 0.6) 100%
          );
        }

        .hw-grain {
          position: absolute;
          inset: 0;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px;
          pointer-events: none;
        }

        .hw-slash {
          position: absolute;
          bottom: 0;
          left: -2%;
          width: 48%;
          height: 5px;
          background: #84cc16;
          transform: skewX(-22deg);
          transform-origin: left bottom;
        }
        .hw-slash::after {
          content: '';
          position: absolute;
          bottom: 9px;
          left: 4px;
          width: 28%;
          height: 2px;
          background: rgba(132, 204, 22, 0.38);
          transform: skewX(0);
        }

        .hw-badge {
          position: absolute;
          top: 22px;
          right: 22px;
          font-family: 'Raleway', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 5px 11px;
          pointer-events: none;
        }

        .hw-content {
          position: relative;
          z-index: 2;
          padding: 0 clamp(20px, 5vw, 52px); 
        }

        .hw-eyebrow {
          font-family: 'Raleway', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #a3e635;
          margin: 0 0 14px;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease, transform 0.55s ease;
          transition-delay: 0.08s;
        }

        .hw-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(56px, 9vw, 100px);
          font-weight: 900;
          color: #fff;
          line-height: 0.88;
          letter-spacing: -0.025em;
          margin: 0;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
          transition-delay: 0.2s;
        }

        .hw-subtitle {
          font-family: 'Raleway', sans-serif;
          font-size: clamp(12px, 1.8vw, 16px);
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin: 14px 0 0;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          transition-delay: 0.32s;
        }

        .hw-ctas {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          transition-delay: 0.46s;
        }

        .hw-root.ready .hw-eyebrow,
        .hw-root.ready .hw-title,
        .hw-root.ready .hw-subtitle,
        .hw-root.ready .hw-ctas {
          opacity: 1;
          transform: translateY(0);
        }

        .hw-btn-primary {
          font-family: 'Raleway', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: #84cc16;
          color: #07110a;
          padding: 14px 26px;
          text-decoration: none;
          display: inline-block;
          transition: background 0.18s;
        }
        .hw-btn-primary:hover { background: #a3e635; }

        .hw-btn-ghost {
          font-family: 'Raleway', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: transparent;
          color: rgba(255,255,255,0.75);
          padding: 13px 26px;
          border: 1px solid rgba(255,255,255,0.28);
          text-decoration: none;
          display: inline-block;
          transition: border-color 0.18s, color 0.18s;
        }
        .hw-btn-ghost:hover {
          border-color: rgba(255,255,255,0.65);
          color: #fff;
        }

        @media (max-width: 640px) {
          .hw-root { min-height: 360px; padding-bottom: 44px; }
          .hw-slash { width: 62%; }
        }
      `}</style>

      <div className={`hw-root${loaded ? " ready" : ""}`} role="banner" aria-label="P&S Contracting and Landscape">
        <div
          className={`hw-bg${loaded ? " ready" : ""}`}
          style={{ backgroundImage: `url(${imgUrl})` }}
          aria-hidden="true"
        />
        <div className="hw-overlay" aria-hidden="true" />
        <div className="hw-grain" aria-hidden="true" />
        <div className="hw-slash" aria-hidden="true" />
        

        {/* <div className="hw-content outline">
          <p className="hw-eyebrow">Westmoreland County, PA</p>
          <h1 className="hw-title">P&amp;&nbsp;S</h1>
          <p className="hw-subtitle">Contracting &amp; Landscape</p>
          <div className="hw-ctas">
            <Link href="/quote" className="hw-btn-primary">Get a Free Quote</Link>
            <Link href="/gallery" className="hw-btn-ghost">Our Work</Link>
          </div>
        </div> */}

        <div className="content w-full flex flex-col justify-items-center self-stretch">
          <div className="max-w-6xl w-full relative self-center">
            <div className="hw-badge" aria-hidden="true">Est. 2007</div>
          </div>
          <div className=" hw-content max-w-6xl w-full self-center mt-auto">
            <p className="hw-eyebrow">Westmoreland County, PA</p>
            <h1 className="hw-title">P&nbsp;&amp;&nbsp;S</h1>
            {/* <h1 className="hw-title">P&amp;&nbsp;S</h1> */}
            <p className="hw-subtitle">Contracting &amp; Landscape</p>
            <div className="hw-ctas">
              <Link href="/quote" className="hw-btn-primary">Get a Free Quote</Link>
              <Link href="/gallery" className="hw-btn-ghost">Our Work</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
