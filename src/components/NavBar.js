'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <img src="https://ps15642.com/img/logo.png" alt="Logo" className="h-10" />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`hover:underline transition ${pathname === item.href ? 'font-bold underline text-lime-700' : ''
                  }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-black">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Tray Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner">
          <ul className="flex flex-col space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-2 px-3 rounded transition ${pathname === item.href
                      ? 'bg-gray-800 text-white font-semibold'
                      : 'hover:bg-gray-100'
                    }`}

                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
