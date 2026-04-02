import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { getTestimonials } from '@/lib/testimonials';
import TestimonialManager from '@/components/admin/TestimonialManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Testimonials | Admin' };

export default async function AdminTestimonialsPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'testimonials.view')) {
    return <PermissionDenied permission="testimonials.view" />;
  }

  const testimonials = getTestimonials();
  const canManage = hasPermission(user.role, 'testimonials.manage');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Testimonials</h1>
      <TestimonialManager initialTestimonials={testimonials} canManage={canManage} />
    </div>
  );
}
