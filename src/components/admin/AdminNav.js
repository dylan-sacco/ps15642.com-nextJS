'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/gallery',      label: 'Gallery',      permission: 'gallery.view'      },
  { href: '/admin/before-after', label: 'Before/After', permission: 'beforeafter.view'  },
  { href: '/admin/crew',         label: 'Crew',         permission: 'crew.view'         },
  { href: '/admin/blog',         label: 'Blog',         permission: 'blog.view'         },
  { href: '/admin/locations',    label: 'Locations',    permission: 'locations.view'    },
  // { href: '/admin/testimonials', label: 'Testimonials', permission: 'testimonials.view' },
  { href: '/admin/banners',      label: 'Banners',      permission: 'banners.view'      },
  { href: '/admin/contact',      label: 'Contact',      permission: 'contact.view'      },
  { href: '/admin/quotes',       label: 'Quotes',       permission: 'quotes.view'       },
  { href: '/admin/whitelist',    label: 'Whitelist',    permission: 'whitelist.view'    },
  { href: '/admin/users',        label: 'Users',        permission: 'users.view'        },
  { href: '/admin/backup',       label: 'Backup',       permission: 'backup.view'       },
];

export default function AdminNav({ username, permissions = [] }) {
  const pathname = usePathname();
  const router = useRouter();

  const visible = NAV_ITEMS.filter(item => permissions.includes(item.permission));

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <nav className="bg-gray-900 text-white flex items-center gap-1 px-4 py-2 text-sm font-medium border-b border-gray-700 flex-wrap ">
      <Link className="text-lime-400 font-bold mr-4" href="/admin">Admin Panel</Link>
      {visible.map(({ href, label }) => {
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
      <div className="ml-auto flex items-center gap-3">
        {username && (
          <span className="text-gray-400 text-xs hidden sm:inline">{username}</span>
        )}
        <Link href="/" className="text-gray-400 hover:text-white text-xs transition-colors">
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 text-xs transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
