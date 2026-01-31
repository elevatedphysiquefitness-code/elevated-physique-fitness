'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, MessageSquare, CheckCircle, X, Dumbbell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import ProfileAvatar from '@/components/ui/ProfileAvatar';

interface Notification {
  id: string;
  type: 'message' | 'check_in_feedback' | 'program_update';
  title: string;
  message: string;
  link: string;
  read: boolean;
  created_at: string;
}

interface DashboardHeaderProps {
  onMenuClick: () => void;
  userName?: string;
  userId?: string;
  avatarUrl?: string | null;
}

export default function DashboardHeader({ onMenuClick, userName, userId, avatarUrl }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch unread messages count
    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    // Fetch recent check-in feedback (check-ins with coach feedback added in last 7 days)
    const { data: recentCheckins } = await supabase
      .from('check_ins')
      .select('id, coach_feedback, updated_at')
      .eq('client_id', user.id)
      .eq('status', 'reviewed')
      .not('coach_feedback', 'is', null)
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false })
      .limit(5);

    // Build notifications list
    const notificationsList: Notification[] = [];

    // Add unread messages notification
    if (unreadMessages && unreadMessages > 0) {
      notificationsList.push({
        id: 'unread-messages',
        type: 'message',
        title: 'New Messages',
        message: `You have ${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}`,
        link: '/dashboard/messages',
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    // Add check-in feedback notifications
    if (recentCheckins) {
      recentCheckins.forEach((checkin) => {
        notificationsList.push({
          id: `checkin-${checkin.id}`,
          type: 'check_in_feedback',
          title: 'Coach Feedback',
          message: 'Your coach has reviewed your check-in',
          link: '/dashboard/check-ins',
          read: false,
          created_at: checkin.updated_at,
        });
      });
    }

    setNotifications(notificationsList);
    setUnreadCount(notificationsList.length);
  };

  const setupRealtimeSubscription = () => {
    const supabase = createClient();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to check-in updates
    const checkinsChannel = supabase
      .channel('checkins-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'check_ins',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(checkinsChannel);
    };
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'check_in_feedback':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'program_update':
        return <Dumbbell className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-grey-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative text-grey-600 hover:text-black p-2"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-grey-200 shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-grey-200">
                  <h3 className="font-semibold text-black">Notifications</h3>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-grey-400 hover:text-black"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-grey-50 border-b border-grey-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black text-sm">{notification.title}</p>
                          <p className="text-grey-600 text-sm truncate">{notification.message}</p>
                          <p className="text-grey-400 text-xs mt-1">{formatTime(notification.created_at)}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 mx-auto text-grey-300 mb-2" />
                      <p className="text-grey-500 text-sm">No new notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-grey-200">
                    <Link
                      href="/dashboard/messages"
                      onClick={() => setShowDropdown(false)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      View all messages →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar */}
          <Link href="/dashboard/settings" title="Profile Settings">
            <ProfileAvatar
              userId={userId}
              avatarUrl={avatarUrl}
              userName={userName}
              size="md"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
