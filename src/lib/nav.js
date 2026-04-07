import fs from 'fs';
import { NAV_FILE } from './paths';

const DEFAULT_NAV = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
  {
    name: 'More', href: '/blog',
    dropdown: [
      { name: 'Services', href: '/services' },
      { name: 'Blog', href: '/blog' },
      { name: 'Get A Quote', href: '/quote' },
      { name: 'Locations', href: '/locations' },
    ],
  },
];

export function getNavItems() {
  try {
    const items = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));
    return Array.isArray(items) ? items : DEFAULT_NAV;
  } catch {
    return DEFAULT_NAV;
  }
}
