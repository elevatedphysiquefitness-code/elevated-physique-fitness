'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  Scale,
  Target,
  ClipboardCheck,
  MessageSquare,
  X,
  Save,
  Plus,
  Trash2,
  Clock,
  GripVertical,
  Utensils,
  Activity,
  TrendingUp,
  Droplets,
  Moon,
  CheckSquare,
  FileText,
  Star,
  CreditCard,
  Edit,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  role: string;
}

interface ClientDetails {
  fitness_goals: string[] | null;
  fitness_level: string | null;
  available_equipment: string | null;
  workout_days_per_week: number | null;
  injuries: string[] | null;
  onboarding_completed: boolean;
}

interface ClientProgram {
  id: string;
  program_name: string;
  current_week: number;
  total_weeks: number;
  status: string;
  start_date: string;
  program_id: string;
}

interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

interface CustomExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

interface AssignedWorkout {
  id: string;
  workout_date: string;
  status: string;
  template: {
    id: string;
    name: string;
    focus: string;
  } | null;
}

interface Measurement {
  measurement_date: string;
  weight: number | null;
  body_fat_percentage: number | null;
}

interface FoodLog {
  id: string;
  log_date: string;
  food_name: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
}

interface WorkoutLog {
  id: string;
  workout_date: string;
  exercise_id: string;
  exercise_name?: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  is_pr: boolean;
}

interface WaterLog {
  log_date: string;
  total_oz: number;
}

interface SleepLog {
  log_date: string;
  hours_slept: number;
  sleep_quality: number;
}

interface HabitLog {
  log_date: string;
  habit_name: string;
  completed: boolean;
}

interface CheckIn {
  id: string;
  submitted_at: string;
  energy_level: number | null;
  stress_level: number | null;
  sleep_quality: number | null;
  notes: string | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  plan_name: string;
  billing_interval: string;
  status: string;
  start_date: string;
  next_billing_date: string | null;
  price: number | null;
  payment_method: string | null;
  notes: string | null;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  title: string;
  focus: string | null;
}

interface WeeklySchedule {
  sunday: string | null;
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
}

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [programs, setPrograms] = useState<ClientProgram[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [allPrograms, setAllPrograms] = useState<WorkoutProgram[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Custom workout builder state
  const [showCustomWorkoutModal, setShowCustomWorkoutModal] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>([]);
  const [customWorkout, setCustomWorkout] = useState({
    name: '',
    focus: '',
    durationMinutes: 45,
    workoutDate: new Date().toISOString().split('T')[0],
    exercises: [] as CustomExercise[],
  });
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [foodLogDays, setFoodLogDays] = useState(30);
  const [workoutLogDays, setWorkoutLogDays] = useState(30);
  const [loadingMoreFood, setLoadingMoreFood] = useState(false);
  const [loadingMoreWorkouts, setLoadingMoreWorkouts] = useState(false);

  // Water, Sleep, Habits, Check-ins
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // Workout edit state
  const [editingWorkout, setEditingWorkout] = useState<AssignedWorkout | null>(null);
  const [editWorkoutDate, setEditWorkoutDate] = useState('');
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Weekly schedule editor state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<WorkoutTemplate[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  });
  const [scheduleStartDate, setScheduleStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleWeeks, setScheduleWeeks] = useState(4);

  // Subscription management
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_type: 'online',
    plan_name: '',
    billing_interval: 'monthly',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    next_billing_date: '',
    price: '',
    payment_method: 'external',
    notes: '',
  });

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchFoodLogs = async (supabase: any, clientId: string, days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const { data: foodData } = await supabase
      .from('food_logs')
      .select('*')
      .eq('client_id', clientId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false })
      .order('logged_at', { ascending: false });
    if (foodData) {
      setFoodLogs(foodData);
      setFoodLogDays(days);
    }
  };

  const fetchWorkoutLogs = async (supabase: any, clientId: string, days: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const { data: workoutLogData } = await supabase
      .from('workout_logs')
      .select(`
        id,
        workout_date,
        exercise_id,
        set_number,
        weight,
        reps,
        rpe,
        is_pr,
        exercises (name)
      `)
      .eq('client_id', clientId)
      .gte('workout_date', startDate.toISOString().split('T')[0])
      .order('workout_date', { ascending: false })
      .order('set_number', { ascending: true });
    if (workoutLogData) {
      setWorkoutLogs(workoutLogData.map((log: any) => ({
        ...log,
        exercise_name: log.exercises?.name || 'Unknown Exercise',
      })));
      setWorkoutLogDays(days);
    }
  };

  const loadMoreFoodLogs = async () => {
    setLoadingMoreFood(true);
    const supabase = createClient();
    const newDays = foodLogDays + 30;
    await fetchFoodLogs(supabase, clientId, newDays);
    setLoadingMoreFood(false);
  };

  const loadMoreWorkoutLogs = async () => {
    setLoadingMoreWorkouts(true);
    const supabase = createClient();
    const newDays = workoutLogDays + 30;
    await fetchWorkoutLogs(supabase, clientId, newDays);
    setLoadingMoreWorkouts(false);
  };

  const loadAllFoodLogs = async () => {
    setLoadingMoreFood(true);
    const supabase = createClient();
    const { data: foodData } = await supabase
      .from('food_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('log_date', { ascending: false })
      .order('logged_at', { ascending: false });
    if (foodData) {
      setFoodLogs(foodData);
      setFoodLogDays(9999);
    }
    setLoadingMoreFood(false);
  };

  const loadAllWorkoutLogs = async () => {
    setLoadingMoreWorkouts(true);
    const supabase = createClient();
    const { data: workoutLogData } = await supabase
      .from('workout_logs')
      .select(`
        id,
        workout_date,
        exercise_id,
        set_number,
        weight,
        reps,
        rpe,
        is_pr,
        exercises (name)
      `)
      .eq('client_id', clientId)
      .order('workout_date', { ascending: false })
      .order('set_number', { ascending: true });
    if (workoutLogData) {
      setWorkoutLogs(workoutLogData.map((log: any) => ({
        ...log,
        exercise_name: log.exercises?.name || 'Unknown Exercise',
      })));
      setWorkoutLogDays(9999);
    }
    setLoadingMoreWorkouts(false);
  };

  const fetchClientData = async () => {
    const supabase = createClient();

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();
    if (profileData) setProfile(profileData);

    // Fetch client details
    const { data: detailsData } = await supabase
      .from('client_details')
      .select('*')
      .eq('user_id', clientId)
      .single();
    if (detailsData) setDetails(detailsData);

    // Fetch assigned programs
    const { data: programData } = await supabase
      .from('client_programs')
      .select('*')
      .eq('client_id', clientId)
      .order('assigned_at', { ascending: false });
    if (programData) setPrograms(programData);

    // Fetch recent measurements
    const { data: measurementData } = await supabase
      .from('measurements')
      .select('measurement_date, weight, body_fat_percentage')
      .eq('client_id', clientId)
      .order('measurement_date', { ascending: false })
      .limit(5);
    if (measurementData) setMeasurements(measurementData);

    // Fetch all available programs for assignment
    const { data: allProgramData } = await supabase
      .from('workout_programs')
      .select('id, title, description, duration_weeks')
      .order('title');
    if (allProgramData) setAllPrograms(allProgramData);

    // Fetch all exercises for custom workout builder
    const { data: exerciseData } = await supabase
      .from('exercises')
      .select('id, name, muscle_group')
      .order('name');
    if (exerciseData) setAllExercises(exerciseData);

    // Fetch assigned workouts for this client
    const { data: assignedData } = await supabase
      .from('assigned_workouts')
      .select(`
        id,
        workout_date,
        status,
        template:workout_templates (id, title, name, focus)
      `)
      .eq('client_id', clientId)
      .gte('workout_date', new Date().toISOString().split('T')[0])
      .order('workout_date', { ascending: true })
      .limit(14);
    if (assignedData) {
      setAssignedWorkouts(assignedData.map((w: any) => {
        const t = w.template?.[0] || null;
        return {
          ...w,
          template: t ? { ...t, name: t.name || t.title } : null
        };
      }));
    }

    // Fetch food logs (last 30 days by default)
    await fetchFoodLogs(supabase, clientId, 30);

    // Fetch workout logs (last 30 days by default)
    await fetchWorkoutLogs(supabase, clientId, 30);

    // Fetch water logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: waterData } = await supabase
      .from('water_logs')
      .select('log_date, amount_oz')
      .eq('client_id', clientId)
      .gte('log_date', startDateStr)
      .order('log_date', { ascending: false });

    if (waterData) {
      // Group by date and sum
      const waterByDate: Record<string, number> = {};
      waterData.forEach((log: any) => {
        waterByDate[log.log_date] = (waterByDate[log.log_date] || 0) + (log.amount_oz || 0);
      });
      setWaterLogs(Object.entries(waterByDate).map(([log_date, total_oz]) => ({
        log_date,
        total_oz,
      })).sort((a, b) => b.log_date.localeCompare(a.log_date)));
    }

    // Fetch sleep logs (last 30 days)
    const { data: sleepData } = await supabase
      .from('sleep_logs')
      .select('log_date, hours_slept, sleep_quality')
      .eq('client_id', clientId)
      .gte('log_date', startDateStr)
      .order('log_date', { ascending: false });

    if (sleepData) {
      setSleepLogs(sleepData);
    }

    // Fetch habit logs (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const { data: habitData } = await supabase
      .from('habit_logs')
      .select(`
        log_date,
        completed,
        habits (name)
      `)
      .eq('client_id', clientId)
      .gte('log_date', fourteenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (habitData) {
      setHabitLogs(habitData.map((h: any) => ({
        log_date: h.log_date,
        habit_name: h.habits?.name || 'Unknown Habit',
        completed: h.completed,
      })));
    }

    // Fetch check-ins (last 10)
    const { data: checkInData } = await supabase
      .from('check_ins')
      .select('id, submitted_at, energy_level, stress_level, sleep_quality, notes')
      .eq('client_id', clientId)
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (checkInData) {
      setCheckIns(checkInData);
    }

    // Fetch subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subData) {
      setSubscription(subData);
    }

    setLoading(false);
  };

  const assignProgram = async () => {
    if (!selectedProgramId) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const selectedProgram = allPrograms.find(p => p.id === selectedProgramId);

    // Deactivate existing programs
    await supabase
      .from('client_programs')
      .update({ status: 'completed' })
      .eq('client_id', clientId)
      .eq('status', 'active');

    // Assign new program
    const { error } = await supabase
      .from('client_programs')
      .insert({
        client_id: clientId,
        program_id: selectedProgramId,
        program_name: selectedProgram?.title || 'Program',
        start_date: new Date().toISOString().split('T')[0],
        current_week: 1,
        total_weeks: selectedProgram?.duration_weeks || 12,
        status: 'active',
        assigned_by: user?.id,
        assignment_notes: assignmentNotes || null,
        is_custom: false,
      });

    if (error) {
      alert('Failed to assign program. Please try again.');
      console.error('Error assigning program:', error);
    } else {
      // Create assigned_workouts for the first week so they show on calendar
      const { data: templates } = await supabase
        .from('workout_templates')
        .select('id')
        .or(`created_by.eq.${user?.id},created_for_client_id.eq.${clientId}`)
        .limit(selectedProgram?.duration_weeks ? Math.min(7, selectedProgram.duration_weeks) : 5);

      if (templates && templates.length > 0) {
        const startDate = new Date();
        const dayOfWeek = startDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        const nextMonday = new Date(startDate);
        nextMonday.setDate(startDate.getDate() + mondayOffset);

        const assignedWorkouts = templates.map((template, i) => {
          const workoutDate = new Date(nextMonday);
          workoutDate.setDate(nextMonday.getDate() + i);
          return {
            client_id: clientId,
            template_id: template.id,
            workout_date: workoutDate.toISOString().split('T')[0],
            status: 'scheduled',
          };
        });

        await supabase.from('assigned_workouts').insert(assignedWorkouts);
      }

      setShowAssignModal(false);
      setSelectedProgramId('');
      setAssignmentNotes('');
      fetchClientData();
    }

    setSaving(false);
  };

  const addExerciseToWorkout = () => {
    if (!selectedExerciseId) return;
    const exercise = allExercises.find(e => e.id === selectedExerciseId);
    if (!exercise) return;

    setCustomWorkout(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: 3,
          reps: '10',
          restSeconds: 60,
          notes: '',
        },
      ],
    }));
    setSelectedExerciseId('');
  };

  const removeExerciseFromWorkout = (index: number) => {
    setCustomWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (index: number, field: keyof CustomExercise, value: any) => {
    setCustomWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const createCustomWorkout = async () => {
    if (!customWorkout.name.trim() || customWorkout.exercises.length === 0) {
      alert('Please provide a workout name and add at least one exercise.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    const supabase = createClient();

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Auth error:', userError);
        alert('Authentication error. Please log in again.');
        setSaving(false);
        return;
      }

      console.log('Creating workout template for client:', clientId);
      console.log('User ID:', user.id);

      // Create the workout template
      const templateData = {
        title: customWorkout.name,
        name: customWorkout.name,
        description: `Custom workout for client`,
        focus: customWorkout.focus || 'Full Body',
        duration_minutes: customWorkout.durationMinutes,
        created_by: user.id,
        created_for_client_id: clientId,
        is_custom: true,
      };

      console.log('Template data:', templateData);

      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert(templateData)
        .select()
        .single();

      if (templateError) {
        console.error('Template creation error:', templateError);
        console.error('Error code:', templateError.code);
        console.error('Error message:', templateError.message);
        console.error('Error details:', templateError.details);
        alert(`Failed to create workout template: ${templateError.message}`);
        setSaving(false);
        return;
      }

      if (!template) {
        console.error('No template returned');
        alert('Failed to create workout template: No data returned');
        setSaving(false);
        return;
      }

      console.log('Template created:', template.id);

      // Add exercises to the template
      if (customWorkout.exercises.length > 0) {
        const exerciseInserts = customWorkout.exercises.map((ex, index) => ({
          template_id: template.id,
          exercise_id: ex.exerciseId,
          order_index: index,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds,
          notes: ex.notes || null,
        }));

        console.log('Inserting exercises:', exerciseInserts);

        const { error: exerciseError } = await supabase
          .from('workout_template_exercises')
          .insert(exerciseInserts);

        if (exerciseError) {
          console.error('Exercise insert error:', exerciseError);
          // Don't return - template was created, just log the error
        }
      }

      // Assign the workout to the client's calendar
      const assignData = {
        client_id: clientId,
        template_id: template.id,
        workout_date: customWorkout.workoutDate,
        status: 'scheduled',
      };

      console.log('Assigning workout:', assignData);

      const { error: assignError } = await supabase
        .from('assigned_workouts')
        .insert(assignData);

      if (assignError) {
        console.error('Assign error:', assignError);
        alert(`Workout created but failed to assign to calendar: ${assignError.message}`);
      } else {
        console.log('Workout created and assigned successfully!');
        alert('Custom workout created and assigned!');
        setShowCustomWorkoutModal(false);
        setCustomWorkout({
          name: '',
          focus: '',
          durationMinutes: 45,
          workoutDate: new Date().toISOString().split('T')[0],
          exercises: [],
        });
        fetchClientData();
      }
    } catch (err) {
      console.error('Unexpected error creating workout:', err);
      alert('An unexpected error occurred. Check the console for details.');
    }

    setSaving(false);
  };

  const openEditWorkoutModal = (workout: AssignedWorkout) => {
    setEditingWorkout(workout);
    setEditWorkoutDate(workout.workout_date);
    setShowEditWorkoutModal(true);
  };

  const updateWorkoutDate = async () => {
    if (!editingWorkout || !editWorkoutDate) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('assigned_workouts')
      .update({ workout_date: editWorkoutDate })
      .eq('id', editingWorkout.id);

    if (error) {
      console.error('Error updating workout date:', error);
      alert('Failed to update workout date');
    } else {
      setShowEditWorkoutModal(false);
      setEditingWorkout(null);
      fetchClientData();
      alert('Workout date updated!');
    }

    setSaving(false);
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('assigned_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    } else {
      setAssignedWorkouts(assignedWorkouts.filter(w => w.id !== workoutId));
      alert('Workout deleted!');
    }
  };

  const toggleWorkoutSelection = (workoutId: string) => {
    const newSelected = new Set(selectedWorkoutIds);
    if (newSelected.has(workoutId)) {
      newSelected.delete(workoutId);
    } else {
      newSelected.add(workoutId);
    }
    setSelectedWorkoutIds(newSelected);
  };

  const selectAllWorkouts = () => {
    if (selectedWorkoutIds.size === assignedWorkouts.length) {
      setSelectedWorkoutIds(new Set());
    } else {
      setSelectedWorkoutIds(new Set(assignedWorkouts.map(w => w.id)));
    }
  };

  const deleteSelectedWorkouts = async () => {
    if (selectedWorkoutIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedWorkoutIds.size} workout(s)?`)) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('assigned_workouts')
      .delete()
      .in('id', Array.from(selectedWorkoutIds));

    if (error) {
      console.error('Error deleting workouts:', error);
      alert('Failed to delete some workouts');
    } else {
      setAssignedWorkouts(assignedWorkouts.filter(w => !selectedWorkoutIds.has(w.id)));
      setSelectedWorkoutIds(new Set());
      setSelectMode(false);
      alert(`${selectedWorkoutIds.size} workout(s) deleted!`);
    }

    setSaving(false);
  };

  const cancelSelectMode = () => {
    setSelectMode(false);
    setSelectedWorkoutIds(new Set());
  };

  const openScheduleModal = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all workout templates (both global and client-specific)
    const { data: templates } = await supabase
      .from('workout_templates')
      .select('id, name, title, focus')
      .or(`created_by.eq.${user?.id},created_for_client_id.eq.${clientId},created_for_client_id.is.null`)
      .order('name');

    if (templates) {
      setAvailableTemplates(templates.map(t => ({
        ...t,
        name: t.name || t.title || 'Unnamed Workout',
      })));
    }

    // Reset schedule
    setWeeklySchedule({
      sunday: null,
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
    });
    setScheduleStartDate(new Date().toISOString().split('T')[0]);
    setScheduleWeeks(4);
    setShowScheduleModal(true);
  };

  const generateSchedule = async () => {
    // Check if at least one day has a workout
    const hasWorkouts = Object.values(weeklySchedule).some(v => v !== null);
    if (!hasWorkouts) {
      alert('Please assign at least one workout to a day of the week.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Generate workouts for the specified number of weeks
    const workoutsToInsert: { client_id: string; template_id: string; workout_date: string; status: string }[] = [];
    const startDate = new Date(scheduleStartDate + 'T00:00:00');

    for (let week = 0; week < scheduleWeeks; week++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayName = dayNames[dayIndex];
        const templateId = weeklySchedule[dayName];

        if (templateId) {
          const workoutDate = new Date(startDate);
          // Calculate days to add: (week * 7) + days until target day
          const currentDay = startDate.getDay();
          let daysToAdd = dayIndex - currentDay;
          if (daysToAdd < 0) daysToAdd += 7;
          daysToAdd += week * 7;
          workoutDate.setDate(startDate.getDate() + daysToAdd);

          workoutsToInsert.push({
            client_id: clientId,
            template_id: templateId,
            workout_date: workoutDate.toISOString().split('T')[0],
            status: 'scheduled',
          });
        }
      }
    }

    // Remove duplicates (same client, same template, same date)
    const uniqueWorkouts = workoutsToInsert.filter((workout, index, self) =>
      index === self.findIndex(w =>
        w.client_id === workout.client_id &&
        w.template_id === workout.template_id &&
        w.workout_date === workout.workout_date
      )
    );

    // Insert workouts
    const { error } = await supabase
      .from('assigned_workouts')
      .insert(uniqueWorkouts);

    if (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Some workouts may already exist for those dates.');
    } else {
      setShowScheduleModal(false);
      fetchClientData();
      alert(`Schedule generated! ${uniqueWorkouts.length} workouts added for ${scheduleWeeks} weeks.`);
    }

    setSaving(false);
  };

  const openSubscriptionModal = (isEdit: boolean = false) => {
    if (isEdit && subscription) {
      setSubscriptionForm({
        plan_type: subscription.plan_type || 'online',
        plan_name: subscription.plan_name || '',
        billing_interval: subscription.billing_interval || 'monthly',
        status: subscription.status || 'active',
        start_date: subscription.start_date || new Date().toISOString().split('T')[0],
        next_billing_date: subscription.next_billing_date || '',
        price: subscription.price?.toString() || '',
        payment_method: subscription.payment_method || 'external',
        notes: subscription.notes || '',
      });
    } else {
      setSubscriptionForm({
        plan_type: 'online',
        plan_name: '',
        billing_interval: 'monthly',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        next_billing_date: '',
        price: '',
        payment_method: 'external',
        notes: '',
      });
    }
    setShowSubscriptionModal(true);
  };

  const saveSubscription = async () => {
    if (!subscriptionForm.plan_name) {
      alert('Please enter a plan name');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Calculate next billing date if not provided
    let nextBillingDate = subscriptionForm.next_billing_date;
    if (!nextBillingDate && subscriptionForm.start_date) {
      const startDate = new Date(subscriptionForm.start_date);
      if (subscriptionForm.billing_interval === 'weekly') {
        startDate.setDate(startDate.getDate() + 7);
      } else if (subscriptionForm.billing_interval === 'biweekly') {
        startDate.setDate(startDate.getDate() + 14);
      } else {
        startDate.setMonth(startDate.getMonth() + 1);
      }
      nextBillingDate = startDate.toISOString().split('T')[0];
    }

    const subscriptionData = {
      user_id: clientId,
      plan_type: subscriptionForm.plan_type,
      plan_name: subscriptionForm.plan_name,
      billing_interval: subscriptionForm.billing_interval,
      status: subscriptionForm.status,
      start_date: subscriptionForm.start_date,
      next_billing_date: nextBillingDate || null,
      price: subscriptionForm.price ? parseFloat(subscriptionForm.price) : null,
      payment_method: subscriptionForm.payment_method,
      notes: subscriptionForm.notes || null,
    };

    let error;
    if (subscription) {
      // Update existing
      const result = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', subscription.id);
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('subscriptions')
        .insert(subscriptionData);
      error = result.error;
    }

    if (error) {
      console.error('Error saving subscription:', error);
      alert('Failed to save subscription. Please try again.');
    } else {
      // Also update user role to client
      await supabase
        .from('profiles')
        .update({ role: 'client' })
        .eq('id', clientId);

      setShowSubscriptionModal(false);
      fetchClientData();
      alert('Subscription saved successfully!');
    }

    setSaving(false);
  };

  const cancelSubscription = async () => {
    if (!subscription) return;
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id);

    if (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription.');
    } else {
      fetchClientData();
      alert('Subscription cancelled.');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-grey-500">Client not found</p>
        <Button href="/admin/clients" variant="outline" className="mt-4">Back to Clients</Button>
      </div>
    );
  }

  const activeProgram = programs.find(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-grey-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-grey-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black">{profile.full_name || 'Client'}</h1>
          <p className="text-grey-600">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/messages?client=${clientId}`}>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </Link>
          <Button onClick={() => setShowCustomWorkoutModal(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </Button>
          <Button onClick={() => setShowAssignModal(true)} variant="primary">
            <Dumbbell className="h-4 w-4 mr-2" />
            Assign Program
          </Button>
        </div>
      </div>

      {/* Subscription Status Banner */}
      <div className={`p-4 flex items-center justify-between ${
        subscription?.status === 'active'
          ? 'bg-green-50 border border-green-200'
          : subscription
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-grey-50 border border-grey-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
            subscription?.status === 'active'
              ? 'bg-green-100'
              : subscription
              ? 'bg-yellow-100'
              : 'bg-grey-100'
          }`}>
            <CreditCard className={`h-5 w-5 ${
              subscription?.status === 'active'
                ? 'text-green-600'
                : subscription
                ? 'text-yellow-600'
                : 'text-grey-400'
            }`} />
          </div>
          <div>
            {subscription ? (
              <>
                <p className="font-semibold text-black">{subscription.plan_name}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : subscription.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                  <span className="text-grey-500">•</span>
                  <span className="text-grey-600 capitalize">{subscription.billing_interval}</span>
                  {subscription.price && (
                    <>
                      <span className="text-grey-500">•</span>
                      <span className="text-grey-600">${subscription.price}</span>
                    </>
                  )}
                  {subscription.payment_method && subscription.payment_method !== 'stripe' && (
                    <>
                      <span className="text-grey-500">•</span>
                      <span className="text-grey-500 capitalize">{subscription.payment_method}</span>
                    </>
                  )}
                </div>
                {subscription.next_billing_date && (
                  <p className="text-xs text-grey-500 mt-1">
                    Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-grey-600">No Active Subscription</p>
                <p className="text-sm text-grey-500">Add a subscription for this client</p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {subscription ? (
            <>
              <Button onClick={() => openSubscriptionModal(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              {subscription.status === 'active' && (
                <Button onClick={cancelSubscription} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <Button onClick={() => openSubscriptionModal(false)} variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Subscription
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Client Info
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-grey-500">Email</p>
              <p className="text-sm text-black">{profile.email}</p>
            </div>
            {profile.phone && (
              <div>
                <p className="text-xs text-grey-500">Phone</p>
                <p className="text-sm text-black">{profile.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-grey-500">Joined</p>
              <p className="text-sm text-black">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
            {details && (
              <>
                {details.fitness_level && (
                  <div>
                    <p className="text-xs text-grey-500">Fitness Level</p>
                    <p className="text-sm text-black capitalize">{details.fitness_level}</p>
                  </div>
                )}
                {details.fitness_goals && details.fitness_goals.length > 0 && (
                  <div>
                    <p className="text-xs text-grey-500">Goals</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {details.fitness_goals.map(g => (
                        <span key={g} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5">{g.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
                {details.available_equipment && (
                  <div>
                    <p className="text-xs text-grey-500">Equipment</p>
                    <p className="text-sm text-black capitalize">{details.available_equipment.replace('_', ' ')}</p>
                  </div>
                )}
                {details.injuries && details.injuries.length > 0 && (
                  <div>
                    <p className="text-xs text-grey-500">Injuries / Conditions</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {details.injuries.map(i => (
                        <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5">{i.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Program */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Current Program
            </h2>
          </CardHeader>
          <CardContent>
            {activeProgram ? (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-black">{activeProgram.program_name}</p>
                  <p className="text-sm text-grey-500">
                    Week {activeProgram.current_week} of {activeProgram.total_weeks}
                  </p>
                </div>
                <div className="h-2 bg-grey-200">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(activeProgram.current_week / activeProgram.total_weeks) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-grey-600">
                  Started: {new Date(activeProgram.start_date).toLocaleDateString()}
                </div>
                <Button onClick={() => setShowAssignModal(true)} variant="outline" className="w-full">
                  Change Program
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm mb-4">No active program</p>
                <Button onClick={() => setShowAssignModal(true)} variant="primary" className="w-full">
                  Assign Program
                </Button>
              </div>
            )}

            {programs.length > 1 && (
              <div className="mt-6 pt-4 border-t border-grey-200">
                <p className="text-xs text-grey-500 mb-2">Previous Programs</p>
                {programs.filter(p => p.status !== 'active').slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between text-sm py-1">
                    <span className="text-grey-600">{p.program_name}</span>
                    <span className="text-grey-400 capitalize">{p.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Measurements */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              Recent Measurements
            </h2>
          </CardHeader>
          <CardContent>
            {measurements.length > 0 ? (
              <div className="space-y-3">
                {measurements.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-grey-50">
                    <div>
                      <p className="text-sm text-grey-500">
                        {new Date(m.measurement_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {m.weight && <p className="font-semibold text-black">{m.weight} lbs</p>}
                      {m.body_fat_percentage && (
                        <p className="text-xs text-grey-500">{m.body_fat_percentage}% BF</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Scale className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No measurements logged yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Workouts */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-black flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Workouts
              {assignedWorkouts.length > 0 && (
                <span className="text-sm font-normal text-grey-500">({assignedWorkouts.length})</span>
              )}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {selectMode ? (
                <>
                  <Button onClick={selectAllWorkouts} variant="outline" size="sm">
                    {selectedWorkoutIds.size === assignedWorkouts.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={deleteSelectedWorkouts}
                    variant="outline"
                    size="sm"
                    disabled={selectedWorkoutIds.size === 0 || saving}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedWorkoutIds.size})
                  </Button>
                  <Button onClick={cancelSelectMode} variant="outline" size="sm">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {assignedWorkouts.length > 0 && (
                    <Button onClick={() => setSelectMode(true)} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Mass Delete
                    </Button>
                  )}
                  <Button onClick={openScheduleModal} variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule Program
                  </Button>
                  <Button onClick={() => setShowCustomWorkoutModal(true)} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Workout
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assignedWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={selectMode ? () => toggleWorkoutSelection(workout.id) : undefined}
                  className={`p-4 border transition-colors ${
                    selectMode ? 'cursor-pointer' : ''
                  } ${
                    selectedWorkoutIds.has(workout.id)
                      ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                      : workout.status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : 'border-grey-200 bg-grey-50'
                  } ${selectMode && !selectedWorkoutIds.has(workout.id) ? 'hover:border-red-300' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {selectMode && (
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={selectedWorkoutIds.has(workout.id)}
                            onChange={() => toggleWorkoutSelection(workout.id)}
                            className="w-4 h-4 rounded border-grey-300 text-red-600 focus:ring-red-500"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-grey-500">
                          {new Date(workout.workout_date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="font-medium text-black mt-1">
                          {workout.template?.name || 'Workout'}
                        </p>
                        {workout.template?.focus && (
                          <p className="text-xs text-grey-500">{workout.template.focus}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 ${
                          workout.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : workout.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-grey-100 text-grey-600'
                        }`}
                      >
                        {workout.status}
                      </span>
                      {!selectMode && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditWorkoutModal(workout)}
                            className="p-1.5 text-grey-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Change Date"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteWorkout(workout.id)}
                            className="p-1.5 text-grey-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 mx-auto text-grey-300 mb-3" />
              <p className="text-grey-500 text-sm mb-4">No upcoming workouts scheduled</p>
              <Button onClick={() => setShowCustomWorkoutModal(true)} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Workout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Logs & Workout Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Food Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-600" />
                Food Logs {foodLogDays < 9999 ? `(Last ${foodLogDays} Days)` : '(All Time)'}
              </h2>
              <span className="text-xs text-grey-500">{foodLogs.length} entries</span>
            </div>
          </CardHeader>
          <CardContent>
            {foodLogs.length > 0 ? (
              <div className="space-y-4">
                {/* Daily Summaries */}
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                  {(() => {
                    const dailyTotals: Record<string, { calories: number; protein: number; carbs: number; fat: number; items: FoodLog[] }> = {};
                    foodLogs.forEach(log => {
                      if (!dailyTotals[log.log_date]) {
                        dailyTotals[log.log_date] = { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] };
                      }
                      dailyTotals[log.log_date].calories += log.calories;
                      dailyTotals[log.log_date].protein += log.protein;
                      dailyTotals[log.log_date].carbs += log.carbs;
                      dailyTotals[log.log_date].fat += log.fat;
                      dailyTotals[log.log_date].items.push(log);
                    });
                    return Object.entries(dailyTotals)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, totals]) => (
                        <div key={date} className="border border-grey-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-black">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <span className="text-sm font-semibold text-green-600">{Math.round(totals.calories)} cal</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-grey-600 mb-3">
                            <span className="bg-blue-50 px-2 py-1 text-center">P: {Math.round(totals.protein)}g</span>
                            <span className="bg-yellow-50 px-2 py-1 text-center">C: {Math.round(totals.carbs)}g</span>
                            <span className="bg-red-50 px-2 py-1 text-center">F: {Math.round(totals.fat)}g</span>
                          </div>
                          <div className="space-y-1">
                            {totals.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-grey-500">
                                <span className="truncate flex-1">{item.food_name}</span>
                                <span className="ml-2">{item.calories} cal</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
                {/* Load More Buttons */}
                {foodLogDays < 9999 && (
                  <div className="flex gap-2 pt-2 border-t border-grey-200">
                    <button
                      onClick={loadMoreFoodLogs}
                      disabled={loadingMoreFood}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-800 py-2 border border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {loadingMoreFood ? 'Loading...' : 'Load 30 More Days'}
                    </button>
                    <button
                      onClick={loadAllFoodLogs}
                      disabled={loadingMoreFood}
                      className="flex-1 text-sm text-grey-600 hover:text-grey-800 py-2 border border-grey-200 hover:bg-grey-50 disabled:opacity-50"
                    >
                      {loadingMoreFood ? 'Loading...' : 'Load All'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Utensils className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No food logs recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Workout Logs {workoutLogDays < 9999 ? `(Last ${workoutLogDays} Days)` : '(All Time)'}
              </h2>
              <span className="text-xs text-grey-500">{workoutLogs.length} sets logged</span>
            </div>
          </CardHeader>
          <CardContent>
            {workoutLogs.length > 0 ? (
              <div className="space-y-4">
                {/* Group by date and exercise */}
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                  {(() => {
                    const groupedByDate: Record<string, Record<string, WorkoutLog[]>> = {};
                    workoutLogs.forEach(log => {
                      if (!groupedByDate[log.workout_date]) {
                        groupedByDate[log.workout_date] = {};
                      }
                      const exerciseKey = log.exercise_name || log.exercise_id;
                      if (!groupedByDate[log.workout_date][exerciseKey]) {
                        groupedByDate[log.workout_date][exerciseKey] = [];
                      }
                      groupedByDate[log.workout_date][exerciseKey].push(log);
                    });
                    return Object.entries(groupedByDate)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, exercises]) => (
                        <div key={date} className="border border-grey-200 p-4">
                          <p className="font-medium text-black mb-3">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <div className="space-y-3">
                            {Object.entries(exercises).map(([exerciseName, sets]) => (
                              <div key={exerciseName} className="bg-grey-50 p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-black">{exerciseName}</span>
                                  {sets.some(s => s.is_pr) && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" /> PR
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {sets.map((set, i) => (
                                    <span key={i} className="text-xs bg-white border border-grey-200 px-2 py-0.5">
                                      {set.weight ? `${set.weight}lb` : ''} × {set.reps || '-'}
                                      {set.rpe ? ` @${set.rpe}` : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
                {/* Load More Buttons */}
                {workoutLogDays < 9999 && (
                  <div className="flex gap-2 pt-2 border-t border-grey-200">
                    <button
                      onClick={loadMoreWorkoutLogs}
                      disabled={loadingMoreWorkouts}
                      className="flex-1 text-sm text-purple-600 hover:text-purple-800 py-2 border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                    >
                      {loadingMoreWorkouts ? 'Loading...' : 'Load 30 More Days'}
                    </button>
                    <button
                      onClick={loadAllWorkoutLogs}
                      disabled={loadingMoreWorkouts}
                      className="flex-1 text-sm text-grey-600 hover:text-grey-800 py-2 border border-grey-200 hover:bg-grey-50 disabled:opacity-50"
                    >
                      {loadingMoreWorkouts ? 'Loading...' : 'Load All'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No workout logs recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Water, Sleep, Habits, Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Water Intake */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                Water Intake (Last 30 Days)
              </h2>
              <span className="text-xs text-grey-500">{waterLogs.length} days logged</span>
            </div>
          </CardHeader>
          <CardContent>
            {waterLogs.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {waterLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm text-grey-700">
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${Math.min((log.total_oz / 64) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-700 min-w-[50px] text-right">
                        {log.total_oz} oz
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Droplets className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No water logs recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-600" />
                Sleep Logs (Last 30 Days)
              </h2>
              <span className="text-xs text-grey-500">{sleepLogs.length} nights logged</span>
            </div>
          </CardHeader>
          <CardContent>
            {sleepLogs.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {sleepLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-indigo-50 rounded">
                    <span className="text-sm text-grey-700">
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-indigo-700">
                        {log.hours_slept}h
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= log.sleep_quality
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-grey-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Moon className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No sleep logs recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Habits & Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Habit Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-orange-600" />
                Habits (Last 14 Days)
              </h2>
              <span className="text-xs text-grey-500">
                {habitLogs.filter(h => h.completed).length} / {habitLogs.length} completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {habitLogs.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(() => {
                  // Group by date
                  const byDate: Record<string, HabitLog[]> = {};
                  habitLogs.forEach(log => {
                    if (!byDate[log.log_date]) byDate[log.log_date] = [];
                    byDate[log.log_date].push(log);
                  });
                  return Object.entries(byDate)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, logs]) => (
                      <div key={date} className="p-3 bg-orange-50 rounded">
                        <p className="text-xs text-grey-500 mb-2">
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {logs.map((log, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded ${
                                log.completed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-grey-100 text-grey-500 line-through'
                              }`}
                            >
                              {log.habit_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No habit logs recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-ins */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-teal-600" />
                Recent Check-ins
              </h2>
              <span className="text-xs text-grey-500">{checkIns.length} check-ins</span>
            </div>
          </CardHeader>
          <CardContent>
            {checkIns.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="p-3 bg-teal-50 rounded">
                    <p className="text-xs text-grey-500 mb-2">
                      {new Date(checkIn.submitted_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      {checkIn.energy_level !== null && (
                        <div className="text-center">
                          <p className="text-grey-500">Energy</p>
                          <p className="font-semibold text-teal-700">{checkIn.energy_level}/10</p>
                        </div>
                      )}
                      {checkIn.stress_level !== null && (
                        <div className="text-center">
                          <p className="text-grey-500">Stress</p>
                          <p className="font-semibold text-teal-700">{checkIn.stress_level}/10</p>
                        </div>
                      )}
                      {checkIn.sleep_quality !== null && (
                        <div className="text-center">
                          <p className="text-grey-500">Sleep</p>
                          <p className="font-semibold text-teal-700">{checkIn.sleep_quality}/10</p>
                        </div>
                      )}
                    </div>
                    {checkIn.notes && (
                      <p className="text-xs text-grey-600 italic border-t border-teal-100 pt-2 mt-2">
                        &quot;{checkIn.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardCheck className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No check-ins submitted yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Workout Modal */}
      {showCustomWorkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Create Custom Workout</h3>
                <button onClick={() => setShowCustomWorkoutModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Workout Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Workout Name *
                    </label>
                    <input
                      type="text"
                      value={customWorkout.name}
                      onChange={(e) => setCustomWorkout({ ...customWorkout, name: e.target.value })}
                      placeholder="e.g., Upper Body Push Day"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Focus Area
                    </label>
                    <select
                      value={customWorkout.focus}
                      onChange={(e) => setCustomWorkout({ ...customWorkout, focus: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Select focus...</option>
                      <option value="Upper Body">Upper Body</option>
                      <option value="Lower Body">Lower Body</option>
                      <option value="Full Body">Full Body</option>
                      <option value="Push">Push</option>
                      <option value="Pull">Pull</option>
                      <option value="Legs">Legs</option>
                      <option value="Core">Core</option>
                      <option value="Cardio">Cardio</option>
                      <option value="HIIT">HIIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={customWorkout.durationMinutes}
                      onChange={(e) => setCustomWorkout({ ...customWorkout, durationMinutes: parseInt(e.target.value) || 45 })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={customWorkout.workoutDate}
                      onChange={(e) => setCustomWorkout({ ...customWorkout, workoutDate: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Add Exercise */}
                <div className="border-t border-grey-200 pt-6">
                  <h4 className="font-semibold text-black mb-4">Exercises</h4>
                  <div className="flex gap-2 mb-4">
                    <select
                      value={selectedExerciseId}
                      onChange={(e) => setSelectedExerciseId(e.target.value)}
                      className="flex-1 border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Select exercise to add...</option>
                      {allExercises.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.muscle_group || 'General'})
                        </option>
                      ))}
                    </select>
                    <Button onClick={addExerciseToWorkout} variant="outline" disabled={!selectedExerciseId}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Exercise List */}
                  {customWorkout.exercises.length > 0 ? (
                    <div className="space-y-3">
                      {customWorkout.exercises.map((ex, index) => (
                        <div key={index} className="border border-grey-200 p-4 bg-grey-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <span className="font-medium text-black">{ex.exerciseName}</span>
                            </div>
                            <button
                              onClick={() => removeExerciseFromWorkout(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-grey-500 mb-1">Sets</label>
                              <input
                                type="number"
                                value={ex.sets}
                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 3)}
                                className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-grey-500 mb-1">Reps</label>
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                                placeholder="10 or 8-12"
                                className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-grey-500 mb-1">Rest (sec)</label>
                              <input
                                type="number"
                                value={ex.restSeconds}
                                onChange={(e) => updateExercise(index, 'restSeconds', parseInt(e.target.value) || 60)}
                                className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs text-grey-500 mb-1">Notes (optional)</label>
                            <input
                              type="text"
                              value={ex.notes}
                              onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                              placeholder="e.g., Tempo 3-1-3, RPE 8"
                              className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-grey-50 border border-dashed border-grey-300">
                      <Dumbbell className="h-8 w-8 mx-auto text-grey-300 mb-2" />
                      <p className="text-grey-500 text-sm">No exercises added yet</p>
                      <p className="text-grey-400 text-xs">Select an exercise above to get started</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowCustomWorkoutModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={createCustomWorkout}
                  variant="primary"
                  className="flex-1"
                  disabled={saving || !customWorkout.name || customWorkout.exercises.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Creating...' : 'Create & Assign Workout'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Program Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Assign Program</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Select Program *
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="">Choose a program...</option>
                    {allPrograms.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.duration_weeks} weeks)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProgramId && (
                  <div className="bg-blue-50 p-3 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      {allPrograms.find(p => p.id === selectedProgramId)?.description || 'No description'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Assignment Notes (optional)
                  </label>
                  <textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    rows={3}
                    placeholder="Notes about this assignment..."
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                {activeProgram && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3">
                    <p className="text-sm text-yellow-800">
                      This will replace the current program: <strong>{activeProgram.program_name}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowAssignModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={assignProgram}
                  variant="primary"
                  className="flex-1"
                  disabled={saving || !selectedProgramId}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Assigning...' : 'Assign Program'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">
                  {subscription ? 'Edit Subscription' : 'Add Subscription'}
                </h3>
                <button onClick={() => setShowSubscriptionModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Plan Type *
                  </label>
                  <select
                    value={subscriptionForm.plan_type}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan_type: e.target.value })}
                    className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="online">Online Coaching</option>
                    <option value="hybrid">Hybrid Coaching</option>
                    <option value="inperson">In-Person Training</option>
                    <option value="nutrition">Nutrition Only</option>
                    <option value="custom">Custom Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={subscriptionForm.plan_name}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan_name: e.target.value })}
                    placeholder="e.g., Premium Coaching, 3x/week Training"
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Billing Interval
                    </label>
                    <select
                      value={subscriptionForm.billing_interval}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, billing_interval: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Status
                    </label>
                    <select
                      value={subscriptionForm.status}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, status: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={subscriptionForm.start_date}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, start_date: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Next Billing Date
                    </label>
                    <input
                      type="date"
                      value={subscriptionForm.next_billing_date}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, next_billing_date: e.target.value })}
                      placeholder="Auto-calculated if empty"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={subscriptionForm.price}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, price: e.target.value })}
                      placeholder="e.g., 299"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Payment Method
                    </label>
                    <select
                      value={subscriptionForm.payment_method}
                      onChange={(e) => setSubscriptionForm({ ...subscriptionForm, payment_method: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      <option value="external">External (Cash/Venmo/etc)</option>
                      <option value="stripe">Stripe</option>
                      <option value="invoice">Invoice</option>
                      <option value="free">Free/Comp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Notes
                  </label>
                  <textarea
                    value={subscriptionForm.notes}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, notes: e.target.value })}
                    rows={2}
                    placeholder="Any additional notes about this subscription..."
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowSubscriptionModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={saveSubscription}
                  variant="primary"
                  className="flex-1"
                  disabled={saving || !subscriptionForm.plan_name}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Subscription'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workout Date Modal */}
      {showEditWorkoutModal && editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Change Workout Date</h3>
                <button onClick={() => setShowEditWorkoutModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-grey-600 mb-2">
                    Workout: <span className="font-medium text-black">{editingWorkout.template?.name || 'Workout'}</span>
                  </p>
                  <p className="text-sm text-grey-600 mb-4">
                    Current Date: <span className="font-medium text-black">
                      {new Date(editingWorkout.workout_date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={editWorkoutDate}
                    onChange={(e) => setEditWorkoutDate(e.target.value)}
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowEditWorkoutModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={updateWorkoutDate}
                  variant="primary"
                  className="flex-1"
                  disabled={saving || !editWorkoutDate}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Update Date'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Program Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-black">Schedule Weekly Program</h3>
                  <p className="text-sm text-grey-500">Assign workouts to specific days of the week</p>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Schedule Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={scheduleStartDate}
                      onChange={(e) => setScheduleStartDate(e.target.value)}
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Number of Weeks
                    </label>
                    <select
                      value={scheduleWeeks}
                      onChange={(e) => setScheduleWeeks(parseInt(e.target.value))}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      {[1, 2, 3, 4, 6, 8, 12].map(w => (
                        <option key={w} value={w}>{w} week{w > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    Weekly Schedule
                  </label>
                  <div className="space-y-3">
                    {dayNames.map((day, index) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium text-grey-700">
                          {dayLabels[index]}
                        </span>
                        <select
                          value={weeklySchedule[day] || ''}
                          onChange={(e) => setWeeklySchedule({
                            ...weeklySchedule,
                            [day]: e.target.value || null,
                          })}
                          className={`flex-1 border px-4 py-2 text-black bg-white focus:outline-none focus:border-blue-600 ${
                            weeklySchedule[day] ? 'border-blue-300 bg-blue-50' : 'border-grey-300'
                          }`}
                        >
                          <option value="">— Rest Day —</option>
                          {availableTemplates.map(template => (
                            <option key={template.id} value={template.id}>
                              {template.name} {template.focus ? `(${template.focus})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-grey-50 p-4 border border-grey-200">
                  <p className="text-sm font-medium text-black mb-2">Schedule Preview</p>
                  <div className="text-sm text-grey-600">
                    {Object.entries(weeklySchedule).filter(([_, v]) => v !== null).length === 0 ? (
                      <p className="text-grey-400 italic">No workouts scheduled yet</p>
                    ) : (
                      <ul className="space-y-1">
                        {dayNames.map((day, index) => {
                          const templateId = weeklySchedule[day];
                          if (!templateId) return null;
                          const template = availableTemplates.find(t => t.id === templateId);
                          return (
                            <li key={day} className="flex items-center gap-2">
                              <span className="font-medium text-black">{dayLabels[index]}:</span>
                              <span>{template?.name || 'Unknown'}</span>
                              {template?.focus && <span className="text-grey-400">({template.focus})</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <p className="mt-3 text-xs text-grey-500">
                      This will create {Object.values(weeklySchedule).filter(v => v !== null).length * scheduleWeeks} workouts
                      over {scheduleWeeks} week{scheduleWeeks > 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowScheduleModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={generateSchedule}
                  variant="primary"
                  className="flex-1"
                  disabled={saving || Object.values(weeklySchedule).every(v => v === null)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {saving ? 'Generating...' : 'Generate Schedule'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
