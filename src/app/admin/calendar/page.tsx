'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Dumbbell,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface ScheduledWorkout {
  id: string;
  workout_date: string;
  status: string;
  client_id: string;
  client_name: string;
  client_email: string;
  template_name: string | null;
  template_focus: string | null;
}

interface DayWorkouts {
  [date: string]: ScheduledWorkout[];
}

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, [currentDate]);

  const fetchWorkouts = async () => {
    setLoading(true);
    const supabase = createClient();

    // Get first and last day of the month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Extend range to include visible days from prev/next months
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const { data, error } = await supabase
      .from('assigned_workouts')
      .select(`
        id,
        workout_date,
        status,
        client_id,
        profiles!assigned_workouts_client_id_fkey (full_name, email),
        workout_templates!assigned_workouts_template_id_fkey (name, title, focus)
      `)
      .gte('workout_date', startDate.toISOString().split('T')[0])
      .lte('workout_date', endDate.toISOString().split('T')[0])
      .order('workout_date', { ascending: true });

    if (error) {
      console.error('Error fetching workouts:', error);
    } else if (data) {
      const formattedWorkouts: ScheduledWorkout[] = data.map((w: any) => ({
        id: w.id,
        workout_date: w.workout_date,
        status: w.status,
        client_id: w.client_id,
        client_name: w.profiles?.full_name || 'Unknown Client',
        client_email: w.profiles?.email || '',
        template_name: w.workout_templates?.name || w.workout_templates?.title || null,
        template_focus: w.workout_templates?.focus || null,
      }));
      setWorkouts(formattedWorkouts);
    }

    setLoading(false);
  };

  // Group workouts by date
  const workoutsByDate: DayWorkouts = workouts.reduce((acc, workout) => {
    if (!acc[workout.workout_date]) {
      acc[workout.workout_date] = [];
    }
    acc[workout.workout_date].push(workout);
    return acc;
  }, {} as DayWorkouts);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill the last week
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openDayDetail = (dateKey: string) => {
    setSelectedDay(dateKey);
    setShowDayModal(true);
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get workouts for selected day
  const selectedDayWorkouts = selectedDay ? workoutsByDate[selectedDay] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Training Calendar</h1>
          <p className="text-grey-600 mt-1">View all scheduled client workouts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
        </div>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-grey-600" />
            </button>
            <h2 className="text-xl font-bold text-black">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-grey-600" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-grey-500">Loading calendar...</div>
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-grey-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dateKey = formatDateKey(day);
                  const dayWorkouts = workoutsByDate[dateKey] || [];
                  const hasWorkouts = dayWorkouts.length > 0;
                  const completedCount = dayWorkouts.filter(w => w.status === 'completed').length;
                  const scheduledCount = dayWorkouts.filter(w => w.status === 'scheduled').length;

                  return (
                    <button
                      key={index}
                      onClick={() => hasWorkouts && openDayDetail(dateKey)}
                      disabled={!hasWorkouts}
                      className={`
                        min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border text-left transition-colors relative
                        ${isCurrentMonth(day) ? 'bg-white' : 'bg-grey-50'}
                        ${isToday(day) ? 'border-blue-500 border-2' : 'border-grey-200'}
                        ${hasWorkouts ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}
                      `}
                    >
                      <span
                        className={`
                          text-sm font-medium
                          ${isToday(day) ? 'text-blue-600' : isCurrentMonth(day) ? 'text-black' : 'text-grey-400'}
                        `}
                      >
                        {day.getDate()}
                      </span>

                      {hasWorkouts && (
                        <div className="mt-1 space-y-1">
                          {/* Show first 2-3 workouts */}
                          {dayWorkouts.slice(0, 3).map((workout, i) => (
                            <div
                              key={workout.id}
                              className={`
                                text-xs px-1 py-0.5 rounded truncate
                                ${workout.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                                }
                              `}
                              title={`${workout.client_name} - ${workout.template_name || 'Workout'}`}
                            >
                              <span className="hidden sm:inline">{workout.client_name.split(' ')[0]}</span>
                              <span className="sm:hidden">{workout.client_name.split(' ')[0].charAt(0)}</span>
                            </div>
                          ))}
                          {dayWorkouts.length > 3 && (
                            <div className="text-xs text-grey-500 px-1">
                              +{dayWorkouts.length - 3} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* Workout count badge */}
                      {hasWorkouts && (
                        <div className="absolute top-1 right-1 flex gap-0.5">
                          {scheduledCount > 0 && (
                            <span className="w-5 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
                              {scheduledCount}
                            </span>
                          )}
                          {completedCount > 0 && (
                            <span className="w-5 h-5 bg-green-600 text-white text-xs flex items-center justify-center rounded-full">
                              {completedCount}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs text-grey-600">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                  Scheduled
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                  Completed
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming This Week */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-black flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Upcoming This Week
          </h2>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = new Date();
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            const todayKey = formatDateKey(today);
            const weekEndKey = formatDateKey(weekEnd);

            const upcomingWorkouts = workouts.filter(w =>
              w.workout_date >= todayKey &&
              w.workout_date <= weekEndKey &&
              w.status === 'scheduled'
            );

            if (upcomingWorkouts.length === 0) {
              return (
                <div className="text-center py-6 text-grey-500">
                  <Calendar className="h-8 w-8 mx-auto text-grey-300 mb-2" />
                  <p>No workouts scheduled for this week</p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {upcomingWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    href={`/admin/clients/${workout.client_id}`}
                    className="flex items-center justify-between p-3 bg-grey-50 hover:bg-grey-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-lg">
                        <Dumbbell className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-black">{workout.client_name}</p>
                        <p className="text-xs text-grey-500">
                          {workout.template_name || 'Workout'}
                          {workout.template_focus && ` · ${workout.template_focus}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-black">
                        {new Date(workout.workout_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                        {workout.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Day Detail Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-black">
                    {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                  <p className="text-sm text-grey-500">
                    {selectedDayWorkouts.length} workout{selectedDayWorkouts.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="text-grey-400 hover:text-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedDayWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    href={`/admin/clients/${workout.client_id}`}
                    onClick={() => setShowDayModal(false)}
                    className={`
                      block p-4 border rounded-lg transition-colors
                      ${workout.status === 'completed'
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-grey-200 bg-grey-50 hover:bg-grey-100'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 flex items-center justify-center rounded-lg
                          ${workout.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}
                        `}>
                          {workout.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-black">{workout.client_name}</p>
                          <p className="text-sm text-grey-500">{workout.client_email}</p>
                        </div>
                      </div>
                      <span
                        className={`
                          text-xs px-2 py-1
                          ${workout.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                          }
                        `}
                      >
                        {workout.status}
                      </span>
                    </div>
                    {(workout.template_name || workout.template_focus) && (
                      <div className="mt-3 pt-3 border-t border-grey-200">
                        <p className="text-sm font-medium text-black">
                          {workout.template_name || 'Custom Workout'}
                        </p>
                        {workout.template_focus && (
                          <p className="text-xs text-grey-500">{workout.template_focus}</p>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
