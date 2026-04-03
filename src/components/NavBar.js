'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about'},
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
  {
    name: 'More', href: '/blog', dropdown: [
      { name: 'Services', href: '/services' },
      { name: 'Blog', href: '/blog' },
      { name: 'Get A Quote', href: '/quote' },
      { name: 'Locations', href: '/locations'}
    ],
  },
];

export default function NavBar({ stickyDisabled = false }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);   // href of open desktop dropdown
  const [mobileExpanded, setMobileExpanded] = useState({}); // { [href]: bool }

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleMobileItem = (href) =>
    setMobileExpanded(prev => ({ ...prev, [href]: !prev[href] }));

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Removed By Dylan Sacco 04/02/2026, Made hamburger button un-clickable for mobile on certain devices
  // useEffect(() => {
  //   if (!isMobile) return;
  //   const handleScroll = () => {
  //     const currentScrollY = window.scrollY;
  //     if (currentScrollY > lastScrollY && currentScrollY > 50) setIsOpen(false);
  //     setLastScrollY(currentScrollY);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [lastScrollY, isMobile]);

  return (
    <div className={`bg-white shadow-md z-50${stickyDisabled ? '' : ' sticky top-0'}`}>
      <nav className="flex justify-between items-center max-w-6xl lg:text-[30px] md:text-[20px] pl-4">
        {/* Logo */}
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="max-h-10 md:max-h-16" />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex self-stretch items-stretch">
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

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-black px-4 py-3">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Tray Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner shadow-xl">
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
