'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/articles', label: 'Articles' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white flex items-center gap-1 px-4 py-2 text-sm font-medium border-b border-gray-700">
      <span className="text-lime-400 font-bold mr-4">Admin Panel</span>
      {navItems.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded transition-colors ${
              active
                ? 'bg-lime-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {label}
          </Link>
        );
      })}
      <div className="ml-auto">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-xs transition-colors"
        >
          View Site
        </Link>
      </div>
    </nav>
  );
}
