import AdminNav from '@/components/admin/AdminNav';

export const metadata = {
  title: 'Admin | P&S Contracting',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  );
}
