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

  // No padding on home page - hero extends to nav
  const isHomePage = pathname === '/';

  if (hideMainLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className={isHomePage ? '' : 'pt-28 sm:pt-32'}>
        {children}
      </main>
      <Footer />
    </>
  );
}
