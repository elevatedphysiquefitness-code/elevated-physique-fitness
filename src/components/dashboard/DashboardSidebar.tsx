'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  CheckSquare,
  MessageSquare,
  PlayCircle,
  Calendar,
  Apple,
  CreditCard,
  Settings,
  LogOut,
  X,
  Target,
  UtensilsCrossed,
  Gift,
  BarChart3,
  Bell,
  Award,
  ChefHat,
  Activity,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'Nutrition', href: '/dashboard/nutrition', icon: Apple },
  { name: 'Food History', href: '/dashboard/food-history', icon: UtensilsCrossed },
  { name: 'Meal Plan', href: '/dashboard/meals', icon: ChefHat },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Check-ins', href: '/dashboard/check-ins', icon: Calendar },
  { name: 'Grades', href: '/dashboard/grades', icon: Award },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Videos', href: '/dashboard/videos', icon: PlayCircle },
  { name: 'Referrals', href: '/dashboard/referrals', icon: Gift },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-black text-white transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-grey-800">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight uppercase">
              Elevated Physique
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-grey-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-grey-400 hover:bg-grey-800 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-grey-800 p-3 space-y-1">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/dashboard/settings')
                  ? 'bg-blue-600 text-white'
                  : 'text-grey-400 hover:bg-grey-800 hover:text-white'
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-grey-400 hover:bg-grey-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
