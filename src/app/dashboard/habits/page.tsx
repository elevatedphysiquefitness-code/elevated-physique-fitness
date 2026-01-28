'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Plus, Flame, Calendar, X, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Habit {
  id: string;
  name: string;
  description?: string;
}

interface HabitLog {
  habit_id: string;
  log_date: string;
  completed: boolean;
}

const defaultHabits = [
  { name: 'Drink 1 gallon of water', description: 'Stay hydrated throughout the day' },
  { name: 'Sleep 7+ hours', description: 'Get quality sleep for recovery' },
  { name: 'Hit protein goal', description: 'Consume your daily protein target' },
  { name: '10,000 steps', description: 'Stay active with daily walking' },
  { name: 'Complete workout', description: 'Finish your scheduled workout' },
  { name: 'Meal prep', description: 'Prepare healthy meals in advance' },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [weeklyPercentage, setWeeklyPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch user's habits
    const { data: userHabits } = await supabase
      .from('habits')
      .select('id, name, description')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('created_at');

    if (userHabits && userHabits.length > 0) {
      setHabits(userHabits);
    } else {
      // No habits yet - show empty state
      setHabits([]);
    }

    // Fetch today's logs
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('client_id', user.id)
      .eq('log_date', today);

    if (logs) {
      const logMap: Record<string, boolean> = {};
      logs.forEach((log: { habit_id: string; completed: boolean }) => {
        logMap[log.habit_id] = log.completed;
      });
      setTodayLogs(logMap);
    }

    // Calculate streak from real data
    const calculatedStreak = await calculateStreak(supabase, user.id, userHabits?.length || 0);
    setStreak(calculatedStreak);

    // Calculate weekly percentage from real data
    const weeklyPct = await calculateWeeklyPercentage(supabase, user.id, userHabits?.length || 0);
    setWeeklyPercentage(weeklyPct);

    setLoading(false);
  };

  // Calculate streak: consecutive days where all habits were completed
  const calculateStreak = async (supabase: ReturnType<typeof createClient>, userId: string, totalHabits: number): Promise<number> => {
    if (totalHabits === 0) return 0;

    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];

      const { count } = await supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', userId)
        .eq('log_date', dateStr)
        .eq('completed', true);

      if ((count || 0) >= totalHabits) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate weekly percentage
  const calculateWeeklyPercentage = async (supabase: ReturnType<typeof createClient>, userId: string, totalHabits: number): Promise<number> => {
    if (totalHabits === 0) return 0;

    // Get start of week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMonday);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Days elapsed in the week (including today)
    const daysElapsed = daysFromMonday + 1;
    const totalPossible = totalHabits * daysElapsed;

    if (totalPossible === 0) return 0;

    const { count } = await supabase
      .from('habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', userId)
      .gte('log_date', weekStartStr)
      .lte('log_date', today.toISOString().split('T')[0])
      .eq('completed', true);

    return Math.round(((count || 0) / totalPossible) * 100);
  };

  const toggleHabit = async (habitId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const newValue = !todayLogs[habitId];
    setTodayLogs({ ...todayLogs, [habitId]: newValue });

    // Upsert habit log
    await supabase.from('habit_logs').upsert({
      habit_id: habitId,
      client_id: user.id,
      log_date: today,
      completed: newValue,
    }, {
      onConflict: 'habit_id,log_date'
    });

    // Recalculate stats after toggle
    const calculatedStreak = await calculateStreak(supabase, user.id, habits.length);
    setStreak(calculatedStreak);
    const weeklyPct = await calculateWeeklyPercentage(supabase, user.id, habits.length);
    setWeeklyPercentage(weeklyPct);
  };

  const addCustomHabit = async () => {
    if (!newHabitName.trim()) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('habits')
      .insert({
        client_id: user.id,
        name: newHabitName.trim(),
        description: newHabitDescription.trim() || null,
        is_active: true,
      })
      .select()
      .single();

    if (data && !error) {
      setHabits([...habits, data]);
      setNewHabitName('');
      setNewHabitDescription('');
      setShowAddModal(false);
    }
  };

  const addDefaultHabits = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const habitsToInsert = defaultHabits.map(h => ({
      client_id: user.id,
      name: h.name,
      description: h.description,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from('habits')
      .insert(habitsToInsert)
      .select();

    if (data && !error) {
      setHabits(data);
    }
  };

  const completedCount = Object.values(todayLogs).filter(Boolean).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Habit Tracker</h1>
          <p className="text-grey-600 mt-1">Build consistency, build results</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-grey-500">Today&apos;s Progress</p>
              <p className="text-2xl font-bold text-black">
                {habits.length > 0 ? `${completedCount}/${habits.length}` : '0/0'}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-grey-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-grey-500">Current Streak</p>
              <p className="text-2xl font-bold text-black">{streak} {streak === 1 ? 'day' : 'days'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-grey-500">This Week</p>
              <p className="text-2xl font-bold text-black">{weeklyPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="bg-white p-6">
        <h2 className="text-lg font-bold text-black mb-6">Today&apos;s Habits</h2>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-grey-300 mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No habits yet</h3>
            <p className="text-grey-500 mb-6">Start building your daily routine by adding habits</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={addDefaultHabits} variant="primary">
                Add Default Habits
              </Button>
              <Button onClick={() => setShowAddModal(true)} variant="outline">
                Create Custom Habit
              </Button>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {habits.map((habit) => {
              const isCompleted = todayLogs[habit.id] || false;
              return (
                <li key={habit.id}>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
                      isCompleted ? 'bg-green-50' : 'bg-grey-50 hover:bg-grey-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? 'bg-green-600 border-green-600'
                          : 'border-grey-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isCompleted ? 'text-grey-500 line-through' : 'text-black'}`}>
                        {habit.name}
                      </p>
                      {habit.description && (
                        <p className="text-sm text-grey-500 mt-0.5">{habit.description}</p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black">Add Custom Habit</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-grey-400 hover:text-black"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Read for 20 minutes"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  placeholder="Add a short description..."
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowAddModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={addCustomHabit} variant="primary" className="flex-1">
                Add Habit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
