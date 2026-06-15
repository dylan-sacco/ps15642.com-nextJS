'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mail, Phone, X } from 'lucide-react';
import { FaFacebookSquare, FaGoogle, FaInstagram } from 'react-icons/fa';

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchesPage(pages, pathname) {
  if (!pages?.length) return false;
  return pages.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      return pathname === prefix || pathname.startsWith(prefix + '/');
    }
    return pathname === pattern;
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ContactBanner({ banner }) {
  return (
    <div
      className="flex flex-wrap justify-start md:justify-center gap-4 md:gap-12 p-4 text-white"
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      <div className="flex space-x-2 items-center">
        <a href="https://www.facebook.com/PandSContractingandLandscape/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">
          <FaFacebookSquare size={24} /><p hidden>Facebook</p>
        </a>
        <a href="https://www.instagram.com/p.s.contracting/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">
          <FaInstagram size={24} /><p hidden>Instagram</p>
        </a>
        <a
          href="https://www.bbb.org/us/pa/irwin/profile/landscape-contractors/ps-contracting-and-landscape-0141-71031381"
          target="_blank" rel="noopener noreferrer"
          className="hover:opacity-70 transition font-serif text-3xl flex items-center"
          style={{ lineHeight: '24px', height: '24px' }}
        ><b>B</b></a>
        <a href="https://goo.gl/maps/SYQwxzQwuiNtmQCDA" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition">
          <FaGoogle size={22} /><p hidden>Google</p>
        </a>
      </div>
      <a href="tel:+17243828201" className="flex items-center gap-2 hover:opacity-70 transition">
        <Phone size={24} /><span>(724) 382-8201</span>
      </a>
      <a href="mailto:pscontractingandlandscape@gmail.com" className="flex items-center gap-2 hover:opacity-70 transition">
        <Mail size={24} /><span>pscontractingandlandscape@gmail.com</span>
      </a>
    </div>
  );
}

function AnnouncementBanner({ banner, onDismiss }) {
  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-sm relative"
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      <span>{banner.content}</span>
      {banner.link && (
        <Link href={banner.link} className="underline font-semibold hover:opacity-80 transition">
          {banner.linkText || 'Learn More'}
        </Link>
      )}
      {banner.dismissible && onDismiss && (
        <button onClick={onDismiss} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// Horizontal marquee ticker — all banners concatenated, scrolling continuously
function MarqueeTicker({ banners, speed }) {
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(20);
  const bg = banners[0]?.bgColor ?? '#16a34a';
  const fg = banners[0]?.textColor ?? '#ffffff';

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // Half of scrollWidth because we duplicate the content
    const halfW = el.scrollWidth / 2;
    if (halfW > 0 && speed > 0) setDuration(halfW / speed);
  }, [speed, banners]);

  const items = (
    <span className="inline-flex items-center">
      {banners.map((b, i) => {
        const nextColor = banners[(i + 1) % banners.length]?.bgColor ?? b.bgColor;
        return (
          <span key={b.id} className="inline-flex items-center gap-8 py-2 w-[80vw]" style={{ background: `linear-gradient(to right, ${b.bgColor} 0%, ${b.bgColor} 95%, ${nextColor} 100%)` }}>
            <span className='ml-auto' >{b.content}</span>
            {b.link && (
              <a href={b.link} className="underline font-semibold hover:opacity-80 transition mr-auto" >
                {b.linkText || 'Learn More'}
              </a>
            )}
            {banners.length > 1 && <span className="mx-4 opacity-40 select-none ml-auto mr-5">✦</span>}
          </span>
        );
      })}
    </span>
  );

  return (
    <div className="overflow-hidden text-sm" style={{ backgroundColor: bg, color: fg }}>
      <style>{`@keyframes ps-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div
        ref={trackRef}
        style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: `ps-marquee ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {items}
        <span aria-hidden="true" className="inline-flex items-center">{items}</span>
      </div>
    </div>
  );
}

// Flip rotator — displays one banner at a time, cycles based on screenTime / scrollInterval
function FlipRotator({ banners, scrollInterval, onDismiss }) {
  const [idx, setIdx] = useState(0);
  const current = banners[idx % banners.length];

  useEffect(() => {
    if (banners.length <= 1) return;
    const secs = (current?.screenTime ?? scrollInterval ?? 5);
    const t = setTimeout(() => setIdx(i => (i + 1) % banners.length), secs * 1000);
    return () => clearTimeout(t);
  }, [idx, banners, current, scrollInterval]);

  if (!current) return null;
  return <AnnouncementBanner banner={current} onDismiss={onDismiss ? () => onDismiss(current.id) : null} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BannerBar({ banners, settings = {} }) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dismissed-banners') || '[]');
      setDismissed(new Set(stored));
    } catch {}
    setMounted(true);
  }, []);

  function dismiss(id) {
    const next = new Set([...dismissed, id]);
    setDismissed(next);
    try { localStorage.setItem('dismissed-banners', JSON.stringify([...next])); } catch {}
  }

  // Pre-mount: render contact banner only to avoid hydration mismatch
  if (!mounted) {
    const contact = banners.find(b => b.type === 'contact' && b.active);
    return contact ? <ContactBanner banner={contact} /> : null;
  }

  const now = new Date();
  const visible = banners
    .filter(b => b.active)
    .filter(b => !b.startDate || new Date(b.startDate) <= now)
    .filter(b => !b.endDate || new Date(b.endDate) >= now)
    .filter(b => matchesPage(b.pages, pathname))
    .filter(b => !b.dismissible || !dismissed.has(b.id))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (visible.length === 0) return null;

  const contactBanner = visible.find(b => b.type === 'contact');
  const announcements = visible.filter(b => b.type !== 'contact');

  const { scrollBanner, scrollAnimation, scrollSpeed = 80, scrollInterval = 5 } = settings;

  // In scroll mode: sticky banners are pinned as rows above the ticker;
  // non-sticky banners go into the ticker.
  const stickyRows = scrollBanner ? announcements.filter(b => b.sticky) : [];
  const tickerBanners = scrollBanner ? announcements.filter(b => !b.sticky) : announcements;

  return (
    <>
      {contactBanner && <ContactBanner banner={contactBanner} />}

      {/* Sticky announcement rows (scroll mode only — excluded from ticker) */}
      {stickyRows.map(b => (
        <AnnouncementBanner key={b.id} banner={b} onDismiss={b.dismissible ? () => dismiss(b.id) : null} />
      ))}

      {/* Ticker / normal rows */}
      {tickerBanners.length > 0 && (
        scrollBanner ? (
          scrollAnimation
            ? <MarqueeTicker banners={tickerBanners} speed={scrollSpeed} />
            : <FlipRotator banners={tickerBanners} scrollInterval={scrollInterval} onDismiss={dismiss} />
        ) : (
          tickerBanners.map(b => (
            <AnnouncementBanner key={b.id} banner={b} onDismiss={b.dismissible ? () => dismiss(b.id) : null} />
          ))
        )
      )}
    </>
  );
}
