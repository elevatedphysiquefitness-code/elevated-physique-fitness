'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        }

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-grey-100 flex">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userId={userId}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
