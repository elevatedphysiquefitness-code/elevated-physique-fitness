'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Users,
  DollarSign,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Utensils,
  Droplets,
  Moon,
  Dumbbell,
  CheckSquare,
  Activity,
  AlertCircle,
  Star,
  Calendar,
  ChevronRight,
} from 'lucide-react';

interface AdminStats {
  totalClients: number;
  activeSubscriptions: number;
  pendingCheckIns: number;
  unreadMessages: number;
}

interface PastDueSubscription {
  clientName: string;
  clientId: string;
  planName: string;
  amount: string;
  daysOverdue: number;
}

interface ClientActivity {
  id: string;
  full_name: string;
  email: string;
  lastFoodLog: string | null;
  lastWorkout: string | null;
  lastWaterLog: string | null;
  lastSleepLog: string | null;
  lastCheckIn: string | null;
  todayCalories: number;
  todayWater: number;
  todaySleepHours: number | null;
  todayHabitsCompleted: number;
  todayHabitsTotal: number;
  workoutsThisWeek: number;
  isActive: boolean;
}

interface RecentActivity {
  type: 'food' | 'workout' | 'water' | 'sleep' | 'checkin' | 'habit';
  clientName: string;
  clientId: string;
  description: string;
  timestamp: string;
  value?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalClients: 0,
    activeSubscriptions: 0,
    pendingCheckIns: 0,
    unreadMessages: 0,
  });
  const [clientActivities, setClientActivities] = useState<ClientActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [pastDueSubs, setPastDueSubs] = useState<PastDueSubscription[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Fetch basic stats
    const { count: clientCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    const { count: subCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: checkInCount } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: { user } } = await supabase.auth.getUser();
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user?.id)
      .eq('read', false);

    setStats({
      totalClients: clientCount || 0,
      activeSubscriptions: subCount || 0,
      pendingCheckIns: checkInCount || 0,
      unreadMessages: messageCount || 0,
    });

    // Fetch past due subscriptions
    const { data: pastDueData } = await supabase
      .from('subscriptions')
      .select('client_id, user_id, plan_name, price, next_billing_date')
      .in('status', ['active', 'past_due'])
      .lt('next_billing_date', today);

    if (pastDueData && pastDueData.length > 0) {
      const pastDueList: PastDueSubscription[] = [];
      for (const sub of pastDueData) {
        const cId = sub.client_id || sub.user_id;
        if (!cId) continue;
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', cId)
          .single();
        const due = new Date(sub.next_billing_date + 'T00:00:00');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        pastDueList.push({
          clientName: prof?.full_name || 'Unknown',
          clientId: cId,
          planName: sub.plan_name || 'Subscription',
          amount: sub.price ? Number(sub.price).toFixed(2) : '0.00',
          daysOverdue,
        });
      }
      setPastDueSubs(pastDueList);
    }

    // Fetch all clients
    const { data: clients } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client')
      .order('full_name');

    if (!clients) {
      setLoading(false);
      return;
    }

    // Build client activity data
    const activities: ClientActivity[] = [];
    const recentActs: RecentActivity[] = [];

    for (const client of clients) {
      // Get today's food logs
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select('log_date, calories')
        .eq('client_id', client.id)
        .eq('log_date', today);

      const todayCalories = foodLogs?.reduce((sum, l) => sum + (l.calories || 0), 0) || 0;

      // Get last food log date
      const { data: lastFood } = await supabase
        .from('food_logs')
        .select('log_date')
        .eq('client_id', client.id)
        .order('log_date', { ascending: false })
        .limit(1);

      // Get today's water
      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('amount_oz')
        .eq('client_id', client.id)
        .eq('log_date', today);

      const todayWater = waterLogs?.reduce((sum, l) => sum + (l.amount_oz || 0), 0) || 0;

      // Get last water log date
      const { data: lastWater } = await supabase
        .from('water_logs')
        .select('log_date')
        .eq('client_id', client.id)
        .order('log_date', { ascending: false })
        .limit(1);

      // Get today's sleep
      const { data: sleepLog } = await supabase
        .from('sleep_logs')
        .select('hours_slept, log_date')
        .eq('client_id', client.id)
        .eq('log_date', today)
        .single();

      // Get last sleep log
      const { data: lastSleep } = await supabase
        .from('sleep_logs')
        .select('log_date')
        .eq('client_id', client.id)
        .order('log_date', { ascending: false })
        .limit(1);

      // Get workouts this week
      const { data: workouts } = await supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('client_id', client.id)
        .gte('workout_date', weekAgoStr);

      const uniqueWorkoutDays = new Set(workouts?.map(w => w.workout_date) || []);

      // Get last workout
      const { data: lastWorkout } = await supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('client_id', client.id)
        .order('workout_date', { ascending: false })
        .limit(1);

      // Get today's habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('client_id', client.id)
        .eq('is_active', true);

      const { data: habitLogs } = await supabase
        .from('habit_logs')
        .select('completed')
        .eq('client_id', client.id)
        .eq('log_date', today)
        .eq('completed', true);

      // Get last check-in
      const { data: lastCheckIn } = await supabase
        .from('check_ins')
        .select('submitted_at')
        .eq('client_id', client.id)
        .order('submitted_at', { ascending: false })
        .limit(1);

      // Determine if client is active (any activity in last 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const lastActivityDates = [
        lastFood?.[0]?.log_date,
        lastWater?.[0]?.log_date,
        lastSleep?.[0]?.log_date,
        lastWorkout?.[0]?.workout_date,
        lastCheckIn?.[0]?.submitted_at?.split('T')[0],
      ].filter(Boolean);

      const isActive = lastActivityDates.some(date =>
        new Date(date!) >= threeDaysAgo
      );

      activities.push({
        id: client.id,
        full_name: client.full_name || 'Unknown',
        email: client.email,
        lastFoodLog: lastFood?.[0]?.log_date || null,
        lastWorkout: lastWorkout?.[0]?.workout_date || null,
        lastWaterLog: lastWater?.[0]?.log_date || null,
        lastSleepLog: lastSleep?.[0]?.log_date || null,
        lastCheckIn: lastCheckIn?.[0]?.submitted_at || null,
        todayCalories,
        todayWater,
        todaySleepHours: sleepLog?.hours_slept || null,
        todayHabitsCompleted: habitLogs?.length || 0,
        todayHabitsTotal: habits?.length || 0,
        workoutsThisWeek: uniqueWorkoutDays.size,
        isActive,
      });

      // Add to recent activities if today
      if (foodLogs && foodLogs.length > 0) {
        recentActs.push({
          type: 'food',
          clientName: client.full_name || 'Unknown',
          clientId: client.id,
          description: 'Logged food',
          timestamp: today,
          value: `${todayCalories} cal`,
        });
      }
      if (todayWater > 0) {
        recentActs.push({
          type: 'water',
          clientName: client.full_name || 'Unknown',
          clientId: client.id,
          description: 'Logged water',
          timestamp: today,
          value: `${todayWater} oz`,
        });
      }
      if (sleepLog) {
        recentActs.push({
          type: 'sleep',
          clientName: client.full_name || 'Unknown',
          clientId: client.id,
          description: 'Logged sleep',
          timestamp: today,
          value: `${sleepLog.hours_slept}h`,
        });
      }
    }

    // Sort activities - inactive clients last
    activities.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.full_name.localeCompare(b.full_name);
    });

    setClientActivities(activities);
    setRecentActivities(recentActs.slice(0, 20));
    setLoading(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'food': return Utensils;
      case 'water': return Droplets;
      case 'sleep': return Moon;
      case 'workout': return Dumbbell;
      case 'checkin': return ClipboardCheck;
      case 'habit': return CheckSquare;
      default: return Activity;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'food': return 'bg-green-100 text-green-600';
      case 'water': return 'bg-blue-100 text-blue-600';
      case 'sleep': return 'bg-indigo-100 text-indigo-600';
      case 'workout': return 'bg-purple-100 text-purple-600';
      case 'checkin': return 'bg-teal-100 text-teal-600';
      case 'habit': return 'bg-orange-100 text-orange-600';
      default: return 'bg-grey-100 text-grey-600';
    }
  };

  const statCards = [
    { name: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-600', href: '/admin/clients' },
    { name: 'Active Subscriptions', value: stats.activeSubscriptions, icon: DollarSign, color: 'bg-green-600', href: '/admin/clients' },
    { name: 'Pending Check-ins', value: stats.pendingCheckIns, icon: ClipboardCheck, color: 'bg-orange-600', href: '/admin/check-ins' },
    { name: 'Unread Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'bg-purple-600', href: '/admin/messages' },
  ];

  // Calculate summary stats
  const activeClients = clientActivities.filter(c => c.isActive).length;
  const clientsLoggedFoodToday = clientActivities.filter(c => c.todayCalories > 0).length;
  const clientsLoggedWaterToday = clientActivities.filter(c => c.todayWater > 0).length;
  const clientsLoggedSleepToday = clientActivities.filter(c => c.todaySleepHours !== null).length;
  const inactiveClients = clientActivities.filter(c => !c.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
        <p className="text-grey-600 mt-1">Complete overview of all client activity</p>
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
          </Link>
        ))}
      </div>

      {/* Past Due Payments Alert */}
      {pastDueSubs.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                {pastDueSubs.length} Past Due Payment{pastDueSubs.length !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 space-y-1">
                {pastDueSubs.map((sub) => (
                  <Link
                    key={sub.clientId}
                    href={`/admin/clients/${sub.clientId}`}
                    className="flex items-center justify-between text-sm p-2 hover:bg-red-100 transition-colors"
                  >
                    <span className="text-red-800">{sub.clientName} — {sub.planName}</span>
                    <span className="text-red-600 font-medium">
                      ${sub.amount} • {sub.daysOverdue} day{sub.daysOverdue !== 1 ? 's' : ''} overdue
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Activity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 border-l-4 border-green-500">
          <p className="text-sm text-grey-500">Logged Food Today</p>
          <p className="text-2xl font-bold text-black">{clientsLoggedFoodToday} / {clientActivities.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-500">
          <p className="text-sm text-grey-500">Logged Water Today</p>
          <p className="text-2xl font-bold text-black">{clientsLoggedWaterToday} / {clientActivities.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-indigo-500">
          <p className="text-sm text-grey-500">Logged Sleep Today</p>
          <p className="text-2xl font-bold text-black">{clientsLoggedSleepToday} / {clientActivities.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-500">
          <p className="text-sm text-grey-500">Active (Last 3 Days)</p>
          <p className="text-2xl font-bold text-black">{activeClients} / {clientActivities.length}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-grey-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'overview' ? 'text-chocolate' : 'text-grey-500 hover:text-grey-700'
          }`}
        >
          Client Overview
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chocolate" />}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'activity' ? 'text-chocolate' : 'text-grey-500 hover:text-grey-700'
          }`}
        >
          Today's Activity
          {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chocolate" />}
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Inactive Clients Alert */}
          {inactiveClients.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">
                  {inactiveClients.length} client{inactiveClients.length > 1 ? 's' : ''} inactive for 3+ days
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {inactiveClients.slice(0, 3).map(c => c.full_name).join(', ')}
                  {inactiveClients.length > 3 && ` and ${inactiveClients.length - 3} more`}
                </p>
              </div>
            </div>
          )}

          {/* All Clients Activity Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-black flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  All Clients Activity
                </h2>
                <Link href="/admin/clients" className="text-sm text-blue-600 hover:underline">
                  View All Clients
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-grey-200">
                      <th className="text-left py-3 px-2 font-medium text-grey-600">Client</th>
                      <th className="text-center py-3 px-2 font-medium text-grey-600">
                        <Utensils className="h-4 w-4 inline" />
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-grey-600">
                        <Droplets className="h-4 w-4 inline" />
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-grey-600">
                        <Moon className="h-4 w-4 inline" />
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-grey-600">
                        <Dumbbell className="h-4 w-4 inline" />
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-grey-600">
                        <CheckSquare className="h-4 w-4 inline" />
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-grey-600">Last Check-in</th>
                      <th className="text-right py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientActivities.map((client) => (
                      <tr
                        key={client.id}
                        className={`border-b border-grey-100 hover:bg-grey-50 ${
                          !client.isActive ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold ${
                              client.isActive ? 'bg-blue-600' : 'bg-grey-400'
                            }`}>
                              {client.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-black">{client.full_name}</p>
                              {!client.isActive && (
                                <p className="text-xs text-orange-600">Inactive</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          {client.todayCalories > 0 ? (
                            <span className="text-green-600 font-medium">{client.todayCalories}</span>
                          ) : (
                            <span className="text-grey-400">{formatDate(client.lastFoodLog)}</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          {client.todayWater > 0 ? (
                            <span className="text-blue-600 font-medium">{client.todayWater}oz</span>
                          ) : (
                            <span className="text-grey-400">{formatDate(client.lastWaterLog)}</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          {client.todaySleepHours !== null ? (
                            <span className="text-indigo-600 font-medium">{client.todaySleepHours}h</span>
                          ) : (
                            <span className="text-grey-400">{formatDate(client.lastSleepLog)}</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className={`font-medium ${client.workoutsThisWeek > 0 ? 'text-purple-600' : 'text-grey-400'}`}>
                            {client.workoutsThisWeek}/wk
                          </span>
                        </td>
                        <td className="text-center py-3 px-2">
                          {client.todayHabitsTotal > 0 ? (
                            <span className={`font-medium ${
                              client.todayHabitsCompleted === client.todayHabitsTotal
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}>
                              {client.todayHabitsCompleted}/{client.todayHabitsTotal}
                            </span>
                          ) : (
                            <span className="text-grey-400">-</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className="text-grey-500 text-xs">
                            {formatDate(client.lastCheckIn?.split('T')[0] || null)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-2">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {clientActivities.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                  <p className="text-grey-500">No clients yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Today's Activity Feed */
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Today's Activity Feed
            </h2>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, i) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-grey-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-black">{activity.clientName}</p>
                        <p className="text-sm text-grey-500">{activity.description}</p>
                      </div>
                      {activity.value && (
                        <span className="font-semibold text-black">{activity.value}</span>
                      )}
                      <Link
                        href={`/admin/clients/${activity.clientId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500">No activity logged today yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/check-ins"
          className="flex items-center justify-between p-4 bg-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 flex items-center justify-center rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <span className="font-medium text-black">Review Check-ins</span>
              <p className="text-sm text-grey-500">{stats.pendingCheckIns} pending</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-grey-400" />
        </Link>
        <Link
          href="/admin/messages"
          className="flex items-center justify-between p-4 bg-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium text-black">Messages</span>
              <p className="text-sm text-grey-500">{stats.unreadMessages} unread</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-grey-400" />
        </Link>
        <Link
          href="/admin/programs"
          className="flex items-center justify-between p-4 bg-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-black">Programs</span>
              <p className="text-sm text-grey-500">Manage workouts</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-grey-400" />
        </Link>
      </div>
    </div>
  );
}
