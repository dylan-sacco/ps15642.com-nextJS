import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import EmergencyDisclaimer from '@/components/EmergencyDisclaimer';
import { FaFacebookSquare, FaInstagram, FaGoogle, FaGithub } from 'react-icons/fa';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { footerLinks } from '@/config/footerLinks';

const WHITELIST_FILE = path.join(process.cwd(), 'data', 'ip-whitelist.json');

function isWhitelisted(ip) {
  if (!ip) return false;
  const addr = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  try {
    const list = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
    const now = Date.now();
    return list.some(entry => {
      if (new Date(entry.expiresAt).getTime() <= now) return false;
      const entryIp = entry.ip;
      if (!entryIp.includes('/')) {
        return addr === entryIp;
      }
      const [network, bitsStr] = entryIp.split('/');
      const bits = parseInt(bitsStr, 10);
      if (bits === 0) return true;
      const toInt = s => { const p = s.split('.').map(Number); return ((p[0]<<24)|(p[1]<<16)|(p[2]<<8)|p[3])>>>0; };
      const reqInt = toInt(addr), netInt = toInt(network);
      if (isNaN(reqInt) || isNaN(netInt) || bits > 32) return false;
      const mask = (~0 << (32 - bits)) >>> 0;
      return (reqInt & mask) === (netInt & mask);
    });
  } catch {
    return false;
  }
}

export default async function Footer() {
  const hdrs = await headers();
  const ip = hdrs.get('x-real-ip') ?? hdrs.get('x-forwarded-for')?.split(',')[0].trim() ?? '';
  const showAdmin = isWhitelisted(ip);
  return (
    <footer className="bg-surface-footer text-on-dark">

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <img src="/logo.png" alt="P&S Contracting and Landscape" className="h-14 mb-4 brightness-0 invert" />
          <p className="text-on-dark-muted text-sm leading-relaxed">
            Serving Westmoreland County, PA since 2007. Professional landscaping,
            hardscaping, and property maintenance you can count on.
          </p>
          <div className="flex gap-4 mt-5 text-on-dark-muted">
            <a href="https://www.facebook.com/PandSContractingandLandscape/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-brand-accent transition">
              <FaFacebookSquare size={22} />
            </a>
            <a href="https://www.instagram.com/p.s.contracting/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-brand-accent transition">
              <FaInstagram size={22} />
            </a>
            <a href="https://www.bbb.org/us/pa/irwin/profile/landscape-contractors/ps-contracting-and-landscape-0141-71031381" target="_blank" rel="noopener noreferrer" aria-label="BBB" className="hover:text-brand-accent transition font-bold text-lg leading-none flex items-center">
              BBB
            </a>
            <a href="https://goo.gl/maps/SYQwxzQwuiNtmQCDA" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="hover:text-brand-accent transition">
              <FaGoogle size={20} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-brand-accent font-semibold uppercase tracking-wider text-sm mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {footerLinks.map(({ name, href }) => (
              <li key={href}>
                <Link href={href} className="text-on-dark-muted hover:text-brand-accent transition text-sm">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-brand-accent font-semibold uppercase tracking-wider text-sm mb-4">Contact Us</h3>
          <ul className="space-y-3 text-on-dark-muted text-sm">
            <li>
              <a href="tel:+17243828201" className="flex items-center gap-2 hover:text-brand-accent transition">
                <Phone size={16} className="flex-shrink-0" />
                (724) 382-8201
              </a>
            </li>
            <li>
              <a href="mailto:pscontractingandlandscape@gmail.com" className="flex items-center gap-2 hover:text-brand-accent transition break-all">
                <Mail size={16} className="flex-shrink-0" />
                pscontractingandlandscape@gmail.com
              </a>
            </li>
            <li>
              <a href="https://goo.gl/maps/SYQwxzQwuiNtmQCDA" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-brand-accent transition">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                Irwin, PA · Westmoreland County
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Trust strip */}
      <div className="border-t border-brand-deep">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-on-dark-muted/70">
          <span>Licensed &amp; Insured</span>
          <span aria-hidden="true">&middot;</span>
          <a href="https://www.bbb.org/us/pa/irwin/profile/landscape-contractors/ps-contracting-and-landscape-0141-71031381" target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent transition-colors">BBB Accredited</a>
          <span aria-hidden="true">&middot;</span>
          <span>10% Senior Discount</span>
          <span aria-hidden="true">&middot;</span>
          <EmergencyDisclaimer />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-deep">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-on-dark-muted text-xs">
          <p>&copy; {new Date().getFullYear()} P&S Contracting and Landscape. All rights reserved.</p>
          <a href="/feed.xml" className="text-on-dark-muted/70 hover:text-brand-accent transition text-xs flex items-center gap-1" title="RSS Feed">
            RSS Feed
          </a>
          {showAdmin && (
            <Link href="/admin" className="text-on-dark-muted/70 hover:text-brand-accent transition text-xs">
              Admin
            </Link>
          )}
          <p className="flex items-center gap-1">
            Website by{' '}
            <a
              href="https://github.com/dylan-sacco/ps15642.com-nextJS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-mid hover:text-brand-accent transition flex items-center gap-1 ml-1"
            >
              Dylan Sacco <FaGithub size={13} />
            </a>
            <span className="ml-1">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
          </p>
        </div>
      </div>

    </footer>
  );
}
