'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Check if mobile once on load and on resize
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Scroll detection (only on mobile)
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNav(false); // scrolling down
      } else {
        setShowNav(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <nav className="flex justify-between items-center py-2 max-w-6xl mx-auto lg:text-[30px] md:text-[20px] overflow-hidden px-4  ">
        {/* Logo */}
        <Link href="/">
          <img src="/logo.png" alt="Logo" className="max-h-10 md:max-h-16" />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`transition py-10 lg:px-6 px-4 ${pathname === item.href ? 'bg-lime-600 text-white' : ' hover:bg-green-100'
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
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner shadow-xl">
          <ul className="flex flex-col ">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block transition p-4 ${
                    pathname === item.href
                      ? 'bg-amber-700 text-white font-semibold border-b-4 border-amber-500  '
                      : 'hover:bg-green-100'
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
