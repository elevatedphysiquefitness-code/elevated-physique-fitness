'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UtensilsCrossed,
  Flame,
  Beef,
  Wheat,
  Apple,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface FoodLog {
  id: string;
  client_id: string;
  log_date: string;
  food_name: string;
  servings: number;
  serving_size: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other' | null;
  notes: string | null;
  logged_at: string;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  pre_workout: 'Pre-Workout',
  post_workout: 'Post-Workout',
  other: 'Other',
};

export default function FoodHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLogs, setHistoryLogs] = useState<FoodLog[]>([]);
  const [historyRange, setHistoryRange] = useState<'week' | 'month' | 'all'>('week');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchHistoryLogs(userId, historyRange);
    }
  }, [userId, historyRange]);

  const fetchHistoryLogs = async (clientId: string, range: 'week' | 'month' | 'all') => {
    setLoading(true);
    const supabase = createClient();

    let startDate = '';
    const now = new Date();

    if (range === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
    }

    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('log_date', { ascending: false })
      .order('logged_at', { ascending: true });

    if (startDate) {
      query = query.gte('log_date', startDate);
    }

    const { data, error } = await query;

    if (data) {
      setHistoryLogs(data);
    }
    if (error) {
      console.error('Error fetching history logs:', error);
    }
    setLoading(false);
  };

  // Group history logs by date
  const groupedHistoryLogs = historyLogs.reduce((acc, log) => {
    if (!acc[log.log_date]) acc[log.log_date] = [];
    acc[log.log_date].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  // Calculate daily totals
  const calculateDayTotals = (logs: FoodLog[]) => {
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  // Calculate overall stats
  const totalDays = Object.keys(groupedHistoryLogs).length;
  const totalCalories = historyLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const totalProtein = historyLogs.reduce((sum, l) => sum + (l.protein || 0), 0);
  const totalCarbs = historyLogs.reduce((sum, l) => sum + (l.carbs || 0), 0);
  const totalFat = historyLogs.reduce((sum, l) => sum + (l.fat || 0), 0);

  const avgCalories = totalDays > 0 ? Math.round(totalCalories / totalDays) : 0;
  const avgProtein = totalDays > 0 ? Math.round(totalProtein / totalDays) : 0;
  const avgCarbs = totalDays > 0 ? Math.round(totalCarbs / totalDays) : 0;
  const avgFat = totalDays > 0 ? Math.round(totalFat / totalDays) : 0;

  if (loading && !userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-chocolate" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/nutrition" className="p-2 hover:bg-grey-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-grey-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black">Food History</h1>
          <p className="text-grey-600">Track your nutrition over time</p>
        </div>
        <Link href="/dashboard/nutrition">
          <Button variant="primary">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Log Food
          </Button>
        </Link>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        {(['week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setHistoryRange(range)}
            className={`px-4 py-2 font-medium transition-colors ${
              historyRange === range
                ? 'bg-chocolate text-white'
                : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
            }`}
          >
            {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {totalDays > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{avgCalories}</p>
              <p className="text-xs text-grey-500">Avg Calories/Day</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                <Beef className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{avgProtein}g</p>
              <p className="text-xs text-grey-500">Avg Protein/Day</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <Wheat className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{avgCarbs}g</p>
              <p className="text-xs text-grey-500">Avg Carbs/Day</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Apple className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{avgFat}g</p>
              <p className="text-xs text-grey-500">Avg Fat/Day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tracking Summary */}
      {totalDays > 0 && (
        <Card className="bg-chocolate text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-biscotti text-sm">
                  {historyRange === 'week' ? 'Last 7 Days' : historyRange === 'month' ? 'Last 30 Days' : 'All Time'}
                </p>
                <p className="text-2xl font-bold">{totalDays} days tracked</p>
              </div>
              <div className="text-right">
                <p className="text-biscotti text-sm">Total entries</p>
                <p className="text-2xl font-bold">{historyLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Logs */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-chocolate" />
        </div>
      ) : Object.keys(groupedHistoryLogs).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(groupedHistoryLogs)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, logs]) => {
              const dayTotals = calculateDayTotals(logs);
              const dateObj = new Date(date + 'T00:00:00');
              const isExpanded = expandedDate === date;

              const today = new Date().toISOString().split('T')[0];
              const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

              let dateLabel = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });

              if (date === today) dateLabel = 'Today';
              else if (date === yesterday) dateLabel = 'Yesterday';

              return (
                <Card key={date} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedDate(isExpanded ? null : date)}
                    className="w-full p-4 flex items-center justify-between hover:bg-grey-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-biscotti-light rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-chocolate" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-black">{dateLabel}</p>
                        <p className="text-xs text-grey-500">{logs.length} items logged</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-chocolate">{dayTotals.calories} cal</p>
                        <p className="text-xs text-grey-500">
                          P: {Math.round(dayTotals.protein)}g · C: {Math.round(dayTotals.carbs)}g · F: {Math.round(dayTotals.fat)}g
                        </p>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-grey-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-grey-200 divide-y divide-grey-100">
                      {logs.map((log) => (
                        <div key={log.id} className="px-4 py-3 flex items-center justify-between bg-grey-50">
                          <div>
                            <p className="font-medium text-black">{log.food_name}</p>
                            <p className="text-xs text-grey-500">
                              {mealTypeLabels[log.meal_type || 'other']}
                              {log.serving_size && ` · ${log.servings} × ${log.serving_size}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-black">{log.calories} cal</p>
                            <p className="text-xs text-grey-400">
                              P: {log.protein}g · C: {log.carbs}g · F: {log.fat}g
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-grey-300 mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">No Food History Yet</h2>
            <p className="text-grey-600 mb-6">
              Start logging your meals to track your nutrition over time
            </p>
            <Link href="/dashboard/nutrition">
              <Button variant="primary">
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
