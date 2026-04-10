'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { navItems } from '@/config/navItems';

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
    <div className={`bg-(--background) shadow-md z-50 ${stickyDisabled ? '' : ' sticky top-0'}`}>
      <nav className="flex justify-between items-center max-w-6xl lg:text-[30px] md:text-[20px] pl-4 m-auto">
        {/* Logo */}
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Logo" className="max-h-10 md:max-h-16 pb-2" />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex self-stretch items-stretch">
          {navItems.map((item, index) => {
            const hasDropdown = item.dropdown?.length > 0;
            const isActive = pathname === item.href ||
              (hasDropdown && item.dropdown.some(d => pathname === d.href));

            return (
              <li
                key={item.href || index}
                className="relative flex items-stretch"
                onMouseEnter={() => hasDropdown && setOpenDropdown(item.href)}
                onMouseLeave={() => hasDropdown && setOpenDropdown(null)}
              >
                <Link
                  href={item.href|| ""}
                  className={`transition lg:px-6 px-5 flex items-center gap-1 ${
                    isActive ? 'bg-lime-600 ' : 'hover:bg-(--nav-hover)'
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
                  <ul className="absolute top-full left-0 shadow-lg rounded-b-md min-w-[140px] z-50 bg-(--background) border-t  drop-shadow">
                    {item.dropdown.map((d, index) => (
                      <li key={d.name + d.href}>
                        <Link
                          href={d.href}
                          className={`block px-5 py-3 text-sm transition ${
                            pathname === d.href ? 'bg-lime-600 ' : 'hover:bg-(--nav-hover)'
                          } ${item.dropdown.length -1 == index? " rounded-b-md" : ""}`}
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
        <button id='navDropdown' title='Hamburger Menu Dropdown' onClick={toggleMenu} className="md:hidden  px-4 py-3">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Tray Menu */}
      {isOpen && (
        <div className="md:hidden  border-t border-(--nav-hover) shadow-(--select)">
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
                          ? 'bg-(--selected)  font-semibold border-b-4 border-(--nav-hover)'
                          : 'hover:bg-(--nav-hover)'
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
                          ? 'bg-(--selected)  font-semibold border-b-4 border-(--selected-accent)'
                          : 'hover:bg-(--nav-hover)'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}

                  {hasDropdown && expanded && (
                    <ul className=" border-t border-gray-100">
                      {item.dropdown.map(d => (
                        <li key={d.href}>
                          <Link
                            href={d.href}
                            className={`block transition p-4 pl-8 text-sm ${
                              pathname === d.href
                                ? 'bg-(--selected)  font-semibold border-b-4 border-(--nav-hover)'
                                : 'hover:bg-(--nav-hover)'
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
