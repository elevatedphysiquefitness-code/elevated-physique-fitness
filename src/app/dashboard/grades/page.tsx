'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';

interface WeeklyGrade {
  id: string;
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
  created_at: string;
}

const categories = [
  { key: 'workout_consistency' as const, label: 'Workout Consistency' },
  { key: 'workout_intensity' as const, label: 'Workout Intensity' },
  { key: 'nutrition_adherence' as const, label: 'Nutrition Adherence' },
  { key: 'water_intake' as const, label: 'Water Intake' },
  { key: 'sleep' as const, label: 'Sleep' },
];

function getScoreColor(score: number) {
  if (score >= 8) return 'bg-green-500';
  if (score >= 6) return 'bg-yellow-500';
  if (score >= 4) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number) {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
}

function formatWeekLabel(dateStr: string): string {
  const monday = new Date(dateStr + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} - ${sunday.toLocaleDateString('en-US', opts)}`;
}

export default function GradesHistoryPage() {
  const [grades, setGrades] = useState<WeeklyGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('weekly_grades')
        .select('*')
        .eq('client_id', user.id)
        .order('graded_week_start', { ascending: false });

      if (data) setGrades(data);
      setLoading(false);
    };

    fetchGrades();
  }, []);

  const getTrend = (index: number): number | null => {
    if (index >= grades.length - 1) return null;
    return grades[index].overall_grade - grades[index + 1].overall_grade;
  };

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
        <p className="text-grey-600 mt-1">Your performance grades from your coach</p>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center">
          <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-grey-400" />
          </div>
          <h3 className="font-semibold text-black text-lg">No grades yet</h3>
          <p className="text-grey-500 mt-2">Your coach will post weekly grades here as you progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grades.map((grade, index) => {
            const isExpanded = expandedId === grade.id;
            const trend = getTrend(index);

            return (
              <div key={grade.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Collapsed view */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : grade.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${getScoreColor(grade.overall_grade)}`}>
                      {grade.overall_grade}
                    </div>
                    <div>
                      <p className="font-semibold text-black">Week {grade.week_number}</p>
                      <p className="text-sm text-grey-500">{formatWeekLabel(grade.graded_week_start)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {trend !== null && (
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-grey-500'
                      }`}>
                        {trend > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : trend < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                        {trend > 0 ? '+' : ''}{trend}
                      </div>
                    )}
                    {/* Mini category bars */}
                    <div className="hidden sm:flex items-center gap-1">
                      {categories.map((cat) => (
                        <div key={cat.key} className="w-6 h-2 bg-grey-100 rounded-full overflow-hidden" title={cat.label}>
                          <div
                            className={`h-full rounded-full ${getScoreColor(grade[cat.key])}`}
                            style={{ width: `${grade[cat.key] * 10}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-grey-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-grey-400" />
                    )}
                  </div>
                </button>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-grey-100 pt-4">
                    {/* Category breakdown */}
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div key={cat.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-grey-600">{cat.label}</span>
                            <span className={`text-sm font-bold ${getScoreTextColor(grade[cat.key])}`}>
                              {grade[cat.key]}/10
                            </span>
                          </div>
                          <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(grade[cat.key])}`}
                              style={{ width: `${grade[cat.key] * 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coach notes */}
                    {grade.strengths && (
                      <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-sm font-medium text-green-700 mb-1">Strengths</p>
                        <p className="text-sm text-grey-700">{grade.strengths}</p>
                      </div>
                    )}

                    {grade.improvements && (
                      <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                        <p className="text-sm font-medium text-orange-700 mb-1">Areas to Improve</p>
                        <p className="text-sm text-grey-700">{grade.improvements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
