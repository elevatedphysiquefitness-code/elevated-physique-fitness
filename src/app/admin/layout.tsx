'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Menu } from 'lucide-react';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setAuthorized(true);
      setChecking(false);
    };

    checkAdmin();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-grey-100 flex items-center justify-center">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-grey-100 flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-grey-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-grey-600 hover:text-black"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <p className="font-semibold text-black">Admin Panel</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
