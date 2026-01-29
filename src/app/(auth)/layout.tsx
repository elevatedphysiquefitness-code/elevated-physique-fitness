import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-grey-100 flex flex-col">
      {/* Simple Header */}
      <header className="py-6 px-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="inline-block">
            <span className="text-xl font-bold tracking-tight uppercase text-black">
              Elevated Physique
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-grey-500 text-sm">
          &copy; {new Date().getFullYear()} Elevated Physique Fitness. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
