import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';

export default async function AdminPage() {
  const user = await getSessionUser();

  // Middleware already guards /admin, but if somehow no session, send to login
  if (!user) redirect('/admin/login');

  const destinations = [
    { permission: 'gallery.view',   href: '/admin/gallery'   },
    { permission: 'articles.view',  href: '/admin/articles'  },
    { permission: 'whitelist.view', href: '/admin/whitelist' },
    { permission: 'users.view',     href: '/admin/users'     },
  ];

  for (const { permission, href } of destinations) {
    if (hasPermission(user.role, permission)) redirect(href);
  }

  // No permissions at all — show a plain message
  redirect('/admin/login');
}
