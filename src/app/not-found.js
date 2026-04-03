import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | P&S Contracting and Landscape',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black text-lime-600 leading-none">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Page Not Found</h1>
      <p className="mt-3 text-gray-500 max-w-sm">
        Sorry, we couldn&apos;t find the page you were looking for.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-lime-600 hover:bg-lime-700 text-white font-medium rounded-lg transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
