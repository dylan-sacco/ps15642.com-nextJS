import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readUsers } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Admin Login | P&S Contracting' };

export default async function AdminLoginPage() {
  // If already authenticated, skip the login page
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_auth')?.value;
  if (token) {
    redirect('/admin');
  }

  const needsSetup = readUsers().length === 0;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-lime-400 font-bold text-2xl">Admin Panel</span>
          <p className="text-gray-400 text-sm mt-1">P&S Contracting and Landscape</p>
        </div>
        <LoginForm needsSetup={needsSetup} />
      </div>
    </div>
  );
}
