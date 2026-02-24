'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, X, Bell, ClipboardCheck, Camera, CheckCircle, XCircle, Dumbbell, Droplets, Moon, Apple, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProfileAvatar from '@/components/ui/ProfileAvatar';
import { useToast } from '@/components/ui/Toast';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface WeeklyGrade {
  id: string;
  client_id: string;
  week_number: number;
  graded_week_start: string;
  workout_consistency: number;
  workout_intensity: number;
  nutrition_adherence: number;
  water_intake: number;
  sleep: number;
  overall_grade: number;
  strengths: string | null;
  improvements: string | null;
}

interface GradeForm {
  workout_consistency: number;
  workout_intensity: number;
  nutrition_adherence: number;
  water_intake: number;
  sleep: number;
  overall_grade: number;
  strengths: string;
  improvements: string;
}

interface WeeklySummary {
  workoutsCompleted: number;
  workoutsScheduled: number;
  workoutRate: number;
  habitsCompleted: number;
  habitsTotal: number;
  habitRate: number;
  waterDailyAvgOz: number;
  waterGoalOz: number | null;
  waterDaysLogged: number;
  sleepAvgHours: number;
  sleepAvgQuality: number;
  sleepDaysLogged: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  targetCalories: number | null;
  targetProtein: number | null;
  nutritionDaysLogged: number;
  hasCheckIn: boolean;
  checkInWeight: number | null;
  photoCount: number;
}

const defaultForm: GradeForm = {
  workout_consistency: 5,
  workout_intensity: 5,
  nutrition_adherence: 5,
  water_intake: 5,
  sleep: 5,
  overall_grade: 5,
  strengths: '',
  improvements: '',
};

const categories = [
  { key: 'workout_consistency' as const, label: 'Workout Consistency' },
  { key: 'workout_intensity' as const, label: 'Workout Intensity' },
  { key: 'nutrition_adherence' as const, label: 'Nutrition Adherence' },
  { key: 'water_intake' as const, label: 'Water Intake' },
  { key: 'sleep' as const, label: 'Sleep' },
  { key: 'overall_grade' as const, label: 'Overall Grade' },
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff / oneWeek) + 1);
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} - ${sunday.toLocaleDateString('en-US', opts)}, ${monday.getFullYear()}`;
}

function getWeekEnd(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

function getRateColor(rate: number): string {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-600';
  if (rate >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getRateBgColor(rate: number): string {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 60) return 'bg-yellow-500';
  if (rate >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function AdminGradesPage() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [grades, setGrades] = useState<WeeklyGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(getMonday(new Date()));
  const [filter, setFilter] = useState<'needs_grading' | 'graded' | 'all'>('needs_grading');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [form, setForm] = useState<GradeForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [clientsWithCheckIn, setClientsWithCheckIn] = useState<Set<string>>(new Set());
  const [clientsWithPhotos, setClientsWithPhotos] = useState<Set<string>>(new Set());
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedWeek]);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    const weekStart = selectedWeek.toISOString().split('T')[0];
    const weekEnd = getWeekEnd(selectedWeek);
    const weekNum = getWeekNumber(selectedWeek);

    const [clientsRes, gradesRes, checkInsRes, photosRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'client')
        .order('full_name'),
      supabase
        .from('weekly_grades')
        .select('*')
        .eq('graded_week_start', weekStart),
      supabase
        .from('check_ins')
        .select('client_id')
        .eq('week_number', weekNum),
      supabase
        .from('progress_photos')
        .select('client_id')
        .gte('photo_date', weekStart)
        .lte('photo_date', weekEnd),
    ]);

    if (clientsRes.data) setClients(clientsRes.data);
    if (gradesRes.data) setGrades(gradesRes.data);

    const checkInSet = new Set<string>();
    checkInsRes.data?.forEach((r) => checkInSet.add(r.client_id));
    setClientsWithCheckIn(checkInSet);

    const photosSet = new Set<string>();
    photosRes.data?.forEach((r) => photosSet.add(r.client_id));
    setClientsWithPhotos(photosSet);

    setLoading(false);
  };

  const fetchWeeklySummary = async (clientId: string): Promise<WeeklySummary> => {
    const supabase = createClient();
    const weekStart = selectedWeek.toISOString().split('T')[0];
    const weekEnd = getWeekEnd(selectedWeek);
    const weekNum = getWeekNumber(selectedWeek);

    const [
      workoutsRes,
      habitsCountRes,
      habitLogsCountRes,
      waterRes,
      sleepRes,
      foodRes,
      detailsRes,
      measurementRes,
      checkInRes,
      photosCountRes,
    ] = await Promise.all([
      supabase
        .from('assigned_workouts')
        .select('status')
        .eq('client_id', clientId)
        .gte('workout_date', weekStart)
        .lte('workout_date', weekEnd)
        .neq('status', 'rest'),
      supabase
        .from('habits')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('is_active', true),
      supabase
        .from('habit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('completed', true)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd),
      supabase
        .from('water_logs')
        .select('log_date, amount_oz')
        .eq('client_id', clientId)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd),
      supabase
        .from('sleep_logs')
        .select('hours_slept, sleep_quality')
        .eq('client_id', clientId)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd),
      supabase
        .from('food_logs')
        .select('log_date, calories, protein, carbs, fat')
        .eq('client_id', clientId)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd),
      supabase
        .from('client_details')
        .select('target_calories, target_protein, target_carbs, target_fat')
        .eq('user_id', clientId)
        .single(),
      supabase
        .from('measurements')
        .select('weight')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('check_ins')
        .select('weight')
        .eq('client_id', clientId)
        .eq('week_number', weekNum)
        .limit(1),
      supabase
        .from('progress_photos')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('photo_date', weekStart)
        .lte('photo_date', weekEnd),
    ]);

    // Workouts
    const workouts = workoutsRes.data || [];
    const workoutsCompleted = workouts.filter((w) => w.status === 'completed').length;
    const workoutsScheduled = workouts.length;
    const workoutRate = workoutsScheduled > 0 ? Math.round((workoutsCompleted / workoutsScheduled) * 100) : 0;

    // Habits
    const activeHabitsCount = habitsCountRes.count || 0;
    const habitsCompleted = habitLogsCountRes.count || 0;
    const habitsTotal = activeHabitsCount * 7;
    const habitRate = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;

    // Water
    const waterLogs = waterRes.data || [];
    const waterByDay = new Map<string, number>();
    waterLogs.forEach((w) => {
      waterByDay.set(w.log_date, (waterByDay.get(w.log_date) || 0) + w.amount_oz);
    });
    const waterDaysLogged = waterByDay.size;
    const totalWater = Array.from(waterByDay.values()).reduce((a, b) => a + b, 0);
    const waterDailyAvgOz = waterDaysLogged > 0 ? Math.round(totalWater / waterDaysLogged) : 0;
    const waterGoalOz = measurementRes.data?.weight ? Math.round(measurementRes.data.weight / 2) : null;

    // Sleep
    const sleepLogs = sleepRes.data || [];
    const sleepDaysLogged = sleepLogs.length;
    const sleepAvgHours = sleepDaysLogged > 0
      ? Math.round((sleepLogs.reduce((a, s) => a + s.hours_slept, 0) / sleepDaysLogged) * 10) / 10
      : 0;
    const sleepAvgQuality = sleepDaysLogged > 0
      ? Math.round((sleepLogs.reduce((a, s) => a + s.sleep_quality, 0) / sleepDaysLogged) * 10) / 10
      : 0;

    // Nutrition
    const foodLogs = foodRes.data || [];
    const foodByDay = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();
    foodLogs.forEach((f) => {
      const existing = foodByDay.get(f.log_date) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      foodByDay.set(f.log_date, {
        calories: existing.calories + (f.calories || 0),
        protein: existing.protein + (f.protein || 0),
        carbs: existing.carbs + (f.carbs || 0),
        fat: existing.fat + (f.fat || 0),
      });
    });
    const nutritionDaysLogged = foodByDay.size;
    const totalNutrition = Array.from(foodByDay.values()).reduce(
      (a, b) => ({ calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    const avgCalories = nutritionDaysLogged > 0 ? Math.round(totalNutrition.calories / nutritionDaysLogged) : 0;
    const avgProtein = nutritionDaysLogged > 0 ? Math.round(totalNutrition.protein / nutritionDaysLogged) : 0;
    const avgCarbs = nutritionDaysLogged > 0 ? Math.round(totalNutrition.carbs / nutritionDaysLogged) : 0;
    const avgFat = nutritionDaysLogged > 0 ? Math.round(totalNutrition.fat / nutritionDaysLogged) : 0;

    // Check-in
    const checkInData = checkInRes.data || [];
    const hasCheckIn = checkInData.length > 0;
    const checkInWeight = hasCheckIn ? checkInData[0].weight : null;

    // Photos
    const photoCount = photosCountRes.count || 0;

    return {
      workoutsCompleted,
      workoutsScheduled,
      workoutRate,
      habitsCompleted,
      habitsTotal,
      habitRate,
      waterDailyAvgOz,
      waterGoalOz,
      waterDaysLogged,
      sleepAvgHours,
      sleepAvgQuality,
      sleepDaysLogged,
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      targetCalories: detailsRes.data?.target_calories || null,
      targetProtein: detailsRes.data?.target_protein || null,
      nutritionDaysLogged,
      hasCheckIn,
      checkInWeight,
      photoCount,
    };
  };

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setSelectedWeek(newWeek);
  };

  const getClientGrade = (clientId: string): WeeklyGrade | undefined => {
    return grades.find((g) => g.client_id === clientId);
  };

  const filteredClients = clients.filter((client) => {
    const grade = getClientGrade(client.id);
    if (filter === 'needs_grading') return !grade;
    if (filter === 'graded') return !!grade;
    return true;
  });

  const gradedCount = clients.filter((c) => getClientGrade(c.id)).length;

  const openGradeModal = (client: ClientProfile) => {
    const existing = getClientGrade(client.id);
    if (existing) {
      setForm({
        workout_consistency: existing.workout_consistency,
        workout_intensity: existing.workout_intensity,
        nutrition_adherence: existing.nutrition_adherence,
        water_intake: existing.water_intake,
        sleep: existing.sleep,
        overall_grade: existing.overall_grade,
        strengths: existing.strengths || '',
        improvements: existing.improvements || '',
      });
    } else {
      setForm(defaultForm);
    }
    setSelectedClient(client);
    setWeeklySummary(null);
    setSummaryLoading(true);
    fetchWeeklySummary(client.id).then((summary) => {
      setWeeklySummary(summary);
      setSummaryLoading(false);
    });
  };

  const submitGrade = async () => {
    if (!selectedClient) return;
    setSaving(true);

    const supabase = createClient();
    const weekStart = selectedWeek.toISOString().split('T')[0];
    const weekNum = getWeekNumber(selectedWeek);

    const gradeData = {
      client_id: selectedClient.id,
      week_number: weekNum,
      graded_week_start: weekStart,
      workout_consistency: form.workout_consistency,
      workout_intensity: form.workout_intensity,
      nutrition_adherence: form.nutrition_adherence,
      water_intake: form.water_intake,
      sleep: form.sleep,
      overall_grade: form.overall_grade,
      strengths: form.strengths || null,
      improvements: form.improvements || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error: upsertError } = await supabase
      .from('weekly_grades')
      .upsert(gradeData, { onConflict: 'client_id,graded_week_start' })
      .select()
      .single();

    if (upsertError) {
      showError('Failed to save grade');
      setSaving(false);
      return;
    }

    setGrades((prev) => {
      const filtered = prev.filter(
        (g) => !(g.client_id === selectedClient.id && g.graded_week_start === weekStart)
      );
      return [...filtered, data];
    });

    success(`Grade saved for ${selectedClient.full_name}`);
    setSelectedClient(null);
    setForm(defaultForm);
    setSaving(false);
  };

  const sendReminder = async (clientId: string, type: 'checkin' | 'photos') => {
    setSendingReminder(clientId);

    const payload = type === 'checkin'
      ? {
          title: 'Weekly Check-in Reminder',
          body: "Don't forget to submit your weekly check-in!",
          url: '/dashboard/check-ins',
          tag: 'checkin-reminder',
        }
      : {
          title: 'Progress Photos Reminder',
          body: 'Time to upload your weekly progress photos!',
          url: '/dashboard/progress',
          tag: 'photos-reminder',
        };

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientId,
          notificationType: type === 'checkin' ? 'checkin' : 'progress',
          payload,
        }),
      });

      const result = await response.json();
      if (result.sent > 0) {
        success('Reminder sent!');
      } else if (result.error === 'User has disabled this notification type') {
        showError('Client has disabled this notification type');
      } else if (response.status === 404) {
        showError('Client has no push subscription');
      } else {
        showError('Failed to send reminder');
      }
    } catch {
      showError('Failed to send reminder');
    }

    setSendingReminder(null);
  };

  const sendBulkReminder = async (type: 'checkin' | 'photos') => {
    setSendingBulk(true);

    const missingClients = clients.filter((c) =>
      type === 'checkin'
        ? !clientsWithCheckIn.has(c.id)
        : !clientsWithPhotos.has(c.id)
    );

    let sentCount = 0;
    let failedCount = 0;

    for (const client of missingClients) {
      const payload = type === 'checkin'
        ? {
            title: 'Weekly Check-in Reminder',
            body: "Don't forget to submit your weekly check-in!",
            url: '/dashboard/check-ins',
            tag: 'checkin-reminder',
          }
        : {
            title: 'Progress Photos Reminder',
            body: 'Time to upload your weekly progress photos!',
            url: '/dashboard/progress',
            tag: 'photos-reminder',
          };

      try {
        const response = await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: client.id,
            notificationType: type === 'checkin' ? 'checkin' : 'progress',
            payload,
          }),
        });
        const result = await response.json();
        if (result.sent > 0) sentCount++;
        else failedCount++;
      } catch {
        failedCount++;
      }
    }

    success(`Reminders sent to ${sentCount} client${sentCount !== 1 ? 's' : ''}${failedCount > 0 ? ` (${failedCount} failed)` : ''}`);
    setSendingBulk(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const missingCheckInCount = clients.filter((c) => !clientsWithCheckIn.has(c.id)).length;
  const missingPhotosCount = clients.filter((c) => !clientsWithPhotos.has(c.id)).length;

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
        <h1 className="text-2xl font-bold text-black">Weekly Grades</h1>
        <p className="text-grey-600 mt-1">Grade clients on their weekly performance</p>
      </div>

      {/* Week Selector */}
      <div className="bg-white p-4 flex items-center justify-between">
        <button
          onClick={() => navigateWeek(-1)}
          className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-grey-600" />
        </button>
        <div className="text-center">
          <p className="font-semibold text-black">{formatWeekLabel(selectedWeek)}</p>
          <p className="text-sm text-grey-500">Week {getWeekNumber(selectedWeek)}</p>
        </div>
        <button
          onClick={() => navigateWeek(1)}
          className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-grey-600" />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-grey-500">Graded</p>
          <p className="text-2xl font-bold text-black">
            {gradedCount} / {clients.length}
          </p>
        </div>
        <div className="h-3 flex-[3] bg-grey-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: clients.length > 0 ? `${(gradedCount / clients.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Reminder Bar */}
      <div className="bg-white p-4 flex items-center gap-3 flex-wrap">
        <p className="text-sm text-grey-500 flex-1">
          {missingCheckInCount} missing check-ins &middot; {missingPhotosCount} missing photos
        </p>
        <Button
          onClick={() => sendBulkReminder('checkin')}
          variant="outline"
          size="sm"
          disabled={sendingBulk || missingCheckInCount === 0}
        >
          <Bell className="h-4 w-4 mr-1" />
          Remind All (Check-in)
        </Button>
        <Button
          onClick={() => sendBulkReminder('photos')}
          variant="outline"
          size="sm"
          disabled={sendingBulk || missingPhotosCount === 0}
        >
          <Camera className="h-4 w-4 mr-1" />
          Remind All (Photos)
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 flex gap-2">
        {([
          { key: 'needs_grading' as const, label: 'Needs Grading' },
          { key: 'graded' as const, label: 'Graded' },
          { key: 'all' as const, label: 'All' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-grey-600 hover:bg-grey-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => {
          const grade = getClientGrade(client.id);
          const missingCheckIn = !clientsWithCheckIn.has(client.id);
          const missingPhotos = !clientsWithPhotos.has(client.id);
          return (
            <div key={client.id} className="bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  avatarUrl={client.avatar_url}
                  userName={client.full_name}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-black">{client.full_name}</p>
                  <p className="text-sm text-grey-500">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {missingCheckIn && (
                  <button
                    onClick={() => sendReminder(client.id, 'checkin')}
                    disabled={sendingReminder === client.id}
                    className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                    title="Send check-in reminder"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                  </button>
                )}
                {missingPhotos && (
                  <button
                    onClick={() => sendReminder(client.id, 'photos')}
                    disabled={sendingReminder === client.id}
                    className="p-1.5 text-purple-500 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                    title="Send photos reminder"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                {grade ? (
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getScoreColor(grade.overall_grade)}`}>
                      {grade.overall_grade}
                    </div>
                    <Button onClick={() => openGradeModal(client)} variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => openGradeModal(client)} variant="primary" size="sm">
                    Grade
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="bg-white p-12 text-center">
            <p className="text-grey-500">
              {filter === 'needs_grading'
                ? 'All clients have been graded for this week!'
                : filter === 'graded'
                ? 'No clients graded yet for this week'
                : 'No clients found'}
            </p>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-grey-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-black">Grade Client</h3>
                <p className="text-sm text-grey-500">{selectedClient.full_name} - {formatWeekLabel(selectedWeek)}</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-grey-400 hover:text-black"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Weekly Performance Summary */}
              <div>
                <p className="text-sm font-semibold text-grey-700 mb-3">Week Performance Data</p>
                {summaryLoading ? (
                  <div className="bg-grey-50 p-4 text-center">
                    <p className="animate-pulse text-grey-500 text-sm">Loading week data...</p>
                  </div>
                ) : weeklySummary ? (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Workouts */}
                    <div className="bg-grey-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Dumbbell className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-xs text-grey-500">Workouts</span>
                      </div>
                      <p className={`text-sm font-bold ${getRateColor(weeklySummary.workoutRate)}`}>
                        {weeklySummary.workoutsCompleted}/{weeklySummary.workoutsScheduled}
                      </p>
                      <div className="h-1.5 bg-grey-200 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${getRateBgColor(weeklySummary.workoutRate)}`} style={{ width: `${weeklySummary.workoutRate}%` }} />
                      </div>
                    </div>

                    {/* Habits */}
                    <div className="bg-grey-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target className="h-3.5 w-3.5 text-purple-600" />
                        <span className="text-xs text-grey-500">Habits</span>
                      </div>
                      <p className={`text-sm font-bold ${getRateColor(weeklySummary.habitRate)}`}>
                        {weeklySummary.habitsCompleted}/{weeklySummary.habitsTotal}
                      </p>
                      <div className="h-1.5 bg-grey-200 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${getRateBgColor(weeklySummary.habitRate)}`} style={{ width: `${weeklySummary.habitRate}%` }} />
                      </div>
                    </div>

                    {/* Water */}
                    <div className="bg-grey-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs text-grey-500">Water (avg/day)</span>
                      </div>
                      <p className={`text-sm font-bold ${weeklySummary.waterGoalOz ? getRateColor((weeklySummary.waterDailyAvgOz / weeklySummary.waterGoalOz) * 100) : 'text-grey-700'}`}>
                        {weeklySummary.waterDailyAvgOz}oz
                        {weeklySummary.waterGoalOz && <span className="text-xs text-grey-400 font-normal"> / {weeklySummary.waterGoalOz}oz</span>}
                      </p>
                      <p className="text-xs text-grey-400 mt-0.5">{weeklySummary.waterDaysLogged} days logged</p>
                    </div>

                    {/* Sleep */}
                    <div className="bg-grey-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Moon className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="text-xs text-grey-500">Sleep (avg)</span>
                      </div>
                      <p className={`text-sm font-bold ${weeklySummary.sleepAvgHours >= 7 ? 'text-green-600' : weeklySummary.sleepAvgHours >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {weeklySummary.sleepDaysLogged > 0 ? `${weeklySummary.sleepAvgHours}h` : 'No data'}
                        {weeklySummary.sleepDaysLogged > 0 && <span className="text-xs text-grey-400 font-normal"> / Q: {weeklySummary.sleepAvgQuality}/5</span>}
                      </p>
                      <p className="text-xs text-grey-400 mt-0.5">{weeklySummary.sleepDaysLogged} days logged</p>
                    </div>

                    {/* Nutrition */}
                    <div className="bg-grey-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Apple className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs text-grey-500">Nutrition (avg/day)</span>
                      </div>
                      {weeklySummary.nutritionDaysLogged > 0 ? (
                        <>
                          <p className="text-sm font-bold text-grey-700">
                            {weeklySummary.avgCalories} cal
                            {weeklySummary.targetCalories && <span className="text-xs text-grey-400 font-normal"> / {weeklySummary.targetCalories}</span>}
                          </p>
                          <p className="text-xs text-grey-500 mt-0.5">
                            P: {weeklySummary.avgProtein}g{weeklySummary.targetProtein && ` / ${weeklySummary.targetProtein}g`} &middot; C: {weeklySummary.avgCarbs}g &middot; F: {weeklySummary.avgFat}g
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-grey-400">No data</p>
                      )}
                    </div>

                    {/* Check-in & Photos */}
                    <div className="bg-grey-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ClipboardCheck className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs text-grey-500">Check-in & Photos</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {weeklySummary.hasCheckIn ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${weeklySummary.hasCheckIn ? 'text-green-600' : 'text-red-600'}`}>
                          {weeklySummary.hasCheckIn ? `Submitted${weeklySummary.checkInWeight ? ` (${weeklySummary.checkInWeight} lbs)` : ''}` : 'No check-in'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {weeklySummary.photoCount > 0 ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${weeklySummary.photoCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {weeklySummary.photoCount > 0 ? `${weeklySummary.photoCount} photo${weeklySummary.photoCount !== 1 ? 's' : ''}` : 'No photos'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <hr className="border-grey-200" />

              {/* Grade Sliders */}
              <p className="text-sm font-semibold text-grey-700">Grade Sliders</p>
              {categories.map((cat) => (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-black">{cat.label}</label>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded text-white ${getScoreColor(form[cat.key])}`}>
                      {form[cat.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form[cat.key]}
                    onChange={(e) => setForm({ ...form, [cat.key]: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-grey-400 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-black mb-2">Strengths</label>
                <textarea
                  value={form.strengths}
                  onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                  rows={3}
                  placeholder="What did they do well this week?"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Areas to Improve</label>
                <textarea
                  value={form.improvements}
                  onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                  rows={3}
                  placeholder="What can they improve on next week?"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setSelectedClient(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitGrade}
                  variant="primary"
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Grade'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
