'use client';

import { Menu, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

export default function DashboardHeader({ onMenuClick, userName }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-grey-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-grey-600 hover:text-black"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <p className="text-sm text-grey-500">Welcome back,</p>
            <p className="font-semibold text-black">{userName || 'Client'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-grey-600 hover:text-black">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
              2
            </span>
          </button>
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold">
            {userName?.charAt(0).toUpperCase() || 'C'}
          </div>
        </div>
      </div>
    </header>
  );
}
