'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  estimateCaloriesBurned,
  ACTIVITY_LABELS,
  INTENSITY_LABELS,
  ACTIVITY_MET_VALUES,
} from '@/lib/calories';
import {
  Flame,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Dumbbell,
  Footprints,
  Waves,
  Bike,
  Watch,
  Timer,
  Activity,
  X,
  Zap,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  client_id: string;
  log_date: string;
  activity_type: string;
  activity_name: string;
  duration_minutes: number | null;
  intensity: string | null;
  calories_burned: number;
  source: string;
  assigned_workout_id: string | null;
  notes: string | null;
  logged_at: string;
}

const ACTIVITY_ICONS: Record<string, typeof Dumbbell> = {
  workout: Dumbbell,
  cardio: Activity,
  walking: Footprints,
  running: Footprints,
  swimming: Waves,
  hiit: Timer,
  cycling: Bike,
  yoga: Activity,
  other: Zap,
  manual_entry: Watch,
};

const today = new Date().toISOString().split('T')[0];

export default function ActivityPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [weight, setWeight] = useState<number>(170);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [mode, setMode] = useState<'activity' | 'manual'>('activity');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Activity form state
  const [activityType, setActivityType] = useState('cardio');
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('moderate');

  // Manual form state
  const [manualCalories, setManualCalories] = useState('');
  const [manualDescription, setManualDescription] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchActivities(userId, selectedDate);
    }
  }, [selectedDate, userId]);

  const fetchUserData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const { data: measurement } = await supabase
      .from('measurements')
      .select('weight')
      .eq('client_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    if (measurement?.weight) {
      setWeight(measurement.weight);
    }

    await fetchActivities(user.id, today);
    setLoading(false);
  };

  const fetchActivities = async (clientId: string, date: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('client_id', clientId)
      .eq('log_date', date)
      .order('logged_at', { ascending: false });

    if (data) setActivities(data);
  };

  const totalBurned = activities.reduce((sum, a) => sum + a.calories_burned, 0);

  const liveEstimate = duration
    ? estimateCaloriesBurned(activityType, intensity, parseInt(duration) || 0, weight)
    : 0;

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(dateStr + 'T00:00:00');

    if (selectedDateObj.getTime() === todayDate.getTime()) return 'Today';

    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    if (selectedDateObj.getTime() === yesterday.getTime()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === today;

  const resetForm = () => {
    setActivityType('cardio');
    setActivityName('');
    setDuration('30');
    setIntensity('moderate');
    setManualCalories('');
    setManualDescription('');
    setShowForm(false);
  };

  const saveActivity = async () => {
    if (!userId) return;
    const dur = parseInt(duration) || 0;
    if (dur <= 0) {
      toast.error('Please enter a valid duration.');
      return;
    }
    setSaving(true);

    const caloriesBurned = estimateCaloriesBurned(activityType, intensity, dur, weight);
    const supabase = createClient();
    const { error } = await supabase.from('activity_logs').insert({
      client_id: userId,
      log_date: selectedDate,
      activity_type: activityType,
      activity_name: activityName || ACTIVITY_LABELS[activityType] || activityType,
      duration_minutes: dur,
      intensity,
      calories_burned: caloriesBurned,
      source: 'manual_activity',
    });

    if (error) {
      toast.error('Failed to save activity.');
    } else {
      toast.success(`Logged ${caloriesBurned} calories burned!`);
      await fetchActivities(userId, selectedDate);
      resetForm();
    }
    setSaving(false);
  };

  const saveManualEntry = async () => {
    if (!userId) return;
    const cal = parseInt(manualCalories) || 0;
    if (cal <= 0) {
      toast.error('Please enter calories burned.');
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from('activity_logs').insert({
      client_id: userId,
      log_date: selectedDate,
      activity_type: 'manual_entry',
      activity_name: manualDescription || 'Manual Entry',
      calories_burned: cal,
      source: 'manual_entry',
    });

    if (error) {
      toast.error('Failed to save entry.');
    } else {
      toast.success(`Logged ${cal} calories burned!`);
      await fetchActivities(userId, selectedDate);
      resetForm();
    }
    setSaving(false);
  };

  const deleteActivity = async (id: string) => {
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase.from('activity_logs').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete activity.');
    } else {
      toast.success('Activity deleted.');
      await fetchActivities(userId, selectedDate);
    }
  };

  const getActivityIcon = (type: string) => {
    const Icon = ACTIVITY_ICONS[type] || Zap;
    return <Icon className="h-5 w-5" />;
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'auto_workout': return { label: 'Auto', color: 'bg-blue-100 text-blue-700' };
      case 'manual_activity': return { label: 'Activity', color: 'bg-green-100 text-green-700' };
      case 'manual_entry': return { label: 'Manual', color: 'bg-purple-100 text-purple-700' };
      default: return { label: source, color: 'bg-grey-100 text-grey-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-grey-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Activity Tracker</h1>
        <p className="text-grey-600 text-sm mt-1">Track calories burned from workouts and activities</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white border border-grey-200 px-4 py-3">
        <button onClick={() => navigateDate('prev')} className="p-1 hover:bg-grey-100 transition-colors">
          <ChevronLeft className="h-4 w-4 text-grey-600" />
        </button>
        <span className="text-sm font-medium text-black">{formatDateDisplay(selectedDate)}</span>
        <button
          onClick={() => navigateDate('next')}
          disabled={isToday}
          className="p-1 hover:bg-grey-100 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Daily Total */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 flex items-center justify-center">
                <Flame className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-grey-500">Calories Burned {isToday ? 'Today' : ''}</p>
                <p className="text-3xl font-bold text-black">{totalBurned}</p>
              </div>
            </div>
            <div className="text-right text-sm text-grey-500">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Buttons */}
      {!showForm && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setMode('activity'); setShowForm(true); }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Log Activity
          </button>
          <button
            onClick={() => { setMode('manual'); setShowForm(true); }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors"
          >
            <Watch className="h-4 w-4" />
            Manual Entry
          </button>
        </div>
      )}

      {/* Log Form */}
      {showForm && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black">
                {mode === 'activity' ? 'Log Activity' : 'Manual Entry'}
              </h3>
              <button onClick={resetForm} className="p-1 text-grey-400 hover:text-grey-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {mode === 'activity' ? (
              <div className="space-y-4">
                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Activity Type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  >
                    {Object.entries(ACTIVITY_LABELS)
                      .filter(([key]) => key !== 'manual_entry')
                      .map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                  </select>
                </div>

                {/* Activity Name */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder={ACTIVITY_LABELS[activityType] || 'Activity name'}
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Intensity */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Intensity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(INTENSITY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setIntensity(key)}
                        className={`px-2 py-2 text-xs font-medium border transition-colors ${
                          intensity === key
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-grey-600 border-grey-300 hover:border-grey-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Estimate */}
                {liveEstimate > 0 && (
                  <div className="bg-orange-50 border border-orange-200 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-grey-700">Estimated burn:</span>
                    <span className="text-lg font-bold text-orange-600">{liveEstimate} cal</span>
                  </div>
                )}

                <Button onClick={saveActivity} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Activity
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Calories */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Calories Burned</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="e.g. 350"
                    min="1"
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Source / Description</label>
                  <input
                    type="text"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="e.g. Apple Watch, Peloton, etc."
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <Button onClick={saveManualEntry} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      {activities.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-grey-700">
            {isToday ? "Today's" : formatDateDisplay(selectedDate)} Activities
          </h3>
          {activities.map((activity) => {
            const badge = getSourceBadge(activity.source);
            return (
              <Card key={activity.id}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-grey-100 flex items-center justify-center flex-shrink-0 text-grey-600">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div>
                      <p className="font-semibold text-black text-sm">{activity.activity_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {activity.duration_minutes && (
                          <span className="text-xs text-grey-500">{activity.duration_minutes} min</span>
                        )}
                        {activity.intensity && (
                          <>
                            <span className="text-xs text-grey-300">|</span>
                            <span className="text-xs text-grey-500">{INTENSITY_LABELS[activity.intensity] || activity.intensity}</span>
                          </>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 font-medium ${badge.color}`}>{badge.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-red-600">{activity.calories_burned}</p>
                      <p className="text-xs text-grey-500">cal</p>
                    </div>
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      className="p-1.5 text-grey-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <Activity className="h-10 w-10 mx-auto text-grey-300 mb-3" />
            <p className="text-grey-600 text-sm">
              No activities logged {isToday ? 'today' : `for ${formatDateDisplay(selectedDate)}`}.
            </p>
            <p className="text-grey-400 text-xs mt-1">
              Log an activity or enter calories from your Apple Watch.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
