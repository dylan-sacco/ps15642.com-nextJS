import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookSquare, FaInstagram, FaGoogle, FaGithub } from 'react-icons/fa';

const navLinks = [
  { name: 'Home',     href: '/'         },
  { name: 'Blog',     href: '/blog'     },
  { name: 'About',    href: '/about'    },
  { name: 'Services', href: '/services' },
  { name: 'Gallery',  href: '/gallery'  },
  { name: 'Contact',  href: '/contact'  },
];

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white">

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <img src="/logo.png" alt="P&S Contracting and Landscape" className="h-14 mb-4 brightness-0 invert" />
          <p className="text-green-300 text-sm leading-relaxed">
            Serving Westmoreland County, PA since 2007. Professional landscaping,
            hardscaping, and property maintenance you can count on.
          </p>
          <div className="flex gap-4 mt-5 text-green-300">
            <a href="https://www.facebook.com/PandSContractingandLandscape/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-lime-400 transition">
              <FaFacebookSquare size={22} />
            </a>
            <a href="https://www.instagram.com/p.s.contracting/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-lime-400 transition">
              <FaInstagram size={22} />
            </a>
            <a href="https://www.bbb.org/us/pa/irwin/profile/landscape-contractors/ps-contracting-and-landscape-0141-71031381" target="_blank" rel="noopener noreferrer" aria-label="BBB" className="hover:text-lime-400 transition font-bold text-lg leading-none flex items-center">
              BBB
            </a>
            <a href="https://goo.gl/maps/SYQwxzQwuiNtmQCDA" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="hover:text-lime-400 transition">
              <FaGoogle size={20} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-lime-400 font-semibold uppercase tracking-wider text-sm mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {navLinks.map(({ name, href }) => (
              <li key={href}>
                <Link href={href} className="text-green-300 hover:text-lime-400 transition text-sm">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lime-400 font-semibold uppercase tracking-wider text-sm mb-4">Contact Us</h3>
          <ul className="space-y-3 text-green-300 text-sm">
            <li>
              <a href="tel:+17243828201" className="flex items-center gap-2 hover:text-lime-400 transition">
                <Phone size={16} className="flex-shrink-0" />
                (724) 382-8201
              </a>
            </li>
            <li>
              <a href="mailto:pscontractingandlandscape@gmail.com" className="flex items-center gap-2 hover:text-lime-400 transition break-all">
                <Mail size={16} className="flex-shrink-0" />
                pscontractingandlandscape@gmail.com
              </a>
            </li>
            <li>
              <a href="https://goo.gl/maps/SYQwxzQwuiNtmQCDA" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-lime-400 transition">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                Irwin, PA · Westmoreland County
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-green-400 text-xs">
          <p>&copy; {new Date().getFullYear()} P&S Contracting and Landscape. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Website by{' '}
            <a
              href="https://github.com/dylan-sacco/ps15642.com-nextJS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-500 hover:text-lime-300 transition flex items-center gap-1 ml-1"
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
