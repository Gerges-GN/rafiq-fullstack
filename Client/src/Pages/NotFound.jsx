import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-semibold text-orange-600">404</p>
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="text-gray-600">That Rafiq page doesn’t exist.</p>
      <Link to="/" className="rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white">
        Return home
      </Link>
    </main>
  );
}
