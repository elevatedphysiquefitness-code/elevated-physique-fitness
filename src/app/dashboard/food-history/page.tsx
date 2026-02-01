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
  Target,
  Droplets,
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

interface ClientData {
  weight: number | null;
  bodyFatPercentage: number | null;
  goal: string | null;
  activityLevel: string | null;
}

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
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

const goalLabels: Record<string, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  recomposition: 'Body Recomposition',
  maintenance: 'Maintenance',
  strength: 'Strength',
  general_fitness: 'General Fitness',
};

// Macro calculation function
function calculateMacros(
  weight: number,
  goal: 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | 'strength' | 'general_fitness',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  bodyFatPercentage?: number
): Macros {
  const weightKg = weight * 0.453592;
  let bmr: number;

  if (bodyFatPercentage && bodyFatPercentage > 0 && bodyFatPercentage < 100) {
    const leanBodyMassKg = weightKg * (1 - bodyFatPercentage / 100);
    bmr = 370 + (21.6 * leanBodyMassKg);
  } else {
    bmr = 10 * weightKg + 6.25 * 170 - 5 * 30 + 5;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  let calories: number;
  let proteinMultiplier: number;
  let fatMultiplier: number;

  switch (goal) {
    case 'fat_loss':
      calories = tdee - 500;
      proteinMultiplier = 1.0;
      fatMultiplier = 0.35;
      break;
    case 'muscle_gain':
      calories = tdee + 300;
      proteinMultiplier = 1.0;
      fatMultiplier = 0.25;
      break;
    case 'recomposition':
      calories = tdee;
      proteinMultiplier = 1.0;
      fatMultiplier = 0.3;
      break;
    case 'strength':
      calories = tdee + 200;
      proteinMultiplier = 0.9;
      fatMultiplier = 0.3;
      break;
    case 'maintenance':
    case 'general_fitness':
    default:
      calories = tdee;
      proteinMultiplier = 0.8;
      fatMultiplier = 0.3;
      break;
  }

  const protein = Math.round(weight * proteinMultiplier);
  const fats = Math.round((calories * fatMultiplier) / 9);
  const proteinCals = protein * 4;
  const fatCals = fats * 9;
  const carbs = Math.round((calories - proteinCals - fatCals) / 4);

  return {
    calories: Math.round(calories),
    protein,
    carbs: Math.max(carbs, 100),
    fats,
  };
}

export default function FoodHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLogs, setHistoryLogs] = useState<FoodLog[]>([]);
  const [historyRange, setHistoryRange] = useState<'week' | 'month' | 'all'>('week');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Macro tracker state
  const [clientData, setClientData] = useState<ClientData>({
    weight: null,
    bodyFatPercentage: null,
    goal: null,
    activityLevel: null,
  });
  const [macros, setMacros] = useState<Macros | null>(null);
  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchUserAndData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Fetch client data for macro calculation
        const { data: measurementData } = await supabase
          .from('measurements')
          .select('weight, body_fat_percentage')
          .eq('client_id', user.id)
          .order('measurement_date', { ascending: false })
          .limit(1)
          .single();

        const { data: detailsData } = await supabase
          .from('client_details')
          .select('goals, activity_level')
          .eq('user_id', user.id)
          .single();

        const weight = measurementData?.weight || null;
        const bodyFatPercentage = measurementData?.body_fat_percentage || null;
        const goal = detailsData?.goals || null;
        const activityLevel = detailsData?.activity_level || null;

        setClientData({ weight, bodyFatPercentage, goal, activityLevel });

        if (weight && goal && activityLevel) {
          const calculatedMacros = calculateMacros(
            weight,
            goal as 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | 'strength' | 'general_fitness',
            activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
            bodyFatPercentage || undefined
          );
          setMacros(calculatedMacros);
        }

        // Fetch today's food logs
        const { data: todayData } = await supabase
          .from('food_logs')
          .select('*')
          .eq('client_id', user.id)
          .eq('log_date', today)
          .order('logged_at', { ascending: true });

        if (todayData) {
          setTodayLogs(todayData);
        }
      }
      setLoading(false);
    };
    fetchUserAndData();
  }, [today]);

  useEffect(() => {
    if (userId) {
      fetchHistoryLogs(userId, historyRange);
    }
  }, [userId, historyRange]);

  // Calculate consumed macros from today's logs
  const consumedMacros = todayLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate percentages
  const calculatePercentage = (consumed: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((consumed / target) * 100), 100);
  };

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

      {/* Today's Macro Tracker */}
      {macros && (
        <Card className="border-2 border-chocolate">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chocolate flex items-center justify-center rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">Today&apos;s Progress</h2>
                  <p className="text-grey-500 text-sm">
                    {clientData.weight} lbs | {goalLabels[clientData.goal || 'maintenance']}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-grey-500">Water Goal</p>
                <p className="font-semibold text-blue-600 flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  {clientData.weight ? Math.round((clientData.weight / 2)) : '--'} oz
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Calories */}
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">
                    {calculatePercentage(consumedMacros.calories, macros.calories)}%
                  </span>
                </div>
                <p className="text-xl font-bold text-orange-600">{consumedMacros.calories}</p>
                <p className="text-xs text-orange-700">/ {macros.calories} cal</p>
                <div className="mt-2 h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.calories, macros.calories)}%` }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Beef className="h-5 w-5 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    {calculatePercentage(consumedMacros.protein, macros.protein)}%
                  </span>
                </div>
                <p className="text-xl font-bold text-red-600">{Math.round(consumedMacros.protein)}g</p>
                <p className="text-xs text-red-700">/ {macros.protein}g protein</p>
                <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.protein, macros.protein)}%` }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Wheat className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">
                    {calculatePercentage(consumedMacros.carbs, macros.carbs)}%
                  </span>
                </div>
                <p className="text-xl font-bold text-yellow-600">{Math.round(consumedMacros.carbs)}g</p>
                <p className="text-xs text-yellow-700">/ {macros.carbs}g carbs</p>
                <div className="mt-2 h-2 bg-yellow-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.carbs, macros.carbs)}%` }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Apple className="h-5 w-5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {calculatePercentage(consumedMacros.fat, macros.fats)}%
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600">{Math.round(consumedMacros.fat)}g</p>
                <p className="text-xs text-green-700">/ {macros.fats}g fat</p>
                <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.fat, macros.fats)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Remaining summary */}
            <div className="mt-4 pt-4 border-t border-grey-200 flex flex-wrap gap-4 text-sm">
              <span className="text-grey-600">Remaining:</span>
              <span className="text-orange-600 font-medium">{Math.max(0, macros.calories - consumedMacros.calories)} cal</span>
              <span className="text-red-600 font-medium">{Math.max(0, macros.protein - consumedMacros.protein)}g P</span>
              <span className="text-yellow-600 font-medium">{Math.max(0, macros.carbs - consumedMacros.carbs)}g C</span>
              <span className="text-green-600 font-medium">{Math.max(0, macros.fats - consumedMacros.fat)}g F</span>
            </div>
          </CardContent>
        </Card>
      )}

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

              // Calculate remaining for this day
              const remainingCal = macros ? Math.max(0, macros.calories - dayTotals.calories) : 0;
              const remainingP = macros ? Math.max(0, macros.protein - dayTotals.protein) : 0;
              const remainingC = macros ? Math.max(0, macros.carbs - dayTotals.carbs) : 0;
              const remainingF = macros ? Math.max(0, macros.fats - dayTotals.fat) : 0;

              // Calculate percentages
              const calPct = macros ? Math.min(100, Math.round((dayTotals.calories / macros.calories) * 100)) : 0;
              const pPct = macros ? Math.min(100, Math.round((dayTotals.protein / macros.protein) * 100)) : 0;
              const cPct = macros ? Math.min(100, Math.round((dayTotals.carbs / macros.carbs) * 100)) : 0;
              const fPct = macros ? Math.min(100, Math.round((dayTotals.fat / macros.fats) * 100)) : 0;

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
                    <div className="border-t border-grey-200">
                      {/* Daily Progress vs Target */}
                      {macros && (
                        <div className="p-4 bg-grey-50 border-b border-grey-200">
                          <p className="text-xs font-semibold text-grey-600 mb-3">DAILY PROGRESS vs TARGET</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-orange-600 font-medium">Calories</span>
                                <span className="text-grey-500">{calPct}%</span>
                              </div>
                              <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 transition-all" style={{ width: `${calPct}%` }} />
                              </div>
                              <p className="text-xs text-grey-600 mt-1">{dayTotals.calories} / {macros.calories}</p>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-red-600 font-medium">Protein</span>
                                <span className="text-grey-500">{pPct}%</span>
                              </div>
                              <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all" style={{ width: `${pPct}%` }} />
                              </div>
                              <p className="text-xs text-grey-600 mt-1">{Math.round(dayTotals.protein)}g / {macros.protein}g</p>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-yellow-600 font-medium">Carbs</span>
                                <span className="text-grey-500">{cPct}%</span>
                              </div>
                              <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 transition-all" style={{ width: `${cPct}%` }} />
                              </div>
                              <p className="text-xs text-grey-600 mt-1">{Math.round(dayTotals.carbs)}g / {macros.carbs}g</p>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-green-600 font-medium">Fat</span>
                                <span className="text-grey-500">{fPct}%</span>
                              </div>
                              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all" style={{ width: `${fPct}%` }} />
                              </div>
                              <p className="text-xs text-grey-600 mt-1">{Math.round(dayTotals.fat)}g / {macros.fats}g</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-grey-200 flex flex-wrap gap-3 text-xs">
                            <span className="text-grey-500 font-medium">Remaining:</span>
                            <span className="text-orange-600">{remainingCal} cal</span>
                            <span className="text-red-600">{Math.round(remainingP)}g P</span>
                            <span className="text-yellow-600">{Math.round(remainingC)}g C</span>
                            <span className="text-green-600">{Math.round(remainingF)}g F</span>
                          </div>
                        </div>
                      )}

                      {/* Food items */}
                      <div className="divide-y divide-grey-100">
                        {logs.map((log) => (
                          <div key={log.id} className="px-4 py-3 flex items-center justify-between">
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
