'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  DollarSign,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AdminStats {
  totalClients: number;
  activeSubscriptions: number;
  pendingCheckIns: number;
  unreadMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 0,
    activeSubscriptions: 0,
    pendingCheckIns: 0,
    unreadMessages: 0,
  });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const supabase = createClient();

    // Fetch total clients
    const { count: clientCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    // Fetch active subscriptions
    const { count: subCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Fetch pending check-ins
    const { count: checkInCount } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Fetch unread messages
    const { data: { user } } = await supabase.auth.getUser();
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user?.id)
      .eq('read', false);

    // Fetch recent clients
    const { data: clients } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      totalClients: clientCount || 0,
      activeSubscriptions: subCount || 0,
      pendingCheckIns: checkInCount || 0,
      unreadMessages: messageCount || 0,
    });

    setRecentClients(clients || []);
    setLoading(false);
  };

  const statCards = [
    {
      name: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-600',
      href: '/admin/clients',
    },
    {
      name: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: DollarSign,
      color: 'bg-green-600',
      href: '/admin/clients',
    },
    {
      name: 'Pending Check-ins',
      value: stats.pendingCheckIns,
      icon: ClipboardCheck,
      color: 'bg-orange-600',
      href: '/admin/check-ins',
    },
    {
      name: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-purple-600',
      href: '/admin/messages',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <p className="text-grey-600 mt-1">Overview of your coaching business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-500">{stat.name}</p>
                <p className="text-3xl font-bold text-black mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-grey-500 group-hover:text-blue-600">
              View details
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Recent Clients</h2>
            <Link href="/admin/clients" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {recentClients.length > 0 ? (
            <ul className="space-y-4">
              {recentClients.map((client) => (
                <li key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold">
                      {client.full_name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-medium text-black">{client.full_name || 'Unknown'}</p>
                      <p className="text-sm text-grey-500">{client.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-grey-500 text-center py-8">No clients yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6">
          <h2 className="text-lg font-bold text-black mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/check-ins"
              className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-black">Review pending check-ins</span>
              </div>
              <span className="text-sm text-orange-600">{stats.pendingCheckIns} pending</span>
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-black">Respond to messages</span>
              </div>
              <span className="text-sm text-purple-600">{stats.unreadMessages} unread</span>
            </Link>
            <Link
              href="/admin/programs"
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-black">Manage workout programs</span>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
