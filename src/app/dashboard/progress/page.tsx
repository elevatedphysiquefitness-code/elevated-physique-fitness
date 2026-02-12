'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, generateFilePath } from '@/lib/supabase/storage';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Camera,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  X,
  Percent,
  Upload,
  CheckCircle,
  Flame,
  Calendar,
  Trash2,
  CheckSquare,
  Target,
  Trophy,
  Flag,
} from 'lucide-react';

interface Measurement {
  id: string;
  measurement_date: string;
  weight: number | null;
  body_fat_percentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  thigh: number | null;
  bicep: number | null;
  notes: string | null;
  // InBody data
  skeletal_muscle_mass: number | null;
  body_fat_mass: number | null;
  total_body_water: number | null;
  lean_body_mass: number | null;
  bmi: number | null;
  basal_metabolic_rate: number | null;
  visceral_fat_level: number | null;
}

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  photo_date: string;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
}

interface Goal {
  id: string;
  goal_type: string;
  title: string;
  target_value: number;
  target_unit: string;
  current_value: number | null;
  start_value: number | null;
  target_date: string | null;
  status: 'active' | 'achieved' | 'abandoned';
  created_at: string;
}

const defaultHabits = [
  { name: 'Drink 1 gallon of water', description: 'Stay hydrated throughout the day' },
  { name: 'Sleep 7+ hours', description: 'Get quality sleep for recovery' },
  { name: 'Hit protein goal', description: 'Consume your daily protein target' },
  { name: '10,000 steps', description: 'Stay active with daily walking' },
  { name: 'Complete workout', description: 'Finish your scheduled workout' },
  { name: 'Meal prep', description: 'Prepare healthy meals in advance' },
];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<'progress' | 'habits' | 'goals'>('progress');
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoType, setPhotoType] = useState<string>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Habits state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [weeklyPercentage, setWeeklyPercentage] = useState(0);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'weight_loss',
    target_value: '',
    target_date: '',
  });

  // Form state
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    bodyFatPercentage: '',
    chest: '',
    waist: '',
    hips: '',
    thigh: '',
    bicep: '',
    notes: '',
    // InBody fields
    skeletalMuscleMass: '',
    bodyFatMass: '',
    totalBodyWater: '',
    leanBodyMass: '',
    bmi: '',
    basalMetabolicRate: '',
    visceralFatLevel: '',
  });

  useEffect(() => {
    fetchProgress();
    fetchHabits();
  }, []);

  const fetchProgress = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch measurements
    const { data: measurementData } = await supabase
      .from('measurements')
      .select('*')
      .eq('client_id', user.id)
      .order('measurement_date', { ascending: true });

    if (measurementData) {
      setMeasurements(measurementData);
    }

    // Fetch progress photos
    const { data: photoData } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', user.id)
      .order('photo_date', { ascending: true });

    if (photoData) {
      setPhotos(photoData);
    }

    setLoading(false);
  };

  const saveMeasurement = async () => {
    if (!newMeasurement.weight) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('measurements')
      .insert({
        client_id: user.id,
        weight: newMeasurement.weight ? parseFloat(newMeasurement.weight) : null,
        body_fat_percentage: newMeasurement.bodyFatPercentage ? parseFloat(newMeasurement.bodyFatPercentage) : null,
        chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : null,
        waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : null,
        hips: newMeasurement.hips ? parseFloat(newMeasurement.hips) : null,
        thigh: newMeasurement.thigh ? parseFloat(newMeasurement.thigh) : null,
        bicep: newMeasurement.bicep ? parseFloat(newMeasurement.bicep) : null,
        notes: newMeasurement.notes || null,
        // InBody data
        skeletal_muscle_mass: newMeasurement.skeletalMuscleMass ? parseFloat(newMeasurement.skeletalMuscleMass) : null,
        body_fat_mass: newMeasurement.bodyFatMass ? parseFloat(newMeasurement.bodyFatMass) : null,
        total_body_water: newMeasurement.totalBodyWater ? parseFloat(newMeasurement.totalBodyWater) : null,
        lean_body_mass: newMeasurement.leanBodyMass ? parseFloat(newMeasurement.leanBodyMass) : null,
        bmi: newMeasurement.bmi ? parseFloat(newMeasurement.bmi) : null,
        basal_metabolic_rate: newMeasurement.basalMetabolicRate ? parseFloat(newMeasurement.basalMetabolicRate) : null,
        visceral_fat_level: newMeasurement.visceralFatLevel ? parseFloat(newMeasurement.visceralFatLevel) : null,
      });

    if (error) {
      alert('Failed to save measurement. Please try again.');
      console.error('Error saving measurement:', error);
    } else {
      setNewMeasurement({
        weight: '',
        bodyFatPercentage: '',
        chest: '',
        waist: '',
        hips: '',
        thigh: '',
        bicep: '',
        notes: '',
        skeletalMuscleMass: '',
        bodyFatMass: '',
        totalBodyWater: '',
        leanBodyMass: '',
        bmi: '',
        basalMetabolicRate: '',
        visceralFatLevel: '',
      });
      setShowAddModal(false);
      fetchProgress();
    }

    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setUploadingPhoto(false);
      return;
    }

    const filePath = generateFilePath(user.id, 'progress', file.name);
    const result = await uploadFile('progress-photos', filePath, file);

    if ('error' in result) {
      alert('Failed to upload photo. Please try again.');
      setUploadingPhoto(false);
      return;
    }

    // Save photo record in the database
    const { error } = await supabase
      .from('progress_photos')
      .insert({
        client_id: user.id,
        photo_url: result.url,
        photo_type: photoType,
        storage_path: result.path,
        photo_date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      alert('Failed to save photo record. Please try again.');
      console.error('Error saving photo:', error);
    } else {
      setShowPhotoModal(false);
      fetchProgress();
    }

    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('progress_photos').delete().eq('id', photoId);
    if (!error) {
      setPhotos(photos.filter(p => p.id !== photoId));
    }
  };

  const deleteMeasurement = async (measurementId: string) => {
    if (!confirm('Delete this measurement entry?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('measurements').delete().eq('id', measurementId);
    if (!error) {
      setMeasurements(measurements.filter(m => m.id !== measurementId));
    }
  };

  // Habits functions
  const fetchHabits = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userHabits } = await supabase
      .from('habits')
      .select('id, name, description')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('created_at');

    if (userHabits) setHabits(userHabits);

    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('client_id', user.id)
      .eq('log_date', todayStr);

    if (logs) {
      const logMap: Record<string, boolean> = {};
      logs.forEach((log: { habit_id: string; completed: boolean }) => {
        logMap[log.habit_id] = log.completed;
      });
      setTodayLogs(logMap);
    }

    // Calculate streak
    let streakCount = 0;
    let checkDate = new Date();
    const totalHabits = userHabits?.length || 0;
    if (totalHabits > 0) {
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const { count } = await supabase
          .from('habit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('log_date', dateStr)
          .eq('completed', true);
        if ((count || 0) >= totalHabits) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }
    }
    setStreak(streakCount);

    // Calculate weekly percentage
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMonday);
    const daysElapsed = daysFromMonday + 1;
    const totalPossible = totalHabits * daysElapsed;
    if (totalPossible > 0) {
      const { count } = await supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .gte('log_date', weekStart.toISOString().split('T')[0])
        .lte('log_date', todayStr)
        .eq('completed', true);
      setWeeklyPercentage(Math.round(((count || 0) / totalPossible) * 100));
    }
  };

  const toggleHabit = async (habitId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newValue = !todayLogs[habitId];
    setTodayLogs({ ...todayLogs, [habitId]: newValue });

    await supabase.from('habit_logs').upsert({
      habit_id: habitId,
      client_id: user.id,
      log_date: todayStr,
      completed: newValue,
    }, { onConflict: 'habit_id,log_date' });

    fetchHabits();
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

    if (!error && data) {
      setHabits([...habits, data]);
      setNewHabitName('');
      setNewHabitDescription('');
      setShowHabitModal(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Delete this habit?')) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('habits').update({ is_active: false }).eq('id', habitId);
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const addDefaultHabits = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('habits')
      .insert(defaultHabits.map(h => ({ client_id: user.id, name: h.name, description: h.description, is_active: true })))
      .select();

    if (data) setHabits(data);
  };

  // Goals functions
  const fetchGoals = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userGoals } = await supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (userGoals) setGoals(userGoals);
  };

  const saveGoal = async () => {
    if (!newGoal.target_value) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    // Get current value based on goal type
    let currentValue = null;
    if (newGoal.goal_type === 'weight_loss' || newGoal.goal_type === 'weight_gain') {
      currentValue = measurements[measurements.length - 1]?.weight || null;
    } else if (newGoal.goal_type === 'body_fat') {
      currentValue = measurements[measurements.length - 1]?.body_fat_percentage || null;
    }

    const { error } = await supabase.from('client_goals').insert({
      client_id: user.id,
      goal_type: newGoal.goal_type === 'weight_loss' || newGoal.goal_type === 'weight_gain' ? 'weight' : newGoal.goal_type,
      title: goalTypeLabels[newGoal.goal_type],
      target_value: parseFloat(newGoal.target_value),
      target_unit: newGoal.goal_type === 'body_fat' ? '%' : 'lbs',
      current_value: currentValue,
      start_value: currentValue,
      target_date: newGoal.target_date || null,
      status: 'active',
    });

    if (!error) {
      setNewGoal({ goal_type: 'weight_loss', target_value: '', target_date: '' });
      setShowGoalModal(false);
      fetchGoals();
    }
    setSaving(false);
  };

  const markGoalAchieved = async (goalId: string) => {
    const supabase = createClient();
    await supabase.from('client_goals').update({ status: 'achieved', achieved_date: new Date().toISOString().split('T')[0] }).eq('id', goalId);
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal?')) return;
    const supabase = createClient();
    await supabase.from('client_goals').delete().eq('id', goalId);
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const getGoalProgress = (goal: Goal) => {
    if (!goal.start_value || !goal.target_value) return 0;

    // Get current value from latest measurement
    const currentWeight = measurements[measurements.length - 1]?.weight || goal.start_value;
    const currentBf = measurements[measurements.length - 1]?.body_fat_percentage || goal.start_value;

    if (goal.goal_type === 'weight' && goal.target_value < goal.start_value) {
      // Weight loss goal
      const totalToLose = goal.start_value - goal.target_value;
      const lost = goal.start_value - currentWeight;
      return totalToLose > 0 ? Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100))) : 0;
    } else if (goal.goal_type === 'weight' && goal.target_value > goal.start_value) {
      // Weight gain goal
      const totalToGain = goal.target_value - goal.start_value;
      const gained = currentWeight - goal.start_value;
      return totalToGain > 0 ? Math.min(100, Math.max(0, Math.round((gained / totalToGain) * 100))) : 0;
    } else if (goal.goal_type === 'body_fat') {
      // Body fat reduction goal
      const totalToLose = goal.start_value - goal.target_value;
      const lost = goal.start_value - currentBf;
      return totalToLose > 0 ? Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100))) : 0;
    }
    return 0;
  };

  const goalTypeLabels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    weight_gain: 'Weight Gain',
    body_fat: 'Body Fat %',
    muscle_mass: 'Muscle Mass',
    custom: 'Custom Goal',
  };

  const goalTypeIcons: Record<string, typeof Scale> = {
    weight_loss: Scale,
    weight_gain: TrendingUp,
    body_fat: Percent,
    muscle_mass: TrendingUp,
    custom: Target,
  };

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const completedCount = Object.values(todayLogs).filter(Boolean).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Calculate key metrics
  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
  const startingMeasurement = measurements.length > 0 ? measurements[0] : null;

  const startingWeight = startingMeasurement?.weight || null;
  const currentWeight = latestMeasurement?.weight || null;
  const weightChange = startingWeight && currentWeight ? currentWeight - startingWeight : null;

  const startingBodyFat = startingMeasurement?.body_fat_percentage || null;
  const currentBodyFat = latestMeasurement?.body_fat_percentage || null;
  const bodyFatChange = startingBodyFat && currentBodyFat ? currentBodyFat - startingBodyFat : null;

  // Get weight data for chart (last 8 entries)
  const weightData = measurements
    .filter(m => m.weight !== null)
    .slice(-8)
    .map((m, index) => ({
      week: index + 1,
      weight: m.weight as number,
      date: m.measurement_date,
    }));

  // Calculate body measurements changes
  const bodyMeasurements = latestMeasurement && startingMeasurement ? [
    {
      name: 'Chest',
      current: latestMeasurement.chest,
      start: startingMeasurement.chest,
      change: latestMeasurement.chest && startingMeasurement.chest
        ? latestMeasurement.chest - startingMeasurement.chest
        : null,
    },
    {
      name: 'Waist',
      current: latestMeasurement.waist,
      start: startingMeasurement.waist,
      change: latestMeasurement.waist && startingMeasurement.waist
        ? latestMeasurement.waist - startingMeasurement.waist
        : null,
    },
    {
      name: 'Hips',
      current: latestMeasurement.hips,
      start: startingMeasurement.hips,
      change: latestMeasurement.hips && startingMeasurement.hips
        ? latestMeasurement.hips - startingMeasurement.hips
        : null,
    },
    {
      name: 'Thigh',
      current: latestMeasurement.thigh,
      start: startingMeasurement.thigh,
      change: latestMeasurement.thigh && startingMeasurement.thigh
        ? latestMeasurement.thigh - startingMeasurement.thigh
        : null,
    },
    {
      name: 'Bicep',
      current: latestMeasurement.bicep,
      start: startingMeasurement.bicep,
      change: latestMeasurement.bicep && startingMeasurement.bicep
        ? latestMeasurement.bicep - startingMeasurement.bicep
        : null,
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  // Empty state - no measurements yet
  if (measurements.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Progress Tracking</h1>
          <p className="mt-2 text-grey-600">Track your transformation journey with data and visuals</p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-grey-100 mx-auto mb-6 flex items-center justify-center">
              <Scale className="h-8 w-8 text-grey-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Start Tracking Your Progress</h2>
            <p className="text-grey-600 max-w-md mx-auto mb-6">
              Log your first measurement to begin tracking your fitness journey.
              Regular measurements help you and your coach monitor your progress.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Log Your First Measurement
            </Button>
          </CardContent>
        </Card>

        {/* Add Measurement Modal */}
        {showAddModal && (
          <MeasurementModal
            newMeasurement={newMeasurement}
            setNewMeasurement={setNewMeasurement}
            onSave={saveMeasurement}
            onClose={() => setShowAddModal(false)}
            saving={saving}
          />
        )}
      </div>
    );
  }

  const maxWeight = weightData.length > 0 ? Math.max(...weightData.map(d => d.weight)) : 0;
  const minWeight = weightData.length > 0 ? Math.min(...weightData.map(d => d.weight)) : 0;
  const range = maxWeight - minWeight || 10;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Progress & Habits</h1>
        <p className="mt-2 text-grey-600">
          Track your transformation and build consistency
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-grey-100 p-1 w-fit">
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            activeTab === 'progress'
              ? 'bg-white text-black shadow-sm'
              : 'text-grey-600 hover:text-black'
          }`}
        >
          <Scale className="h-4 w-4 inline mr-2" />
          Progress
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            activeTab === 'habits'
              ? 'bg-white text-black shadow-sm'
              : 'text-grey-600 hover:text-black'
          }`}
        >
          <CheckSquare className="h-4 w-4 inline mr-2" />
          Habits
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-6 py-2 text-sm font-medium transition-colors ${
            activeTab === 'goals'
              ? 'bg-white text-black shadow-sm'
              : 'text-grey-600 hover:text-black'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Goals
        </button>
      </div>

      {/* Habits Tab Content */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowHabitModal(true)} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>

          {/* Habits Stats */}
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
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${habitCompletionRate}%` }} />
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
                <p className="text-grey-500 mb-6">Start building your daily routine</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={addDefaultHabits} variant="primary">Add Default Habits</Button>
                  <Button onClick={() => setShowHabitModal(true)} variant="outline">Create Custom</Button>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {habits.map((habit) => {
                  const isCompleted = todayLogs[habit.id] || false;
                  return (
                    <li key={habit.id} className="group">
                      <div className={`flex items-center gap-2 transition-colors ${isCompleted ? 'bg-green-50' : 'bg-grey-50 hover:bg-grey-100'}`}>
                        <button onClick={() => toggleHabit(habit.id)} className="flex-1 flex items-center gap-4 p-4 text-left">
                          <div className={`w-6 h-6 flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-600 border-green-600' : 'border-grey-300'}`}>
                            {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isCompleted ? 'text-grey-500 line-through' : 'text-black'}`}>{habit.name}</p>
                            {habit.description && <p className="text-sm text-grey-500 mt-0.5">{habit.description}</p>}
                          </div>
                        </button>
                        <button onClick={() => deleteHabit(habit.id)} className="p-3 text-grey-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add Habit Modal */}
          {showHabitModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">Add Custom Habit</h3>
                  <button onClick={() => setShowHabitModal(false)} className="text-grey-400 hover:text-black">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Habit Name *</label>
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="e.g., Read for 20 minutes"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Description (optional)</label>
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
                  <Button onClick={() => setShowHabitModal(false)} variant="outline" className="flex-1">Cancel</Button>
                  <Button onClick={addCustomHabit} variant="primary" className="flex-1">Add Habit</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goals Tab Content */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowGoalModal(true)} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Active Goals */}
          <div className="bg-white p-6">
            <h2 className="text-lg font-bold text-black mb-6">Your Goals</h2>
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-grey-300 mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">No goals yet</h3>
                <p className="text-grey-500 mb-6">Set a goal to track your progress</p>
                <Button onClick={() => setShowGoalModal(true)} variant="primary">
                  Set Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = getGoalProgress(goal);
                  const GoalIcon = goalTypeIcons[goal.goal_type] || Target;
                  const currentValue = goal.goal_type === 'body_fat'
                    ? measurements[measurements.length - 1]?.body_fat_percentage
                    : measurements[measurements.length - 1]?.weight;
                  const unit = goal.target_unit || (goal.goal_type === 'body_fat' ? '%' : 'lbs');

                  return (
                    <div key={goal.id} className="border border-grey-200 p-4 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                            <GoalIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-black">{goal.title}</p>
                            <p className="text-sm text-grey-500">
                              Target: {goal.target_value} {unit}
                              {goal.target_date && ` by ${new Date(goal.target_date).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => markGoalAchieved(goal.id)}
                            className="p-2 text-green-600 hover:bg-green-50"
                            title="Mark as achieved"
                          >
                            <Trophy className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 text-red-600 hover:bg-red-50"
                            title="Delete goal"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="h-3 bg-grey-200 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              progress >= 100 ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-grey-500">
                          Current: {currentValue !== undefined && currentValue !== null ? `${currentValue}${unit === '%' ? '%' : ' ' + unit}` : 'No data'}
                        </span>
                        <span className={`font-medium ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                          {progress >= 100 ? 'Goal reached!' : `${progress}% complete`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Goal Tips */}
          <div className="bg-blue-50 border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <Flag className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Tips for Setting Goals</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Set specific, measurable targets (e.g., &quot;lose 10 lbs&quot; instead of &quot;lose weight&quot;)</li>
                  <li>Give yourself a realistic timeline to achieve your goals</li>
                  <li>Log your measurements regularly to track progress accurately</li>
                  <li>Celebrate small wins along the way!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Add Goal Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">Set a New Goal</h3>
                  <button onClick={() => setShowGoalModal(false)} className="text-grey-400 hover:text-black">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Goal Type *</label>
                    <select
                      value={newGoal.goal_type}
                      onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="weight_loss">Weight Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                      <option value="body_fat">Reduce Body Fat %</option>
                      <option value="muscle_mass">Gain Muscle Mass</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Target Value * ({newGoal.goal_type === 'body_fat' ? '%' : 'lbs'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                      placeholder={newGoal.goal_type === 'body_fat' ? 'e.g., 15' : 'e.g., 165'}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Target Date (optional)</label>
                    <input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setShowGoalModal(false)} variant="outline" className="flex-1">Cancel</Button>
                  <Button onClick={saveGoal} variant="primary" className="flex-1" disabled={!newGoal.target_value || saving}>
                    {saving ? 'Saving...' : 'Set Goal'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Tab Content */}
      {activeTab === 'progress' && (
        <>
          <div className="mb-8 flex justify-end">
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Log Measurement
            </Button>
          </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Starting Weight</p>
                <p className="mt-2 text-2xl font-bold text-black">
                  {startingWeight ? `${startingWeight} lbs` : '--'}
                </p>
              </div>
              <div className="p-2 bg-grey-100">
                <Scale className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Current Weight</p>
                <p className="mt-2 text-2xl font-bold text-black">
                  {currentWeight ? `${currentWeight} lbs` : '--'}
                </p>
              </div>
              <div className="p-2 bg-grey-100">
                <Scale className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Weight Change</p>
                <p className={`mt-2 text-2xl font-bold ${
                  weightChange !== null && weightChange < 0 ? 'text-green-600' : 'text-black'
                }`}>
                  {weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs` : '--'}
                </p>
              </div>
              <div className={`p-2 ${weightChange !== null && weightChange < 0 ? 'bg-green-100' : 'bg-grey-100'}`}>
                {weightChange !== null && weightChange < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-grey-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Body Fat %</p>
                <p className={`mt-2 text-2xl font-bold ${
                  bodyFatChange !== null && bodyFatChange < 0 ? 'text-green-600' : 'text-black'
                }`}>
                  {currentBodyFat ? `${currentBodyFat}%` : '--'}
                </p>
                {bodyFatChange !== null && (
                  <p className={`text-xs ${bodyFatChange < 0 ? 'text-green-600' : 'text-grey-500'}`}>
                    {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
                  </p>
                )}
              </div>
              <div className={`p-2 ${bodyFatChange !== null && bodyFatChange < 0 ? 'bg-green-100' : 'bg-grey-100'}`}>
                <Percent className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Entries Logged</p>
                <p className="mt-2 text-2xl font-bold text-black">{measurements.length}</p>
              </div>
              <div className="p-2 bg-grey-100">
                <Ruler className="h-5 w-5 text-grey-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weight Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">Weight Progress</h2>
                <span className="text-sm text-grey-500">Last {weightData.length} entries</span>
              </div>
            </CardHeader>
            <CardContent>
              {weightData.length > 0 ? (
                <>
                  <div className="h-64 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-grey-500">
                      <span>{maxWeight} lbs</span>
                      <span>{Math.round((maxWeight + minWeight) / 2)} lbs</span>
                      <span>{minWeight} lbs</span>
                    </div>

                    {/* Chart area */}
                    <div className="ml-14 h-full flex items-end gap-4 pb-8 border-l border-b border-grey-200">
                      {weightData.map((data, index) => {
                        const height = ((data.weight - minWeight) / range) * 100 + 10;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors relative group"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {data.weight} lbs
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis labels */}
                    <div className="ml-14 flex gap-4 mt-2">
                      {weightData.map((data, index) => (
                        <div key={index} className="flex-1 text-center text-xs text-grey-500">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {weightChange !== null && weightChange < 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">
                          Great progress! You&apos;ve lost {Math.abs(weightChange).toFixed(1)} lbs so far.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-grey-500">
                  Log weight measurements to see your chart
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Measurements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Body Measurements</h2>
              <Button onClick={() => setShowAddModal(true)} variant="ghost" size="sm">Update</Button>
            </div>
          </CardHeader>
          <CardContent>
            {bodyMeasurements.length > 0 && bodyMeasurements.some(m => m.current !== null) ? (
              <div className="space-y-4">
                {bodyMeasurements.filter(m => m.current !== null).map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 bg-grey-100">
                    <div className="flex items-center gap-3">
                      <Ruler className="h-5 w-5 text-grey-400" />
                      <div>
                        <p className="font-medium text-black">{m.name}</p>
                        <p className="text-sm text-grey-500">{m.current}&quot;</p>
                      </div>
                    </div>
                    {m.change !== null && (
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        m.change < 0 ? 'text-green-600' : m.change > 0 ? 'text-blue-600' : 'text-grey-500'
                      }`}>
                        {m.change < 0 ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : m.change > 0 ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                        {Math.abs(m.change).toFixed(1)}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ruler className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">
                  No body measurements logged yet
                </p>
                <Button onClick={() => setShowAddModal(true)} variant="outline" size="sm" className="mt-4">
                  Add Measurements
                </Button>
              </div>
            )}
            {latestMeasurement && (
              <p className="mt-4 text-xs text-grey-500 text-center">
                Last updated: {new Date(latestMeasurement.measurement_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Photos */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Progress Photos</h2>
              <Button onClick={() => setShowPhotoModal(true)} variant="primary" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photos.slice(-3).map((photo) => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-[3/4] bg-grey-200 overflow-hidden relative">
                      <img
                        src={photo.photo_url}
                        alt={`Progress photo - ${photo.photo_type}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-semibold text-black capitalize">{photo.photo_type}</p>
                      <p className="text-sm text-grey-500">
                        {new Date(photo.photo_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-grey-300 mb-4" />
                <h3 className="font-semibold text-black mb-2">No Progress Photos Yet</h3>
                <p className="text-grey-500 text-sm max-w-md mx-auto">
                  Take photos regularly to visually track your progress.
                  Front, side, and back photos work best.
                </p>
              </div>
            )}
            <p className="mt-6 text-center text-sm text-grey-500">
              Pro tip: Take photos in the same lighting and pose for best comparison
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Add Measurement Modal */}
        {showAddModal && (
          <MeasurementModal
            newMeasurement={newMeasurement}
            setNewMeasurement={setNewMeasurement}
            onSave={saveMeasurement}
            onClose={() => setShowAddModal(false)}
            saving={saving}
          />
        )}

        {/* Photo Upload Modal */}
        {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Upload Progress Photo</h3>
                <button onClick={() => setShowPhotoModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Photo Type</label>
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value)}
                    className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="front">Front</option>
                    <option value="side">Side</option>
                    <option value="back">Back</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Choose Photo</label>
                  <div className="border-2 border-dashed border-grey-300 p-8 text-center hover:border-blue-500 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {uploadingPhoto ? (
                        <div>
                          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                          <p className="text-grey-600 text-sm">Uploading...</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-grey-400 mb-3" />
                          <p className="text-grey-600 text-sm">Click to select a photo</p>
                          <p className="text-grey-400 text-xs mt-1">JPG, PNG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => setShowPhotoModal(false)} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
      </>
      )}
    </div>
  );
}

// Measurement Modal Component
function MeasurementModal({
  newMeasurement,
  setNewMeasurement,
  onSave,
  onClose,
  saving,
}: {
  newMeasurement: {
    weight: string;
    bodyFatPercentage: string;
    chest: string;
    waist: string;
    hips: string;
    thigh: string;
    bicep: string;
    notes: string;
    skeletalMuscleMass: string;
    bodyFatMass: string;
    totalBodyWater: string;
    leanBodyMass: string;
    bmi: string;
    basalMetabolicRate: string;
    visceralFatLevel: string;
  };
  setNewMeasurement: React.Dispatch<React.SetStateAction<{
    weight: string;
    bodyFatPercentage: string;
    chest: string;
    waist: string;
    hips: string;
    thigh: string;
    bicep: string;
    notes: string;
    skeletalMuscleMass: string;
    bodyFatMass: string;
    totalBodyWater: string;
    leanBodyMass: string;
    bmi: string;
    basalMetabolicRate: string;
    visceralFatLevel: string;
  }>>;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [showInBody, setShowInBody] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black">Log Measurement</h3>
            <button
              onClick={onClose}
              className="text-grey-400 hover:text-black"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                  placeholder="e.g., 180.5"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Body Fat %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.bodyFatPercentage}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFatPercentage: e.target.value })}
                  placeholder="e.g., 18"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Chest (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.chest}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                  placeholder="e.g., 42"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Waist (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.waist}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                  placeholder="e.g., 34"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Hips (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.hips}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: e.target.value })}
                  placeholder="e.g., 40"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Thigh (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurement.thigh}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, thigh: e.target.value })}
                  placeholder="e.g., 24"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Bicep (inches)
              </label>
              <input
                type="number"
                step="0.1"
                value={newMeasurement.bicep}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, bicep: e.target.value })}
                placeholder="e.g., 15"
                className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* InBody Data Section */}
            <div className="border-t border-grey-200 pt-4 mt-4">
              <button
                type="button"
                onClick={() => setShowInBody(!showInBody)}
                className="flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                {showInBody ? '− Hide' : '+ Add'} InBody Data
              </button>

              {showInBody && (
                <div className="mt-4 space-y-4 bg-blue-50 p-4 border border-blue-100">
                  <p className="text-xs text-blue-700 mb-3">
                    Enter data from your InBody scan for detailed body composition tracking
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Skeletal Muscle Mass (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement.skeletalMuscleMass}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, skeletalMuscleMass: e.target.value })}
                        placeholder="e.g., 75.5"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Body Fat Mass (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement.bodyFatMass}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFatMass: e.target.value })}
                        placeholder="e.g., 35.2"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Total Body Water (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement.totalBodyWater}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, totalBodyWater: e.target.value })}
                        placeholder="e.g., 95.0"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Lean Body Mass (lbs)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement.leanBodyMass}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, leanBodyMass: e.target.value })}
                        placeholder="e.g., 145.0"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        BMI
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newMeasurement.bmi}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, bmi: e.target.value })}
                        placeholder="e.g., 24.5"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        BMR (kcal)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={newMeasurement.basalMetabolicRate}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, basalMetabolicRate: e.target.value })}
                        placeholder="e.g., 1850"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Visceral Fat
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={newMeasurement.visceralFatLevel}
                        onChange={(e) => setNewMeasurement({ ...newMeasurement, visceralFatLevel: e.target.value })}
                        placeholder="e.g., 8"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Notes (optional)
              </label>
              <textarea
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                placeholder="Any notes about this measurement..."
                rows={3}
                className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onSave}
              variant="primary"
              className="flex-1"
              disabled={!newMeasurement.weight || saving}
            >
              {saving ? 'Saving...' : 'Save Measurement'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
