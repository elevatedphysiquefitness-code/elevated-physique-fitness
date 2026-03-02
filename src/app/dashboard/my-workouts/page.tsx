'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Plus,
  X,
  Trash2,
  Clock,
  Play,
  Calendar,
  Loader2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Zap,
  Search,
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  description: string;
  instructions: string;
  youtube_url: string;
  equipment_required: string[];
}

interface SelectedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

interface CustomTemplate {
  id: string;
  name: string;
  focus: string;
  duration_minutes: number;
  exercise_count: number;
  created_at: string;
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Core', 'Full Body', 'Cardio',
];

export default function MyWorkoutsPage() {
  const toast = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'builder' | 'quick'>('list');
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);

  // Builder form
  const [builderForm, setBuilderForm] = useState({ name: '', focus: '', duration_minutes: '45' });
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Exercise search
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('All');

  // Custom exercise form
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscle_group: 'Chest',
    instructions: '',
    equipment: '',
  });

  // Schedule modal
  const [scheduleTemplateId, setScheduleTemplateId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const [templatesRes, exercisesRes] = await Promise.all([
      supabase
        .from('workout_templates')
        .select('id, name, focus, duration_minutes, created_at, workout_template_exercises(id)')
        .eq('created_for_client_id', user.id)
        .eq('is_custom', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('exercises')
        .select('id, name, muscle_group, description, instructions, youtube_url, equipment_required')
        .order('muscle_group')
        .order('name'),
    ]);

    if (templatesRes.data) {
      setTemplates(templatesRes.data.map(t => ({
        id: t.id,
        name: t.name,
        focus: t.focus || '',
        duration_minutes: t.duration_minutes,
        exercise_count: Array.isArray(t.workout_template_exercises) ? t.workout_template_exercises.length : 0,
        created_at: t.created_at,
      })));
    }
    if (exercisesRes.data) setExercises(exercisesRes.data as Exercise[]);
    setLoading(false);
  };

  // Exercise filtering
  const filteredExercises = exercises.filter(e => {
    const matchSearch = !exerciseSearch || e.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchGroup = exerciseFilter === 'All' || e.muscle_group === exerciseFilter;
    return matchSearch && matchGroup;
  });

  const exercisesByMuscle = filteredExercises.reduce((acc, e) => {
    if (!acc[e.muscle_group]) acc[e.muscle_group] = [];
    acc[e.muscle_group].push(e);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const addExercise = (exerciseId: string) => {
    const ex = exercises.find(e => e.id === exerciseId);
    if (!ex) return;
    if (selectedExercises.some(se => se.exerciseId === exerciseId)) {
      toast.error('Exercise already added.');
      return;
    }
    setSelectedExercises(prev => [...prev, {
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscle_group,
      sets: 3,
      reps: '8-12',
      restSeconds: 90,
    }]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof SelectedExercise, value: string | number) => {
    setSelectedExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  const createCustomExercise = async () => {
    if (!userId || !newExercise.name.trim()) {
      toast.error('Exercise name is required.');
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('exercises').insert({
      name: newExercise.name.trim(),
      muscle_group: newExercise.muscle_group,
      instructions: newExercise.instructions || null,
      equipment_required: newExercise.equipment
        ? newExercise.equipment.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      created_by: userId,
    }).select().single();

    if (error) {
      toast.error('Failed to create exercise.');
      return;
    }

    if (data) {
      setExercises(prev => [...prev, data as Exercise].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`"${data.name}" created!`);
      setNewExercise({ name: '', muscle_group: 'Chest', instructions: '', equipment: '' });
      setShowCreateExercise(false);
    }
  };

  const saveTemplate = async (startNow: boolean) => {
    if (!userId) return;
    if (mode === 'builder' && !builderForm.name.trim()) {
      toast.error('Workout name is required.');
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error('Add at least one exercise.');
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const templateName = mode === 'quick'
      ? `Quick Workout - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : builderForm.name.trim();

    try {
      if (editingTemplateId) {
        // Update existing template
        await supabase.from('workout_templates').update({
          name: templateName,
          focus: builderForm.focus || null,
          duration_minutes: parseInt(builderForm.duration_minutes) || 45,
        }).eq('id', editingTemplateId);

        // Delete old exercises and re-insert
        await supabase.from('workout_template_exercises').delete().eq('template_id', editingTemplateId);

        const exerciseRows = selectedExercises.map((ex, i) => ({
          template_id: editingTemplateId,
          exercise_id: ex.exerciseId,
          order_index: i,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds,
        }));
        await supabase.from('workout_template_exercises').insert(exerciseRows);

        toast.success('Workout updated!');
      } else {
        // Create new template
        const { data: template, error: templateError } = await supabase
          .from('workout_templates')
          .insert({
            name: templateName,
            focus: builderForm.focus || null,
            duration_minutes: parseInt(builderForm.duration_minutes) || 45,
            created_for_client_id: userId,
            is_custom: true,
            created_by: userId,
          })
          .select()
          .single();

        if (templateError || !template) throw new Error('Failed to create template');

        const exerciseRows = selectedExercises.map((ex, i) => ({
          template_id: template.id,
          exercise_id: ex.exerciseId,
          order_index: i,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.restSeconds,
        }));

        const { error: exError } = await supabase.from('workout_template_exercises').insert(exerciseRows);
        if (exError) throw new Error('Failed to add exercises');

        if (startNow) {
          const today = new Date().toISOString().split('T')[0];
          // Check if today already has a workout
          const { data: existing } = await supabase
            .from('assigned_workouts')
            .select('id')
            .eq('client_id', userId)
            .eq('workout_date', today)
            .single();

          if (existing) {
            toast.error('You already have a workout scheduled for today. Use "Schedule" to pick another date.');
            setSaving(false);
            await fetchData();
            resetBuilder();
            return;
          }

          await supabase.from('assigned_workouts').insert({
            client_id: userId,
            template_id: template.id,
            workout_date: today,
            status: 'scheduled',
          });

          toast.success('Workout created! Redirecting...');
          router.push('/dashboard/workouts');
          return;
        }

        toast.success('Workout saved!');
      }

      await fetchData();
      resetBuilder();
    } catch {
      toast.error('Failed to save workout.');
    }
    setSaving(false);
  };

  const resetBuilder = () => {
    setMode('list');
    setBuilderForm({ name: '', focus: '', duration_minutes: '45' });
    setSelectedExercises([]);
    setEditingTemplateId(null);
    setExerciseSearch('');
    setExerciseFilter('All');
  };

  const editTemplate = async (templateId: string) => {
    const supabase = createClient();
    const { data: template } = await supabase
      .from('workout_templates')
      .select('id, name, focus, duration_minutes')
      .eq('id', templateId)
      .single();

    const { data: templateExercises } = await supabase
      .from('workout_template_exercises')
      .select('exercise_id, sets, reps, rest_seconds, order_index, exercise:exercises(id, name, muscle_group)')
      .eq('template_id', templateId)
      .order('order_index');

    if (template && templateExercises) {
      setBuilderForm({
        name: template.name || '',
        focus: template.focus || '',
        duration_minutes: String(template.duration_minutes || 45),
      });
      setSelectedExercises(templateExercises.map(te => {
        const ex = Array.isArray(te.exercise) ? te.exercise[0] : te.exercise;
        return {
          exerciseId: te.exercise_id,
          exerciseName: ex?.name || 'Unknown',
          muscleGroup: ex?.muscle_group || '',
          sets: te.sets,
          reps: te.reps,
          restSeconds: te.rest_seconds,
        };
      }));
      setEditingTemplateId(templateId);
      setMode('builder');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    const supabase = createClient();
    await supabase.from('workout_template_exercises').delete().eq('template_id', templateId);
    await supabase.from('workout_templates').delete().eq('id', templateId);
    toast.success('Workout deleted.');
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const startTemplate = async (templateId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('assigned_workouts')
      .select('id')
      .eq('client_id', userId)
      .eq('workout_date', today)
      .single();

    if (existing) {
      toast.error('You already have a workout scheduled for today. Use "Schedule" to pick another date.');
      return;
    }

    await supabase.from('assigned_workouts').insert({
      client_id: userId,
      template_id: templateId,
      workout_date: today,
      status: 'scheduled',
    });

    toast.success('Workout scheduled! Redirecting...');
    router.push('/dashboard/workouts');
  };

  const scheduleTemplate = async () => {
    if (!userId || !scheduleTemplateId || !scheduleDate) return;
    setScheduling(true);

    const supabase = createClient();
    const { data: existing } = await supabase
      .from('assigned_workouts')
      .select('id')
      .eq('client_id', userId)
      .eq('workout_date', scheduleDate)
      .single();

    if (existing) {
      toast.error('You already have a workout on that date.');
      setScheduling(false);
      return;
    }

    const { error } = await supabase.from('assigned_workouts').insert({
      client_id: userId,
      template_id: scheduleTemplateId,
      workout_date: scheduleDate,
      status: 'scheduled',
    });

    if (error) {
      toast.error('Failed to schedule workout.');
    } else {
      toast.success(`Workout scheduled for ${new Date(scheduleDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}!`);
    }

    setScheduleTemplateId(null);
    setScheduleDate('');
    setScheduling(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-grey-400" />
      </div>
    );
  }

  // Builder / Quick Workout view
  if (mode === 'builder' || mode === 'quick') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              {editingTemplateId ? 'Edit Workout' : mode === 'quick' ? 'Quick Workout' : 'Create Workout'}
            </h1>
            <p className="text-grey-600 text-sm mt-1">
              {mode === 'quick' ? 'Pick exercises and start right away' : 'Build a reusable workout template'}
            </p>
          </div>
          <button onClick={resetBuilder} className="p-2 text-grey-400 hover:text-grey-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workout Details (builder only) */}
        {mode === 'builder' && (
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Workout Name *</label>
                  <input
                    type="text"
                    value={builderForm.name}
                    onChange={e => setBuilderForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Upper Body Push"
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">Focus Area</label>
                    <input
                      type="text"
                      value={builderForm.focus}
                      onChange={e => setBuilderForm(prev => ({ ...prev, focus: e.target.value }))}
                      placeholder="e.g. Chest, Shoulders"
                      className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={builderForm.duration_minutes}
                      onChange={e => setBuilderForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Selector */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black">Add Exercises</h3>
              <button
                onClick={() => setShowCreateExercise(!showCreateExercise)}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Create Custom Exercise
              </button>
            </div>

            {/* Custom Exercise Form */}
            {showCreateExercise && (
              <div className="bg-blue-50 border border-blue-200 p-4 mb-4 space-y-3">
                <p className="text-sm font-semibold text-black">New Exercise</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-grey-600 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newExercise.name}
                      onChange={e => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Exercise name"
                      className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-grey-600 mb-1">Muscle Group</label>
                    <select
                      value={newExercise.muscle_group}
                      onChange={e => setNewExercise(prev => ({ ...prev, muscle_group: e.target.value }))}
                      className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                    >
                      {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-grey-600 mb-1">Instructions</label>
                  <textarea
                    value={newExercise.instructions}
                    onChange={e => setNewExercise(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Step-by-step instructions (optional)"
                    rows={2}
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-grey-600 mb-1">Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={newExercise.equipment}
                    onChange={e => setNewExercise(prev => ({ ...prev, equipment: e.target.value }))}
                    placeholder="e.g. Barbell, Bench"
                    className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createCustomExercise} size="sm">Save Exercise</Button>
                  <button onClick={() => setShowCreateExercise(false)} className="text-sm text-grey-500 hover:text-grey-700">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={e => setExerciseSearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-9 pr-3 py-2 border border-grey-300 text-black text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <select
                value={exerciseFilter}
                onChange={e => setExerciseFilter(e.target.value)}
                className="border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Muscles</option>
                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Grouped Exercise Selector */}
            <select
              onChange={e => {
                if (e.target.value) {
                  addExercise(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
              defaultValue=""
            >
              <option value="">+ Select exercise to add...</option>
              {Object.entries(exercisesByMuscle).map(([group, exs]) => (
                <optgroup key={group} label={group}>
                  {exs.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-grey-700">
              Exercises ({selectedExercises.length})
            </h3>
            {selectedExercises.map((ex, index) => (
              <Card key={index}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-grey-100 flex items-center justify-center text-xs font-bold text-grey-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-black text-sm">{ex.exerciseName}</p>
                        <p className="text-xs text-grey-500">{ex.muscleGroup}</p>
                      </div>
                    </div>
                    <button onClick={() => removeExercise(index)} className="p-1 text-grey-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-grey-500 mb-1">Sets</label>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={e => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full border border-grey-300 px-3 py-2 text-black text-sm text-center focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-grey-500 mb-1">Reps</label>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={e => updateExercise(index, 'reps', e.target.value)}
                        placeholder="8-12"
                        className="w-full border border-grey-300 px-3 py-2 text-black text-sm text-center focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-grey-500 mb-1">Rest (sec)</label>
                      <input
                        type="number"
                        value={ex.restSeconds}
                        onChange={e => updateExercise(index, 'restSeconds', parseInt(e.target.value) || 30)}
                        min="0"
                        step="15"
                        className="w-full border border-grey-300 px-3 py-2 text-black text-sm text-center focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {mode === 'builder' && (
            <Button onClick={() => saveTemplate(false)} disabled={saving} className="w-full" size="lg">
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Dumbbell className="h-5 w-5 mr-2" />}
              {editingTemplateId ? 'Update Workout' : 'Save Template'}
            </Button>
          )}
          {!editingTemplateId && (
            <Button
              onClick={() => saveTemplate(true)}
              disabled={saving}
              className="w-full"
              size="lg"
              variant={mode === 'quick' ? 'primary' : 'outline'}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {mode === 'quick' ? 'Start Workout' : 'Save & Start Now'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Template List view
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">My Workouts</h1>
        <p className="text-grey-600 text-sm mt-1">Build your own workouts and schedule them</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setMode('builder')} className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Workout
        </Button>
        <button
          onClick={() => setMode('quick')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          <Zap className="h-5 w-5" />
          Quick Workout
        </button>
      </div>

      {/* Saved Templates */}
      {templates.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-grey-700">Saved Workouts</h3>
          {templates.map(template => (
            <Card key={template.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-black">{template.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-grey-500">
                      {template.focus && <span>{template.focus}</span>}
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" /> {template.exercise_count} exercises
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {template.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => startTemplate(template.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-3 w-3" /> Start
                  </button>
                  <button
                    onClick={() => { setScheduleTemplateId(template.id); setScheduleDate(''); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="h-3 w-3" /> Schedule
                  </button>
                  <button
                    onClick={() => editTemplate(template.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-grey-300 text-grey-600 hover:bg-grey-50 transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Dumbbell className="h-12 w-12 mx-auto text-grey-300 mb-4" />
            <p className="text-grey-600 text-sm">No custom workouts yet.</p>
            <p className="text-grey-400 text-xs mt-1">
              Create a workout template or start a quick workout.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schedule Modal */}
      {scheduleTemplateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">Schedule Workout</h3>
              <button onClick={() => setScheduleTemplateId(null)} className="p-1 text-grey-400 hover:text-grey-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-grey-700 mb-1">Select Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-grey-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <Button onClick={scheduleTemplate} disabled={!scheduleDate || scheduling} className="w-full">
              {scheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
              Schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
