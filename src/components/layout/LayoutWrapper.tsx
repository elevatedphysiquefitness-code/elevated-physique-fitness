'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide main Header/Footer on dashboard and admin pages
  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');
  const hideMainLayout = isDashboard || isAdmin;

  if (hideMainLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="pt-28 sm:pt-32">
        {children}
      </main>
      <Footer />
    </>
  );
}
