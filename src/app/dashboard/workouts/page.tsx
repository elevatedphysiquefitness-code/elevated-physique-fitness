'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Calendar,
  CheckCircle2,
  Play,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Target,
  ExternalLink,
  Sparkles,
  Trophy,
  X,
  Plus,
  Minus,
  Timer,
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  youtube_url: string;
  instructions: string;
}

interface WorkoutExercise {
  id: string;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  exercise: Exercise[];
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  focus: string;
  duration_minutes: number;
}

interface AssignedWorkout {
  id: string;
  workout_date: string;
  status: 'scheduled' | 'completed' | 'skipped' | 'rest';
  notes: string;
  template: WorkoutTemplate | WorkoutTemplate[] | null;
}

interface ClientProgram {
  program_name: string;
  current_week: number;
  total_weeks: number;
  status: string;
}

interface SetLog {
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
  isWarmup: boolean;
  completed: boolean;
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

interface WorkoutLog {
  id: string;
  exercise_id: string;
  workout_date: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number | null;
  is_warmup: boolean;
  is_pr: boolean;
}

interface PersonalRecord {
  id: string;
  exercise_id: string;
  record_type: string;
  weight: number;
  reps: number;
  achieved_date: string;
}

// Helper to get template (handles both object and array formats from Supabase)
const getTemplate = (workout: any): WorkoutTemplate | null => {
  if (!workout?.template) return null;
  return Array.isArray(workout.template) ? workout.template[0] : workout.template;
};

export default function WorkoutsPage() {
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<AssignedWorkout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<AssignedWorkout[]>([]);
  const [program, setProgram] = useState<ClientProgram | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const [selectedWorkout, setSelectedWorkout] = useState<AssignedWorkout | null>(null);

  // Workout logging state
  const [isLoggingMode, setIsLoggingMode] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [previousLogs, setPreviousLogs] = useState<{ [exerciseId: string]: WorkoutLog[] }>({});
  const [personalRecords, setPersonalRecords] = useState<{ [exerciseId: string]: PersonalRecord[] }>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [newPRs, setNewPRs] = useState<{ exerciseName: string; weight: number; reps: number }[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get week dates based on offset
  const getWeekDates = (offset: number) => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset + (offset * 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  const { monday: weekMonday, sunday: weekSunday } = getWeekDates(weekOffset);

  const formatWeekRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const mondayStr = weekMonday.toLocaleDateString('en-US', options);
    const sundayStr = weekSunday.toLocaleDateString('en-US', options);
    return `${mondayStr} - ${sundayStr}`;
  };

  const isCurrentWeek = weekOffset === 0;

  // Rest timer effect
  useEffect(() => {
    if (restTimer !== null && restTimeLeft > 0) {
      const interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setRestTimer(null);
            // Could add a sound notification here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer, restTimeLeft]);

  useEffect(() => {
    fetchWorkouts();
  }, [weekOffset]);

  const fetchWorkouts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);
    const today = new Date().toISOString().split('T')[0];

    // Get week dates based on weekOffset
    const { monday, sunday } = getWeekDates(weekOffset);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    // Fetch this week's assigned workouts
    const { data: weekWorkouts } = await supabase
      .from('assigned_workouts')
      .select(`
        id,
        workout_date,
        status,
        notes,
        template:workout_templates (
          id,
          name,
          description,
          focus,
          duration_minutes
        )
      `)
      .eq('client_id', user.id)
      .gte('workout_date', mondayStr)
      .lte('workout_date', sundayStr)
      .order('workout_date');

    if (weekWorkouts) {
      setWeekSchedule(weekWorkouts as AssignedWorkout[]);

      // For current week, find today's workout. For past weeks, select the first workout.
      let workoutToShow: AssignedWorkout | null = null;

      if (isCurrentWeek) {
        const todaysWorkout = weekWorkouts.find(w => w.workout_date === today);
        workoutToShow = todaysWorkout as AssignedWorkout || null;
        setTodayWorkout(workoutToShow);
        setSelectedWorkout(null);
      } else {
        // For past/future weeks, select first workout with a template
        const firstWorkout = weekWorkouts.find(w => getTemplate(w)) || weekWorkouts[0];
        workoutToShow = firstWorkout as AssignedWorkout || null;
        setTodayWorkout(null);
        setSelectedWorkout(workoutToShow);
      }

      // Fetch exercises for the workout to display
      if (workoutToShow) {
        const templateData = getTemplate(workoutToShow);
        if (templateData) {
          const { data: exercises } = await supabase
            .from('workout_template_exercises')
            .select(`
              id,
              order_index,
              sets,
              reps,
              rest_seconds,
              notes,
              exercise:exercises (
                id,
                name,
                description,
                muscle_group,
                youtube_url,
                instructions
              )
            `)
            .eq('template_id', templateData.id)
            .order('order_index');

          if (exercises) {
            setWorkoutExercises(exercises as WorkoutExercise[]);
          }
        } else {
          setWorkoutExercises([]);
        }
      } else {
        setWorkoutExercises([]);
      }
    }

    // Fetch client program info
    const { data: programData } = await supabase
      .from('client_programs')
      .select('program_name, current_week, total_weeks, status')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .single();

    if (programData) {
      setProgram(programData as ClientProgram);
    }

    // Fetch completed workout stats
    const { count: completedCount } = await supabase
      .from('assigned_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .eq('status', 'completed');

    const { count: totalCount } = await supabase
      .from('assigned_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .neq('status', 'rest');

    setCompletedWorkouts(completedCount || 0);
    setTotalWorkouts(totalCount || 0);

    setLoading(false);
  };

  const selectWorkout = async (workout: AssignedWorkout) => {
    setSelectedWorkout(workout);
    setExpandedExercise(null);

    // Fetch exercises for selected workout
    const templateData = getTemplate(workout);
    if (templateData) {
      const supabase = createClient();
      const { data: exercises } = await supabase
        .from('workout_template_exercises')
        .select(`
          id,
          order_index,
          sets,
          reps,
          rest_seconds,
          notes,
          exercise:exercises (
            id,
            name,
            description,
            muscle_group,
            youtube_url,
            instructions
          )
        `)
        .eq('template_id', templateData.id)
        .order('order_index');

      if (exercises) {
        setWorkoutExercises(exercises as WorkoutExercise[]);
      }
    } else {
      setWorkoutExercises([]);
    }
  };

  const markWorkoutComplete = async () => {
    const workoutToComplete = todayWorkout || selectedWorkout;
    if (!workoutToComplete) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('assigned_workouts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', workoutToComplete.id);

    if (!error) {
      if (todayWorkout && todayWorkout.id === workoutToComplete.id) {
        setTodayWorkout({ ...todayWorkout, status: 'completed' });
      }
      if (selectedWorkout && selectedWorkout.id === workoutToComplete.id) {
        setSelectedWorkout({ ...selectedWorkout, status: 'completed' });
      }
      setCompletedWorkouts(prev => prev + 1);
      // Refresh week schedule
      fetchWorkouts();
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Start workout logging mode
  const startWorkoutLogging = async () => {
    if (!userId) return;
    const supabase = createClient();

    // Initialize exercise logs with empty sets
    const logs: ExerciseLog[] = workoutExercises.map(we => ({
      exerciseId: we.exercise?.[0]?.id || '',
      exerciseName: we.exercise?.[0]?.name || '',
      sets: Array.from({ length: we.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: '',
        reps: '',
        rpe: '',
        isWarmup: false,
        completed: false,
      })),
    }));
    setExerciseLogs(logs);
    setCurrentExerciseIndex(0);

    // Fetch previous workout logs for these exercises
    const exerciseIds = workoutExercises
      .map(we => we.exercise?.[0]?.id)
      .filter(Boolean);

    if (exerciseIds.length > 0) {
      const { data: prevLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('client_id', userId)
        .in('exercise_id', exerciseIds)
        .order('workout_date', { ascending: false })
        .order('set_number', { ascending: true });

      if (prevLogs) {
        // Group by exercise_id
        const grouped: { [key: string]: WorkoutLog[] } = {};
        prevLogs.forEach(log => {
          if (!grouped[log.exercise_id]) {
            grouped[log.exercise_id] = [];
          }
          // Only keep the most recent workout's logs (all sets from same date)
          const mostRecentDate = grouped[log.exercise_id][0]?.workout_date;
          if (!mostRecentDate || log.workout_date === mostRecentDate) {
            grouped[log.exercise_id].push(log);
          }
        });
        setPreviousLogs(grouped);
      }

      // Fetch personal records
      const { data: prs } = await supabase
        .from('personal_records')
        .select('*')
        .eq('client_id', userId)
        .in('exercise_id', exerciseIds);

      if (prs) {
        const groupedPRs: { [key: string]: PersonalRecord[] } = {};
        prs.forEach(pr => {
          if (!groupedPRs[pr.exercise_id]) {
            groupedPRs[pr.exercise_id] = [];
          }
          groupedPRs[pr.exercise_id].push(pr);
        });
        setPersonalRecords(groupedPRs);
      }
    }

    setIsLoggingMode(true);
    setExpandedExercise(0);
  };

  // Update a set log
  const updateSetLog = (exerciseIndex: number, setIndex: number, field: keyof SetLog, value: string | boolean) => {
    setExerciseLogs(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: updated[exerciseIndex].sets.map((set, i) =>
          i === setIndex ? { ...set, [field]: value } : set
        ),
      };
      return updated;
    });
  };

  // Mark set as complete and start rest timer
  const completeSet = (exerciseIndex: number, setIndex: number, restSeconds: number) => {
    updateSetLog(exerciseIndex, setIndex, 'completed', true);
    // Start rest timer
    setRestTimer(restSeconds);
    setRestTimeLeft(restSeconds);
  };

  // Save workout logs to database
  const saveWorkoutLogs = async () => {
    if (!userId) return;
    const supabase = createClient();
    const displayWorkout = isCurrentWeek ? todayWorkout : selectedWorkout;
    const workoutDate = displayWorkout?.workout_date || new Date().toISOString().split('T')[0];

    const logsToInsert: {
      client_id: string;
      assigned_workout_id: string | undefined;
      exercise_id: string;
      workout_date: string;
      set_number: number;
      weight: number;
      reps: number;
      rpe: number | null;
      is_warmup: boolean;
      is_pr: boolean;
    }[] = [];

    const newPRsFound: { exerciseName: string; weight: number; reps: number }[] = [];

    for (const exerciseLog of exerciseLogs) {
      const currentPRs = personalRecords[exerciseLog.exerciseId] || [];
      const max1RM = currentPRs.find(pr => pr.record_type === 'max_weight');

      for (const set of exerciseLog.sets) {
        if (set.completed && set.weight && set.reps) {
          const weight = parseFloat(set.weight);
          const reps = parseInt(set.reps);
          const rpe = set.rpe ? parseFloat(set.rpe) : null;

          // Check if this is a PR (new max weight)
          const isPR = !max1RM || weight > max1RM.weight;

          if (isPR && weight > 0) {
            newPRsFound.push({
              exerciseName: exerciseLog.exerciseName,
              weight,
              reps,
            });
          }

          logsToInsert.push({
            client_id: userId,
            assigned_workout_id: displayWorkout?.id,
            exercise_id: exerciseLog.exerciseId,
            workout_date: workoutDate,
            set_number: set.setNumber,
            weight,
            reps,
            rpe,
            is_warmup: set.isWarmup,
            is_pr: isPR,
          });
        }
      }
    }

    if (logsToInsert.length > 0) {
      // Insert workout logs
      const { error: logsError } = await supabase
        .from('workout_logs')
        .insert(logsToInsert);

      if (logsError) {
        console.error('Error saving workout logs:', logsError);
      }

      // Update or insert PRs
      for (const pr of newPRsFound) {
        const exerciseLog = exerciseLogs.find(e => e.exerciseName === pr.exerciseName);
        if (exerciseLog) {
          await supabase
            .from('personal_records')
            .upsert({
              client_id: userId,
              exercise_id: exerciseLog.exerciseId,
              record_type: 'max_weight',
              weight: pr.weight,
              reps: pr.reps,
              achieved_date: workoutDate,
            }, {
              onConflict: 'client_id,exercise_id,record_type',
            });
        }
      }
    }

    setNewPRs(newPRsFound);
    setIsLoggingMode(false);

    // Mark workout as complete
    await markWorkoutComplete();
  };

  // Format time for rest timer
  const formatRestTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  // Empty state - no workouts assigned (only show on current week)
  if (weekSchedule.length === 0 && !todayWorkout && isCurrentWeek) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Workout Program</h1>
            <p className="mt-2 text-grey-600">Your personalized training schedule</p>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-1 bg-grey-100 rounded-lg p-1">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-2 hover:bg-grey-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-grey-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 min-w-[160px] justify-center">
              <Calendar className="h-4 w-4 text-grey-500" />
              <span className="text-sm font-medium text-black">This Week</span>
            </div>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-2 hover:bg-grey-200 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-grey-600" />
            </button>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-grey-100 mx-auto mb-6 flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-grey-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">No Workouts Assigned Yet</h2>
            <p className="text-grey-600 max-w-md mx-auto mb-6">
              Get started with an AI-generated workout program tailored to your goals, or wait for your coach to assign workouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/dashboard/onboarding" variant="primary">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate AI Workout
              </Button>
              <Button href="/dashboard/messages" variant="outline">
                Message Your Coach
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine which workout to display
  const displayWorkout = isCurrentWeek ? todayWorkout : selectedWorkout;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Workout Program</h1>
          <p className="mt-2 text-grey-600">
            {program ? `Week ${program.current_week} of ${program.total_weeks} - ${program.program_name}` : 'Your personalized training schedule'}
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-1 bg-grey-100 rounded-lg p-1">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 hover:bg-grey-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-grey-600" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 min-w-[160px] justify-center">
            <Calendar className="h-4 w-4 text-grey-500" />
            <span className="text-sm font-medium text-black">
              {isCurrentWeek ? 'This Week' : formatWeekRange()}
            </span>
          </div>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2 hover:bg-grey-200 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-grey-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selected Workout */}
        <div className="lg:col-span-2 space-y-6">
          {displayWorkout ? (
            <Card>
              <CardHeader className={displayWorkout.status === 'completed' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={displayWorkout.status === 'completed' ? 'text-green-100 text-sm' : 'text-blue-100 text-sm'}>
                      {displayWorkout.status === 'completed'
                        ? 'Completed'
                        : isCurrentWeek && isToday(displayWorkout.workout_date)
                          ? "Today's Workout"
                          : getDayName(displayWorkout.workout_date)}
                    </p>
                    <h2 className="text-2xl font-bold mt-1">
                      {getTemplate(displayWorkout)?.name || 'Rest Day'}
                    </h2>
                    {getTemplate(displayWorkout)?.focus && (
                      <p className={displayWorkout.status === 'completed' ? 'text-green-200 mt-2' : 'text-blue-200 mt-2'}>
                        {getTemplate(displayWorkout)?.focus}
                      </p>
                    )}
                  </div>
                  {getTemplate(displayWorkout) && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-blue-100">
                        <Clock className="h-4 w-4" />
                        <span>{getTemplate(displayWorkout)?.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-100 mt-1">
                        <Dumbbell className="h-4 w-4" />
                        <span>{workoutExercises.length} exercises</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              {workoutExercises.length > 0 && (
                <CardContent className="p-0">
                  {/* Rest Timer Banner */}
                  {restTimer !== null && (
                    <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Timer className="h-6 w-6" />
                        <div>
                          <p className="text-sm text-blue-200">Rest Timer</p>
                          <p className="text-2xl font-bold">{formatRestTime(restTimeLeft)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setRestTimer(null)}
                        className="p-2 hover:bg-blue-700 rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  <div className="divide-y divide-grey-200">
                    {workoutExercises.map((we, index) => {
                      const exerciseId = we.exercise?.[0]?.id;
                      const prevExerciseLogs = exerciseId ? previousLogs[exerciseId] : [];
                      const exercisePRs = exerciseId ? personalRecords[exerciseId] : [];
                      const currentMaxPR = exercisePRs?.find(pr => pr.record_type === 'max_weight');

                      return (
                        <div key={we.id} className="p-4">
                          <button
                            className="w-full flex items-center justify-between"
                            onClick={() => setExpandedExercise(expandedExercise === index ? null : index)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 flex items-center justify-center font-semibold ${
                                isLoggingMode && exerciseLogs[index]?.sets.every(s => s.completed)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-grey-200 text-grey-600'
                              }`}>
                                {isLoggingMode && exerciseLogs[index]?.sets.every(s => s.completed) ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-black">{we.exercise?.[0]?.name}</p>
                                  {currentMaxPR && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                      <Trophy className="h-3 w-3" />
                                      PR: {currentMaxPR.weight}lbs
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-grey-500">
                                  {we.sets} sets x {we.reps} reps
                                </p>
                              </div>
                            </div>
                            {expandedExercise === index ? (
                              <ChevronUp className="h-5 w-5 text-grey-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-grey-400" />
                            )}
                          </button>

                          {expandedExercise === index && (
                            <div className="mt-4 pl-14 space-y-4">
                              {/* Previous workout reference */}
                              {prevExerciseLogs && prevExerciseLogs.length > 0 && (
                                <div className="bg-grey-50 p-3 rounded-lg border border-grey-200">
                                  <p className="text-xs text-grey-500 uppercase mb-2">Last Workout</p>
                                  <div className="flex flex-wrap gap-2">
                                    {prevExerciseLogs.slice(0, 5).map((log, i) => (
                                      <span key={i} className="px-2 py-1 bg-white rounded border border-grey-200 text-sm">
                                        {log.weight}lbs x {log.reps}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Logging Mode: Set inputs */}
                              {isLoggingMode && exerciseLogs[index] ? (
                                <div className="space-y-3">
                                  {exerciseLogs[index].sets.map((set, setIndex) => (
                                    <div
                                      key={setIndex}
                                      className={`p-3 rounded-lg border ${
                                        set.completed
                                          ? 'bg-green-50 border-green-200'
                                          : 'bg-white border-grey-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-grey-700">
                                          Set {set.setNumber}
                                          {set.isWarmup && (
                                            <span className="ml-2 text-xs text-orange-600">(Warmup)</span>
                                          )}
                                        </span>
                                        <label className="flex items-center gap-2 text-xs text-grey-500">
                                          <input
                                            type="checkbox"
                                            checked={set.isWarmup}
                                            onChange={(e) => updateSetLog(index, setIndex, 'isWarmup', e.target.checked)}
                                            className="rounded"
                                          />
                                          Warmup
                                        </label>
                                      </div>
                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <label className="text-xs text-grey-500">Weight (lbs)</label>
                                          <input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => updateSetLog(index, setIndex, 'weight', e.target.value)}
                                            placeholder={prevExerciseLogs?.[setIndex]?.weight?.toString() || '0'}
                                            className="w-full px-2 py-1 border border-grey-300 rounded text-center"
                                            disabled={set.completed}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-grey-500">Reps</label>
                                          <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => updateSetLog(index, setIndex, 'reps', e.target.value)}
                                            placeholder={we.reps}
                                            className="w-full px-2 py-1 border border-grey-300 rounded text-center"
                                            disabled={set.completed}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs text-grey-500">RPE</label>
                                          <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={set.rpe}
                                            onChange={(e) => updateSetLog(index, setIndex, 'rpe', e.target.value)}
                                            placeholder="7"
                                            className="w-full px-2 py-1 border border-grey-300 rounded text-center"
                                            disabled={set.completed}
                                          />
                                        </div>
                                        <div className="flex items-end">
                                          {set.completed ? (
                                            <div className="w-full py-1 text-center text-green-600 font-medium text-sm">
                                              ✓ Done
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => completeSet(index, setIndex, we.rest_seconds)}
                                              disabled={!set.weight || !set.reps}
                                              className="w-full py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-grey-300 disabled:cursor-not-allowed"
                                            >
                                              Log
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                /* Regular Mode: Exercise info */
                                <>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-grey-100 p-3 text-center">
                                      <p className="text-xs text-grey-500 uppercase">Sets</p>
                                      <p className="font-semibold text-black">{we.sets}</p>
                                    </div>
                                    <div className="bg-grey-100 p-3 text-center">
                                      <p className="text-xs text-grey-500 uppercase">Reps</p>
                                      <p className="font-semibold text-black">{we.reps}</p>
                                    </div>
                                    <div className="bg-grey-100 p-3 text-center">
                                      <p className="text-xs text-grey-500 uppercase">Rest</p>
                                      <p className="font-semibold text-black">{we.rest_seconds}s</p>
                                    </div>
                                  </div>
                                </>
                              )}

                              {we.notes && (
                                <div className="bg-blue-50 p-3 border-l-4 border-blue-600">
                                  <p className="text-sm text-grey-700">
                                    <span className="font-semibold">Coach Note:</span> {we.notes}
                                  </p>
                                </div>
                              )}
                              {we.exercise?.[0]?.youtube_url && (
                                <a
                                  href={we.exercise[0].youtube_url.replace('/embed/', '/watch?v=')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
                                >
                                  Watch demo video
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {displayWorkout.status !== 'completed' && (
                    <div className="p-6 bg-grey-100">
                      {isLoggingMode ? (
                        <div className="space-y-3">
                          <Button onClick={saveWorkoutLogs} variant="primary" size="lg" className="w-full">
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Finish & Save Workout
                          </Button>
                          <Button
                            onClick={() => setIsLoggingMode(false)}
                            variant="outline"
                            size="lg"
                            className="w-full"
                          >
                            Cancel Logging
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button onClick={startWorkoutLogging} variant="primary" size="lg" className="w-full">
                            <Play className="mr-2 h-5 w-5" />
                            Start Workout & Log Sets
                          </Button>
                          <Button onClick={markWorkoutComplete} variant="outline" size="lg" className="w-full">
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Mark Complete (No Logging)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}

              {displayWorkout.status === 'rest' && (
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">Rest Day</h3>
                  <p className="text-grey-600">
                    Today is a rest day. Focus on recovery, stretching, and light activity.
                  </p>
                </CardContent>
              )}
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-grey-100 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-grey-400" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  {isCurrentWeek ? 'No Workout Today' : 'Select a Workout'}
                </h3>
                <p className="text-grey-600">
                  {isCurrentWeek
                    ? 'Check your schedule for upcoming workouts this week.'
                    : 'Click on a workout from the schedule to view details.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Week Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-black">
                  {isCurrentWeek ? 'This Week' : formatWeekRange()}
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              {weekSchedule.length > 0 ? (
                <div className="space-y-2">
                  {weekSchedule.map((workout) => {
                    const isSelected = displayWorkout?.id === workout.id;
                    const isTodayWorkout = isCurrentWeek && isToday(workout.workout_date);

                    return (
                      <button
                        key={workout.id}
                        onClick={() => selectWorkout(workout)}
                        className={`w-full flex items-center justify-between p-3 transition-colors ${
                          isSelected
                            ? 'bg-blue-100 border-2 border-blue-600'
                            : isTodayWorkout
                              ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                              : 'bg-grey-100 hover:bg-grey-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {workout.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : workout.status === 'rest' ? (
                            <div className="w-5 h-5 border-2 border-grey-300 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-grey-300" />
                          )}
                          <div className="text-left">
                            <p className={`text-sm font-medium ${
                              isSelected || isTodayWorkout ? 'text-blue-600' : 'text-black'
                            }`}>
                              {getDayName(workout.workout_date)}
                              {isTodayWorkout && ' (Today)'}
                            </p>
                            <p className={`text-xs ${workout.status === 'rest' ? 'text-grey-400' : 'text-grey-500'}`}>
                              {getTemplate(workout)?.name || 'Rest'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-grey-500 text-center py-4">No workouts scheduled this week</p>
              )}
            </CardContent>
          </Card>

          {/* Program Overview */}
          {program && (
            <Card className="border-2 border-blue-600">
              <CardContent className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-black">Program Overview</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-grey-500 text-sm">Current Program</p>
                    <p className="font-semibold text-black">{program.program_name}</p>
                  </div>
                  <div>
                    <p className="text-grey-500 text-sm">Week</p>
                    <p className="font-semibold text-black">{program.current_week} of {program.total_weeks}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-grey-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-grey-500">Workouts Completed</span>
                    <span className="text-blue-600 font-semibold">{completedWorkouts}</span>
                  </div>
                  <div className="mt-2 h-2 bg-grey-200 rounded">
                    <div
                      className="h-full bg-blue-600 rounded"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-black">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button href="/dashboard/videos" variant="outline" className="w-full justify-start">
                  Exercise Video Library
                </Button>
                <Button href="/dashboard/calendar" variant="outline" className="w-full justify-start">
                  View Full Schedule
                </Button>
                <Button href="/dashboard/messages" variant="outline" className="w-full justify-start">
                  Message Your Coach
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PR Celebration Modal */}
      {newPRs.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">
              🎉 New Personal Record{newPRs.length > 1 ? 's' : ''}!
            </h2>
            <p className="text-grey-600 mb-6">
              Congratulations! You crushed it today!
            </p>
            <div className="space-y-3 mb-6">
              {newPRs.map((pr, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-black">{pr.exerciseName}</p>
                  <p className="text-yellow-700 font-bold text-lg">
                    {pr.weight} lbs x {pr.reps} reps
                  </p>
                </div>
              ))}
            </div>
            <Button onClick={() => setNewPRs([])} variant="primary" className="w-full">
              Awesome! 💪
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
