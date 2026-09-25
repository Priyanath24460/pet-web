import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-slate-800">
      <h2 className="text-4xl font-extrabold mb-4 text-blue-600">404</h2>
      <h3 className="text-xl font-semibold mb-6">Page Not Found</h3>
      <p className="mb-8 text-slate-500">The pet you're looking for might be hiding.</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition">
        Return Home
      </Link>
    </div>
  );
}
