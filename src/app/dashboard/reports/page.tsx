'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  CheckSquare,
  Droplets,
  Moon,
  Scale,
  Apple,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  Flame,
} from 'lucide-react';

interface WeeklyStats {
  workoutsCompleted: number;
  workoutsPlanned: number;
  habitsCompleted: number;
  totalHabits: number;
  waterAverage: number;
  waterGoal: number;
  sleepAverage: number;
  sleepQualityAverage: number;
  weightStart: number | null;
  weightEnd: number | null;
  caloriesAverage: number;
  proteinAverage: number;
  carbsAverage: number;
  fatAverage: number;
  prsSet: number;
}

const defaultStats: WeeklyStats = {
  workoutsCompleted: 0,
  workoutsPlanned: 0,
  habitsCompleted: 0,
  totalHabits: 0,
  waterAverage: 0,
  waterGoal: 64,
  sleepAverage: 0,
  sleepQualityAverage: 0,
  weightStart: null,
  weightEnd: null,
  caloriesAverage: 0,
  proteinAverage: 0,
  carbsAverage: 0,
  fatAverage: 0,
  prsSet: 0,
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [stats, setStats] = useState<WeeklyStats>(defaultStats);

  // Calculate week date range
  const getWeekDates = (offset: number) => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset + (offset * 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      monday,
      sunday,
      mondayStr: monday.toISOString().split('T')[0],
      sundayStr: sunday.toISOString().split('T')[0],
    };
  };

  const { monday, sunday, mondayStr, sundayStr } = getWeekDates(weekOffset);

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}`;
  };

  useEffect(() => {
    fetchWeeklyStats();
  }, [weekOffset]);

  const fetchWeeklyStats = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const newStats: WeeklyStats = { ...defaultStats };

    // Fetch workouts completed
    const { data: workouts, count: workoutCount } = await supabase
      .from('assigned_workouts')
      .select('*', { count: 'exact' })
      .eq('client_id', user.id)
      .gte('workout_date', mondayStr)
      .lte('workout_date', sundayStr);

    if (workouts) {
      newStats.workoutsPlanned = workouts.filter(w => w.status !== 'rest').length;
      newStats.workoutsCompleted = workouts.filter(w => w.status === 'completed').length;
    }

    // Fetch habit completions
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('client_id', user.id)
      .eq('is_active', true);

    if (habits) {
      const habitIds = habits.map(h => h.id);
      const { data: habitLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habitIds)
        .gte('log_date', mondayStr)
        .lte('log_date', sundayStr)
        .eq('completed', true);

      newStats.totalHabits = habits.length * 7; // 7 days
      newStats.habitsCompleted = habitLogs?.length || 0;
    }

    // Fetch water logs
    const { data: waterLogs } = await supabase
      .from('water_logs')
      .select('amount_oz, log_date')
      .eq('client_id', user.id)
      .gte('log_date', mondayStr)
      .lte('log_date', sundayStr);

    if (waterLogs && waterLogs.length > 0) {
      // Group by date and sum
      const dailyTotals: { [date: string]: number } = {};
      waterLogs.forEach(log => {
        dailyTotals[log.log_date] = (dailyTotals[log.log_date] || 0) + log.amount_oz;
      });
      const daysWithData = Object.keys(dailyTotals).length;
      const totalWater = Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
      newStats.waterAverage = daysWithData > 0 ? Math.round(totalWater / daysWithData) : 0;
    }

    // Get water goal from measurements
    const { data: measurementData } = await supabase
      .from('measurements')
      .select('weight')
      .eq('client_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    if (measurementData?.weight) {
      newStats.waterGoal = Math.round(measurementData.weight / 2);
    }

    // Fetch sleep logs
    const { data: sleepLogs } = await supabase
      .from('sleep_logs')
      .select('hours_slept, sleep_quality')
      .eq('client_id', user.id)
      .gte('log_date', mondayStr)
      .lte('log_date', sundayStr);

    if (sleepLogs && sleepLogs.length > 0) {
      const totalHours = sleepLogs.reduce((sum, log) => sum + (log.hours_slept || 0), 0);
      const totalQuality = sleepLogs.reduce((sum, log) => sum + (log.sleep_quality || 0), 0);
      newStats.sleepAverage = Math.round((totalHours / sleepLogs.length) * 10) / 10;
      newStats.sleepQualityAverage = Math.round((totalQuality / sleepLogs.length) * 10) / 10;
    }

    // Fetch weight change (start and end of week)
    const { data: weightStart } = await supabase
      .from('measurements')
      .select('weight, measurement_date')
      .eq('client_id', user.id)
      .lte('measurement_date', mondayStr)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    const { data: weightEnd } = await supabase
      .from('measurements')
      .select('weight, measurement_date')
      .eq('client_id', user.id)
      .gte('measurement_date', mondayStr)
      .lte('measurement_date', sundayStr)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    newStats.weightStart = weightStart?.weight || null;
    newStats.weightEnd = weightEnd?.weight || weightStart?.weight || null;

    // Fetch food logs for nutrition averages
    const { data: foodLogs } = await supabase
      .from('food_logs')
      .select('calories, protein, carbs, fat, log_date')
      .eq('client_id', user.id)
      .gte('log_date', mondayStr)
      .lte('log_date', sundayStr);

    if (foodLogs && foodLogs.length > 0) {
      // Group by date and sum
      const dailyNutrition: { [date: string]: { calories: number; protein: number; carbs: number; fat: number } } = {};
      foodLogs.forEach(log => {
        if (!dailyNutrition[log.log_date]) {
          dailyNutrition[log.log_date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyNutrition[log.log_date].calories += log.calories || 0;
        dailyNutrition[log.log_date].protein += log.protein || 0;
        dailyNutrition[log.log_date].carbs += log.carbs || 0;
        dailyNutrition[log.log_date].fat += log.fat || 0;
      });

      const daysWithData = Object.keys(dailyNutrition).length;
      if (daysWithData > 0) {
        newStats.caloriesAverage = Math.round(
          Object.values(dailyNutrition).reduce((sum, d) => sum + d.calories, 0) / daysWithData
        );
        newStats.proteinAverage = Math.round(
          Object.values(dailyNutrition).reduce((sum, d) => sum + d.protein, 0) / daysWithData
        );
        newStats.carbsAverage = Math.round(
          Object.values(dailyNutrition).reduce((sum, d) => sum + d.carbs, 0) / daysWithData
        );
        newStats.fatAverage = Math.round(
          Object.values(dailyNutrition).reduce((sum, d) => sum + d.fat, 0) / daysWithData
        );
      }
    }

    // Fetch PRs set this week
    const { count: prsCount } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('is_pr', true)
      .gte('workout_date', mondayStr)
      .lte('workout_date', sundayStr);

    newStats.prsSet = prsCount || 0;

    setStats(newStats);
    setLoading(false);
  };

  const getWorkoutPercentage = () => {
    if (stats.workoutsPlanned === 0) return 0;
    return Math.round((stats.workoutsCompleted / stats.workoutsPlanned) * 100);
  };

  const getHabitPercentage = () => {
    if (stats.totalHabits === 0) return 0;
    return Math.round((stats.habitsCompleted / stats.totalHabits) * 100);
  };

  const getWaterPercentage = () => {
    if (stats.waterGoal === 0) return 0;
    return Math.min(Math.round((stats.waterAverage / stats.waterGoal) * 100), 100);
  };

  const getWeightChange = () => {
    if (!stats.weightStart || !stats.weightEnd) return null;
    return Math.round((stats.weightEnd - stats.weightStart) * 10) / 10;
  };

  const isCurrentWeek = weekOffset === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Weekly Progress Report</h1>
          <p className="mt-2 text-grey-600">Track your weekly achievements and progress</p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-1 bg-grey-100 rounded-lg p-1">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 hover:bg-grey-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-grey-600" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 min-w-[180px] justify-center">
            <Calendar className="h-4 w-4 text-grey-500" />
            <span className="text-sm font-medium text-black">
              {isCurrentWeek ? 'This Week' : formatDateRange()}
            </span>
          </div>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            disabled={isCurrentWeek}
            className="p-2 hover:bg-grey-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-grey-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Workouts */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-grey-500">Workouts</p>
                <p className="text-xl font-bold text-black">
                  {stats.workoutsCompleted}/{stats.workoutsPlanned}
                </p>
              </div>
            </div>
            <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${getWorkoutPercentage()}%` }}
              />
            </div>
            <p className="text-xs text-grey-500 mt-1">{getWorkoutPercentage()}% complete</p>
          </CardContent>
        </Card>

        {/* Habits */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-grey-500">Habits</p>
                <p className="text-xl font-bold text-black">
                  {stats.habitsCompleted}/{stats.totalHabits}
                </p>
              </div>
            </div>
            <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${getHabitPercentage()}%` }}
              />
            </div>
            <p className="text-xs text-grey-500 mt-1">{getHabitPercentage()}% complete</p>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Moon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-grey-500">Avg Sleep</p>
                <p className="text-xl font-bold text-black">
                  {stats.sleepAverage || '-'}h
                </p>
              </div>
            </div>
            <p className="text-sm text-grey-600">
              Quality: {stats.sleepQualityAverage ? `${stats.sleepQualityAverage}/5` : '-'}
            </p>
          </CardContent>
        </Card>

        {/* Water */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Droplets className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-grey-500">Avg Water</p>
                <p className="text-xl font-bold text-black">
                  {stats.waterAverage}oz
                </p>
              </div>
            </div>
            <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full"
                style={{ width: `${getWaterPercentage()}%` }}
              />
            </div>
            <p className="text-xs text-grey-500 mt-1">{getWaterPercentage()}% of goal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight & Body */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-black">Weight Progress</h2>
            </div>
          </CardHeader>
          <CardContent>
            {stats.weightEnd ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-grey-500 text-sm">Current Weight</p>
                    <p className="text-3xl font-bold text-black">{stats.weightEnd} lbs</p>
                  </div>
                  {getWeightChange() !== null && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      getWeightChange()! < 0 ? 'bg-green-100 text-green-700' :
                      getWeightChange()! > 0 ? 'bg-red-100 text-red-700' :
                      'bg-grey-100 text-grey-700'
                    }`}>
                      {getWeightChange()! < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : getWeightChange()! > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : null}
                      <span className="font-medium">
                        {getWeightChange()! > 0 ? '+' : ''}{getWeightChange()} lbs
                      </span>
                    </div>
                  )}
                </div>
                {stats.weightStart && (
                  <p className="text-sm text-grey-500">
                    From {stats.weightStart} lbs at start of week
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-grey-300 mx-auto mb-4" />
                <p className="text-grey-500">No weight data recorded this week</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nutrition */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-600" />
              <h2 className="font-bold text-black">Nutrition Averages</h2>
            </div>
          </CardHeader>
          <CardContent>
            {stats.caloriesAverage > 0 ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-grey-500 text-sm">Avg Daily Calories</p>
                  <p className="text-3xl font-bold text-black">{stats.caloriesAverage}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-grey-500">Protein</p>
                    <p className="text-xl font-bold text-red-600">{stats.proteinAverage}g</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-grey-500">Carbs</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.carbsAverage}g</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-grey-500">Fat</p>
                    <p className="text-xl font-bold text-green-600">{stats.fatAverage}g</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Apple className="h-12 w-12 text-grey-300 mx-auto mb-4" />
                <p className="text-grey-500">No nutrition data logged this week</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <h2 className="font-bold text-black">Weekly Highlights</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Dumbbell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{stats.workoutsCompleted}</p>
                <p className="text-sm text-grey-500">Workouts Done</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{stats.prsSet}</p>
                <p className="text-sm text-grey-500">PRs Set</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">{getHabitPercentage()}%</p>
                <p className="text-sm text-grey-500">Habit Streak</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-black">
                  {Math.round((getWorkoutPercentage() + getHabitPercentage() + getWaterPercentage()) / 3)}%
                </p>
                <p className="text-sm text-grey-500">Overall Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
