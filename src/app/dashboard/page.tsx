'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Dumbbell,
  TrendingUp,
  CheckSquare,
  MessageSquare,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  Flame,
  Camera,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface DashboardStats {
  total_sessions_completed: number;
  total_check_ins: number;
  total_progress_photos: number;
  total_habits_completed: number;
  total_notes: number;
  unread_messages: number;
  current_week: number;
  sessions_this_week: number;
  habits_today: number;
  total_habits_today: number;
  habit_streak: number;
}

interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

const defaultStats: DashboardStats = {
  total_sessions_completed: 0,
  total_check_ins: 0,
  total_progress_photos: 0,
  total_habits_completed: 0,
  total_notes: 0,
  unread_messages: 0,
  current_week: 1,
  sessions_this_week: 0,
  habits_today: 0,
  total_habits_today: 0,
  habit_streak: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || user.email?.split('@')[0] || 'there');

      // Fetch stats from API
      try {
        const response = await fetch(`/api/dashboard/stats?clientId=${user.id}`);
        if (response.ok) {
          const statsData = await response.json();
          setStats({ ...defaultStats, ...statsData });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      // Fetch today's habits
      const today = new Date().toISOString().split('T')[0];
      const { data: userHabits } = await supabase
        .from('habits')
        .select(`
          id,
          name,
          habit_logs!inner (
            completed
          )
        `)
        .eq('client_id', user.id)
        .eq('is_active', true)
        .eq('habit_logs.log_date', today);

      // Also fetch habits without logs for today
      const { data: allHabits } = await supabase
        .from('habits')
        .select('id, name')
        .eq('client_id', user.id)
        .eq('is_active', true);

      if (allHabits) {
        const habitsWithStatus = allHabits.map(habit => {
          const loggedHabit = userHabits?.find(h => h.id === habit.id);
          return {
            id: habit.id,
            name: habit.name,
            completed: loggedHabit?.habit_logs?.[0]?.completed || false,
          };
        });
        setHabits(habitsWithStatus);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const toggleHabit = async (habitId: string, currentStatus: boolean) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Upsert habit log
    await supabase
      .from('habit_logs')
      .upsert({
        habit_id: habitId,
        client_id: user.id,
        log_date: today,
        completed: !currentStatus,
      }, {
        onConflict: 'habit_id,log_date'
      });

    // Update local state
    setHabits(habits.map(h =>
      h.id === habitId ? { ...h, completed: !currentStatus } : h
    ));

    // Update stats
    setStats(prev => ({
      ...prev,
      habits_today: !currentStatus
        ? prev.habits_today + 1
        : prev.habits_today - 1,
      total_habits_completed: !currentStatus
        ? prev.total_habits_completed + 1
        : prev.total_habits_completed - 1,
    }));
  };

  const quickActions = [
    {
      title: "Today's Workout",
      description: 'View your scheduled workout',
      icon: Dumbbell,
      href: '/dashboard/workouts',
      color: 'bg-blue-600',
    },
    {
      title: 'Track Progress',
      description: 'Log your measurements',
      icon: TrendingUp,
      href: '/dashboard/progress',
      color: 'bg-green-600',
    },
    {
      title: 'Daily Habits',
      description: `${stats.habits_today} of ${stats.total_habits_today} completed`,
      icon: CheckSquare,
      href: '/dashboard/habits',
      color: 'bg-purple-600',
    },
    {
      title: 'Messages',
      description: stats.unread_messages > 0 ? `${stats.unread_messages} unread` : 'Chat with your coach',
      icon: MessageSquare,
      href: '/dashboard/messages',
      color: 'bg-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-blue-100 mt-1">Here&apos;s your progress overview</p>
      </div>

      {/* Progress Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Sessions Completed</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.total_sessions_completed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Check-ins Submitted</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.total_check_ins}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Progress Photos</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.total_progress_photos}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Habits Completed</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.total_habits_completed}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Current Week</p>
              <p className="text-3xl font-bold text-black mt-1">Week {stats.current_week}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center rounded-full">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">This Week</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.sessions_this_week} sessions</p>
            </div>
            <div className="w-12 h-12 bg-green-600 flex items-center justify-center rounded-full">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Habit Streak</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.habit_streak} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-600 flex items-center justify-center rounded-full">
              <Flame className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-grey-500">Coach Notes</p>
              <p className="text-3xl font-bold text-black mt-1">{stats.total_notes}</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 flex items-center justify-center rounded-full">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-black group-hover:text-blue-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-grey-500 mt-1">{action.description}</p>
            <ArrowRight className="h-5 w-5 text-grey-400 mt-4 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Today&apos;s Habits</h2>
            <Link href="/dashboard/habits" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          {habits.length > 0 ? (
            <ul className="space-y-3">
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    habit.completed ? 'bg-green-50' : 'bg-grey-50 hover:bg-grey-100'
                  }`}
                  onClick={() => toggleHabit(habit.id, habit.completed)}
                >
                  {habit.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-grey-300 rounded-full" />
                  )}
                  <span className={habit.completed ? 'text-grey-500 line-through' : 'text-black'}>
                    {habit.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-grey-500 text-center py-4">No habits set up yet</p>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Upcoming</h2>
            <Link href="/dashboard/calendar" className="text-sm text-blue-600 hover:underline">
              View Calendar
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-black">Weekly Check-in Due</p>
                <p className="text-sm text-grey-600 mt-1">Submit your weekly progress check-in</p>
                <Button href="/dashboard/check-ins" variant="outline" size="sm" className="mt-3">
                  Complete Check-in
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-grey-50 rounded-lg">
              <div className="w-10 h-10 bg-grey-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-black">Next Session</p>
                <p className="text-sm text-grey-600 mt-1">Check your schedule for upcoming sessions</p>
                <Button href="/dashboard/calendar" variant="outline" size="sm" className="mt-3">
                  View Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
