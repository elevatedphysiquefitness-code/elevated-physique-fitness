'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Dumbbell, ClipboardCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CalendarEvent {
  type: 'workout' | 'checkin';
  title: string;
  status?: string;
}

interface AssignedWorkout {
  id: string;
  workout_date: string;
  status: 'scheduled' | 'completed' | 'skipped' | 'rest';
  notes: string | null;
  template: {
    name: string;
  }[] | null;
}

interface CheckIn {
  id: string;
  created_at: string;
  week_number: number;
  status: 'pending' | 'reviewed';
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<AssignedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchCalendarData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get the first and last day of the current month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      // Fetch assigned workouts for the month
      const { data: workouts } = await supabase
        .from('assigned_workouts')
        .select(`
          id,
          workout_date,
          status,
          notes,
          template:workout_templates(name)
        `)
        .eq('client_id', user.id)
        .gte('workout_date', startDate)
        .lte('workout_date', endDate)
        .order('workout_date');

      // Fetch check-ins for the month
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('id, created_at, week_number, status')
        .eq('client_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Build events map
      const eventsMap: { [key: string]: CalendarEvent[] } = {};

      if (workouts) {
        workouts.forEach((workout: AssignedWorkout) => {
          const date = workout.workout_date;
          if (!eventsMap[date]) eventsMap[date] = [];

          const templateName = workout.template?.[0]?.name;
          eventsMap[date].push({
            type: 'workout',
            title: templateName || (workout.status === 'rest' ? 'Rest Day' : 'Workout'),
            status: workout.status,
          });
        });
      }

      if (checkIns) {
        checkIns.forEach((checkIn: CheckIn) => {
          const date = checkIn.created_at.split('T')[0];
          if (!eventsMap[date]) eventsMap[date] = [];
          eventsMap[date].push({
            type: 'checkin',
            title: `Week ${checkIn.week_number} Check-in`,
            status: checkIn.status,
          });
        });
      }

      setEvents(eventsMap);

      // Fetch upcoming workouts (next 7 days)
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const { data: upcoming } = await supabase
        .from('assigned_workouts')
        .select(`
          id,
          workout_date,
          status,
          notes,
          template:workout_templates(name)
        `)
        .eq('client_id', user.id)
        .gte('workout_date', today)
        .lte('workout_date', nextWeekStr)
        .eq('status', 'scheduled')
        .order('workout_date')
        .limit(5);

      if (upcoming) {
        setUpcomingWorkouts(upcoming as AssignedWorkout[]);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const formatUpcomingDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Calendar</h1>
        <p className="text-grey-600 mt-1">View your schedule and book sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-grey-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-grey-600" />
            </button>
            <h2 className="text-lg font-bold text-black">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-grey-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-grey-600" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-grey-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dateStr = day ? getDateString(day) : '';
              const dayEvents = day ? events[dateStr] : undefined;

              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border ${
                    day === null
                      ? 'bg-grey-50 border-grey-100'
                      : isToday(day)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-grey-200 hover:bg-grey-50'
                  }`}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`text-sm font-medium ${
                          isToday(day) ? 'text-blue-600' : 'text-black'
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents && (
                        <div className="mt-1 space-y-1">
                          {dayEvents.map((event, i) => (
                            <div
                              key={i}
                              className={`text-xs px-1 py-0.5 truncate ${
                                event.type === 'workout'
                                  ? event.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : event.status === 'rest'
                                    ? 'bg-grey-100 text-grey-600'
                                    : 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200" />
              <span className="text-grey-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200" />
              <span className="text-grey-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-100 border border-purple-200" />
              <span className="text-grey-600">Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-grey-100 border border-grey-200" />
              <span className="text-grey-600">Rest Day</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Session */}
          <div className="bg-white p-6">
            <h3 className="text-lg font-bold text-black mb-4">Book a Session</h3>
            <p className="text-grey-600 text-sm mb-4">
              Ready to schedule your next in-person training session?
            </p>
            <Button
              href="/dashboard/messages"
              variant="primary"
              className="w-full"
            >
              Message Your Coach
            </Button>
            <p className="text-xs text-grey-500 mt-3 text-center">
              Your coach will coordinate session times with you directly.
            </p>
          </div>

          {/* Upcoming */}
          <div className="bg-white p-6">
            <h3 className="text-lg font-bold text-black mb-4">Upcoming Workouts</h3>
            {upcomingWorkouts.length > 0 ? (
              <div className="space-y-4">
                {upcomingWorkouts.map((workout) => {
                  const templateName = workout.template?.[0]?.name;
                  return (
                    <div key={workout.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-black">
                          {templateName || 'Workout'}
                        </p>
                        <p className="text-sm text-grey-500">
                          {formatUpcomingDate(workout.workout_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-500 text-sm">No upcoming workouts</p>
                <p className="text-grey-400 text-xs mt-1">
                  Check back once your coach assigns workouts
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6">
            <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button href="/dashboard/check-ins" variant="outline" className="w-full justify-start">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Submit Check-in
              </Button>
              <Button href="/dashboard/workouts" variant="outline" className="w-full justify-start">
                <Dumbbell className="h-4 w-4 mr-2" />
                View Workouts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
