import fs from 'fs';
import Link from 'next/link';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getSubmissions } from '@/lib/contactSubmissions';
import { getAllPosts } from '@/lib/blog';
import { GALLERY_DIR } from '@/lib/paths';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard | Admin' };

function StatCard({ label, value, sub, href, permission, userRole }) {
  if (permission && !hasPermission(userRole, permission)) return null;
  const inner = (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-lime-400 transition-colors">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  // Gather stats
  const allPosts = getAllPosts();
  const publishedCount = allPosts.filter(p => p.published).length;
  const draftCount = allPosts.length - publishedCount;

  const submissions = hasPermission(user.role, 'contact.view') ? getSubmissions() : [];
  const unreadContacts = submissions.filter(s => !s.read).length;

  let galleryCount = 0;
  try {
    galleryCount = fs.readdirSync(GALLERY_DIR)
      .filter(f => /\.(jpe?g|png|webp|gif|mp4|mov|webm)$/i.test(f) && !f.endsWith('.thumb.webp'))
      .length;
  } catch { /* gallery dir may not exist yet */ }

  const quickLinks = [
    { label: 'Gallery',      href: '/admin/gallery',      permission: 'gallery.view'      },
    { label: 'Blog',         href: '/admin/blog',         permission: 'blog.view'     },
    { label: 'Contact',      href: '/admin/contact',      permission: 'contact.view'      },
    { label: 'Testimonials', href: '/admin/testimonials', permission: 'testimonials.view' },
    { label: 'Users',        href: '/admin/users',        permission: 'users.view'        },
    { label: 'Whitelist',    href: '/admin/whitelist',    permission: 'whitelist.view'    },
    { label: 'Backup',       href: '/admin/backup',       permission: 'backup.view'       },
  ].filter(({ permission }) => hasPermission(user.role, permission));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user.username}</h1>
        <p className="text-gray-500 text-sm mt-1">P&S Contracting and Landscape — Admin Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Gallery Images" value={galleryCount} href="/admin/gallery" permission="gallery.view" userRole={user.role} />
        <StatCard label="Published Posts" value={publishedCount} sub={draftCount > 0 ? `${draftCount} draft${draftCount !== 1 ? 's' : ''}` : null} href="/admin/blog" permission="blog.view" userRole={user.role} />
        <StatCard label="Unread Contacts" value={unreadContacts} sub={submissions.length > 0 ? `${submissions.length} total` : null} href="/admin/contact" permission="contact.view" userRole={user.role} />
        <StatCard label="Total Contacts" value={submissions.length} href="/admin/contact" permission="contact.view" userRole={user.role} />
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {quickLinks.map(({ label, href }) => (
          <Link key={href} href={href}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:border-lime-400 hover:text-lime-700 transition-colors text-center">
            {label}
          </Link>
        ))}
        <Link href="/" className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors text-center">
          View Site ↗
        </Link>
      </div>
    </div>
  );
}
