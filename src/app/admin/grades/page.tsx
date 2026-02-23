'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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

export default function AdminGradesPage() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [grades, setGrades] = useState<WeeklyGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<Date>(getMonday(new Date()));
  const [filter, setFilter] = useState<'needs_grading' | 'graded' | 'all'>('needs_grading');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [form, setForm] = useState<GradeForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedWeek]);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    const weekStart = selectedWeek.toISOString().split('T')[0];

    const [clientsRes, gradesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'client')
        .order('full_name'),
      supabase
        .from('weekly_grades')
        .select('*')
        .eq('graded_week_start', weekStart),
    ]);

    if (clientsRes.data) setClients(clientsRes.data);
    if (gradesRes.data) setGrades(gradesRes.data);
    setLoading(false);
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

    // Optimistic state update
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
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
              <div className="flex items-center gap-3">
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
            <div className="flex items-center justify-between p-6 border-b border-grey-200 sticky top-0 bg-white">
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
