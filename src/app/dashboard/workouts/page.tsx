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
  Target,
  ExternalLink,
  Sparkles,
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
  template: WorkoutTemplate[] | null;
}

interface ClientProgram {
  program_name: string;
  current_week: number;
  total_weeks: number;
  status: string;
}

export default function WorkoutsPage() {
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<AssignedWorkout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<AssignedWorkout[]>([]);
  const [program, setProgram] = useState<ClientProgram | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Get current week dates (Monday to Sunday)
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

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

      // Find today's workout
      const todaysWorkout = weekWorkouts.find(w => w.workout_date === today);
      if (todaysWorkout) {
        setTodayWorkout(todaysWorkout as AssignedWorkout);

        // Fetch exercises for today's workout template
        const templateData = todaysWorkout.template?.[0];
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
        }
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

  const markWorkoutComplete = async () => {
    if (!todayWorkout) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('assigned_workouts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', todayWorkout.id);

    if (!error) {
      setTodayWorkout({ ...todayWorkout, status: 'completed' });
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

  const progressPercentage = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  // Empty state - no workouts assigned
  if (weekSchedule.length === 0 && !todayWorkout) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Workout Program</h1>
          <p className="mt-2 text-grey-600">Your personalized training schedule</p>
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Workout Program</h1>
        <p className="mt-2 text-grey-600">
          {program ? `Week ${program.current_week} of ${program.total_weeks} - ${program.program_name}` : 'Your personalized training schedule'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Workout */}
        <div className="lg:col-span-2 space-y-6">
          {todayWorkout ? (
            <Card>
              <CardHeader className={todayWorkout.status === 'completed' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={todayWorkout.status === 'completed' ? 'text-green-100 text-sm' : 'text-blue-100 text-sm'}>
                      {todayWorkout.status === 'completed' ? 'Completed' : "Today's Workout"}
                    </p>
                    <h2 className="text-2xl font-bold mt-1">
                      {todayWorkout.template?.[0]?.name || 'Rest Day'}
                    </h2>
                    {todayWorkout.template?.[0]?.focus && (
                      <p className={todayWorkout.status === 'completed' ? 'text-green-200 mt-2' : 'text-blue-200 mt-2'}>
                        {todayWorkout.template[0].focus}
                      </p>
                    )}
                  </div>
                  {todayWorkout.template?.[0] && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-blue-100">
                        <Clock className="h-4 w-4" />
                        <span>{todayWorkout.template[0].duration_minutes} min</span>
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
                  <div className="divide-y divide-grey-200">
                    {workoutExercises.map((we, index) => (
                      <div key={we.id} className="p-4">
                        <button
                          className="w-full flex items-center justify-between"
                          onClick={() => setExpandedExercise(expandedExercise === index ? null : index)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-grey-200 flex items-center justify-center text-grey-600 font-semibold">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-black">{we.exercise?.[0]?.name}</p>
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
                          <div className="mt-4 pl-14 space-y-3">
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
                    ))}
                  </div>

                  {todayWorkout.status !== 'completed' && (
                    <div className="p-6 bg-grey-100">
                      <Button onClick={markWorkoutComplete} variant="primary" size="lg" className="w-full">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Mark Workout Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}

              {todayWorkout.status === 'rest' && (
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
                <h3 className="text-lg font-bold text-black mb-2">No Workout Today</h3>
                <p className="text-grey-600">
                  Check your schedule for upcoming workouts this week.
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
                <h3 className="font-semibold text-black">This Week</h3>
              </div>
            </CardHeader>
            <CardContent>
              {weekSchedule.length > 0 ? (
                <div className="space-y-2">
                  {weekSchedule.map((workout) => (
                    <div
                      key={workout.id}
                      className={`flex items-center justify-between p-3 ${
                        isToday(workout.workout_date) ? 'bg-blue-50 border border-blue-200' : 'bg-grey-100'
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
                        <div>
                          <p className={`text-sm font-medium ${
                            isToday(workout.workout_date) ? 'text-blue-600' : 'text-black'
                          }`}>
                            {getDayName(workout.workout_date)}
                            {isToday(workout.workout_date) && ' (Today)'}
                          </p>
                          <p className={`text-xs ${workout.status === 'rest' ? 'text-grey-400' : 'text-grey-500'}`}>
                            {workout.template?.[0]?.name || 'Rest'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
