'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <div className='bg-white shadow-md sticky top-0 z-50 bg-white shadow'>
      <nav className="flex flex-row justify-between items-center p-4 bg-white text-black max-w-6xl mx-auto
    
    ">
      <img src="https://ps15642.com/img/logo.png" alt="Logo" className="h-10" />
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`hover:underline transition ${
                pathname === item.href ? 'font-bold underline text-lime-700' : ''
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
    </div>
  );
}
