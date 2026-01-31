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
  Droplets,
  Plus,
  Minus,
  Moon,
  Star,
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
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(64); // Default 64oz
  const [userId, setUserId] = useState<string | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepInput, setSleepInput] = useState({ hours: '', quality: 3 });

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
      setUserId(user.id);

      // Fetch today's water intake
      const today = new Date().toISOString().split('T')[0];
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('amount_oz')
        .eq('client_id', user.id)
        .eq('log_date', today);

      if (waterData) {
        const totalWater = waterData.reduce((sum, log) => sum + (log.amount_oz || 0), 0);
        setWaterIntake(totalWater);
      }

      // Get weight for water goal calculation (half bodyweight in oz)
      const { data: measurementData } = await supabase
        .from('measurements')
        .select('weight')
        .eq('client_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();

      if (measurementData?.weight) {
        setWaterGoal(Math.round(measurementData.weight / 2));
      }

      // Fetch today's sleep log
      const { data: sleepData } = await supabase
        .from('sleep_logs')
        .select('hours_slept, sleep_quality')
        .eq('client_id', user.id)
        .eq('log_date', today)
        .single();

      if (sleepData) {
        setSleepHours(sleepData.hours_slept);
        setSleepQuality(sleepData.sleep_quality);
      }

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

  const addWater = async (amount: number) => {
    if (!userId) return;

    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Don't go below 0
    if (waterIntake + amount < 0) return;

    if (amount > 0) {
      // Add water log
      await supabase.from('water_logs').insert({
        client_id: userId,
        log_date: today,
        amount_oz: amount,
      });
    } else {
      // Remove last water log entry for negative amounts
      const { data: logs } = await supabase
        .from('water_logs')
        .select('id, amount_oz')
        .eq('client_id', userId)
        .eq('log_date', today)
        .order('logged_at', { ascending: false })
        .limit(1);

      if (logs && logs.length > 0) {
        await supabase.from('water_logs').delete().eq('id', logs[0].id);
      }
    }

    setWaterIntake(prev => Math.max(0, prev + amount));
  };

  const logSleep = async () => {
    if (!userId || !sleepInput.hours) return;

    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    const hours = parseFloat(sleepInput.hours);

    await supabase
      .from('sleep_logs')
      .upsert({
        client_id: userId,
        log_date: today,
        hours_slept: hours,
        sleep_quality: sleepInput.quality,
      }, {
        onConflict: 'client_id,log_date'
      });

    setSleepHours(hours);
    setSleepQuality(sleepInput.quality);
    setShowSleepModal(false);
    setSleepInput({ hours: '', quality: 3 });
  };

  const getSleepQualityLabel = (quality: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
    return labels[quality] || '';
  };

  const getSleepQualityColor = (quality: number) => {
    const colors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-emerald-600'];
    return colors[quality] || 'text-grey-600';
  };

  const waterPercentage = Math.min(Math.round((waterIntake / waterGoal) * 100), 100);

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
      <div className="bg-gradient-to-r from-cinnamon to-chocolate text-white p-6 rounded-lg relative overflow-hidden">
        {/* EP Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='40' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='%23ffffff'%3EEP%3C/text%3E%3Ctext x='60' y='80' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='%23ffffff'%3EEP%3C/text%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
          <p className="text-biscotti mt-1">Here&apos;s your progress overview</p>
        </div>
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

      {/* Water Tracker */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-black">Water Intake</h2>
              <p className="text-sm text-grey-500">{waterIntake} / {waterGoal} oz</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater(-8)}
              disabled={waterIntake === 0}
              className="w-10 h-10 rounded-full bg-grey-100 flex items-center justify-center text-grey-600 hover:bg-grey-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              onClick={() => addWater(8)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="h-4 bg-grey-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${waterPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-grey-500">
          <span>{waterPercentage}% of daily goal</span>
          <span>{Math.max(0, waterGoal - waterIntake)} oz remaining</span>
        </div>
        <div className="flex gap-2 mt-4">
          {[8, 16, 32].map((oz) => (
            <button
              key={oz}
              onClick={() => addWater(oz)}
              className="flex-1 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              +{oz}oz
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Tracker */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Moon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-black">Sleep Tracker</h2>
              <p className="text-sm text-grey-500">
                {sleepHours !== null
                  ? `${sleepHours}h last night`
                  : "Log last night's sleep"}
              </p>
            </div>
          </div>
          {sleepHours === null ? (
            <button
              onClick={() => setShowSleepModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              Log Sleep
            </button>
          ) : (
            <button
              onClick={() => setShowSleepModal(true)}
              className="px-4 py-2 bg-grey-100 text-grey-600 rounded-lg hover:bg-grey-200 transition-colors font-medium text-sm"
            >
              Update
            </button>
          )}
        </div>

        {sleepHours !== null && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-xs text-grey-500 uppercase mb-1">Hours Slept</p>
              <p className="text-2xl font-bold text-indigo-600">{sleepHours}h</p>
              <p className="text-xs text-grey-500 mt-1">
                {sleepHours >= 7 ? '✓ Good amount!' : 'Try for 7-9 hours'}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-xs text-grey-500 uppercase mb-1">Quality</p>
              <p className={`text-2xl font-bold ${getSleepQualityColor(sleepQuality || 0)}`}>
                {getSleepQualityLabel(sleepQuality || 0)}
              </p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (sleepQuality || 0)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-grey-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {sleepHours === null && (
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <p className="text-grey-600 text-sm">
              Track your sleep to optimize recovery and performance.
              Aim for 7-9 hours each night.
            </p>
          </div>
        )}
      </div>

      {/* Sleep Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Moon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-black text-lg">Log Sleep</h3>
                <p className="text-sm text-grey-500">How did you sleep last night?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Hours Slept
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepInput.hours}
                  onChange={(e) => setSleepInput({ ...sleepInput, hours: e.target.value })}
                  placeholder="e.g., 7.5"
                  className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Sleep Quality
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSleepInput({ ...sleepInput, quality: level })}
                      className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                        sleepInput.quality === level
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-grey-200 hover:border-grey-300'
                      }`}
                    >
                      <Star
                        className={`h-5 w-5 mx-auto ${
                          sleepInput.quality >= level
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-grey-300'
                        }`}
                      />
                      <p className="text-xs text-grey-500 mt-1">
                        {getSleepQualityLabel(level)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSleepModal(false)}
                className="flex-1 py-3 border border-grey-300 rounded-lg font-medium text-grey-700 hover:bg-grey-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logSleep}
                disabled={!sleepInput.hours}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-grey-300 disabled:cursor-not-allowed"
              >
                Log Sleep
              </button>
            </div>
          </div>
        </div>
      )}

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
