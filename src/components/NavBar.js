'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const FALLBACK_NAV = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
  {
    name: 'More', href: '/blog', dropdown: [
      { name: 'Services', href: '/services' },
      { name: 'Blog', href: '/blog' },
      { name: 'Get A Quote', href: '/quote' },
      { name: 'Locations', href: '/locations' },
    ],
  },
];

export default function NavBar({ stickyDisabled = false, items }) {
  const navItems = items || FALLBACK_NAV;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [forceCollapse, setForceCollapse] = useState(false);

  const navRef = useRef(null);
  const ghostRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleMobileItem = (href) =>
    setMobileExpanded(prev => ({ ...prev, [href]: !prev[href] }));

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Detect overflow — collapse to hamburger if desktop items don't fit
  useEffect(() => {
    const check = () => {
      if (!navRef.current || !ghostRef.current) return;
      const available = navRef.current.offsetWidth;
      const logoEl = navRef.current.querySelector('[data-logo]');
      const logoW = logoEl ? logoEl.offsetWidth + 32 : 140;
      const itemsW = ghostRef.current.offsetWidth;
      setForceCollapse(itemsW + logoW > available - 8);
    };
    const observer = new ResizeObserver(check);
    if (navRef.current) observer.observe(navRef.current);
    check();
    return () => observer.disconnect();
  }, [navItems]);

  const showHamburger = isMobile || forceCollapse;

  return (
    <div className={`bg-white shadow-md z-50${stickyDisabled ? '' : ' sticky top-0'}`}>
      <nav ref={navRef} className="flex justify-between items-center max-w-6xl mx-auto lg:text-[30px] md:text-[20px] pl-4">
        {/* Logo */}
        <Link href="/" data-logo="">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="max-h-10 md:max-h-16 pb-2" />
        </Link>

        {/* Ghost measurement row — invisible, used to detect overflow */}
        <ul ref={ghostRef} className="absolute opacity-0 pointer-events-none flex whitespace-nowrap lg:text-[30px] md:text-[20px]" aria-hidden="true">
          {navItems.map(item => (
            <li key={item.href} className="lg:px-6 px-5 flex items-center gap-1">
              {item.name}
              {item.dropdown?.length > 0 && <ChevronDown size={14} />}
            </li>
          ))}
        </ul>

        {/* Desktop Nav */}
        {!showHamburger && (
          <ul className="flex self-stretch items-stretch">
            {navItems.map((item) => {
              const hasDropdown = item.dropdown?.length > 0;
              const isActive = pathname === item.href ||
                (hasDropdown && item.dropdown.some(d => pathname === d.href));

              return (
                <li
                  key={item.href}
                  className="relative flex items-stretch"
                  onMouseEnter={() => hasDropdown && setOpenDropdown(item.href)}
                  onMouseLeave={() => hasDropdown && setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`transition lg:px-6 px-5 flex items-center gap-1 ${
                      isActive ? 'bg-lime-600 text-white' : 'hover:bg-green-100'
                    }`}
                  >
                    {item.name}
                    {hasDropdown && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${openDropdown === item.href ? 'rotate-180' : ''}`}
                      />
                    )}
                  </Link>

                  {hasDropdown && openDropdown === item.href && (
                    <ul className="absolute top-full left-0 bg-white shadow-lg border border-gray-100 rounded-b-md min-w-[140px] z-50">
                      {item.dropdown.map(d => (
                        <li key={d.href}>
                          <Link
                            href={d.href}
                            className={`block px-5 py-3 text-sm transition ${
                              pathname === d.href ? 'bg-lime-600 text-white' : 'hover:bg-green-100'
                            }`}
                          >
                            {d.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Hamburger button */}
        {showHamburger && (
          <button id="navDropdown" title="Hamburger Menu Dropdown" onClick={toggleMenu} className="text-black px-4 py-3">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </nav>

      {/* Mobile / collapsed tray */}
      {showHamburger && isOpen && (
        <div className="bg-white border-t border-gray-200 shadow-inner shadow-xl">
          <ul className="flex flex-col">
            {navItems.map((item) => {
              const hasDropdown = item.dropdown?.length > 0;
              const isActive = pathname === item.href ||
                (hasDropdown && item.dropdown.some(d => pathname === d.href));
              const expanded = mobileExpanded[item.href] ?? false;

              return (
                <li key={item.href}>
                  {hasDropdown ? (
                    <button
                      onClick={() => toggleMobileItem(item.href)}
                      className={`w-full flex items-center justify-between p-4 transition ${
                        isActive
                          ? 'bg-amber-700 text-white font-semibold border-b-4 border-amber-500'
                          : 'hover:bg-green-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block transition p-4 ${
                        pathname === item.href
                          ? 'bg-amber-700 text-white font-semibold border-b-4 border-amber-500'
                          : 'hover:bg-green-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}

                  {hasDropdown && expanded && (
                    <ul className="bg-gray-50 border-t border-gray-100">
                      {item.dropdown.map(d => (
                        <li key={d.href}>
                          <Link
                            href={d.href}
                            className={`block transition p-4 pl-8 text-sm ${
                              pathname === d.href
                                ? 'bg-amber-700 text-white font-semibold border-b-4 border-amber-500'
                                : 'hover:bg-green-100'
                            }`}
                            onClick={() => { setIsOpen(false); toggleMobileItem(item.href); }}
                          >
                            {d.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
