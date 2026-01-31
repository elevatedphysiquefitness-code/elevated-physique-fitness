'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Dumbbell,
  Clock,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  created_at: string;
  program_type?: string;
  days_per_week?: number;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
}

interface WorkoutExercise {
  id?: string;
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}

interface WorkoutDay {
  id?: string;
  day_number: number;
  name: string;
  focus: string;
  description: string;
  duration_minutes: number;
  exercises: WorkoutExercise[];
  isExpanded: boolean;
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [assignedClients, setAssignedClients] = useState<number>(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_weeks: 12,
    program_type: 'strength',
    days_per_week: 4,
  });

  // AI Generation state
  const [showAIModal, setShowAIModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiSettings, setAISettings] = useState({
    programType: 'strength',
    fitnessLevel: 'intermediate',
    daysPerWeek: 4,
    equipment: 'commercial_gym',
    focusAreas: ['full_body'] as string[],
    durationWeeks: 4,
  });

  useEffect(() => {
    fetchProgramData();
    fetchExercises();
  }, [programId]);

  const fetchExercises = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('exercises')
      .select('id, name, muscle_group, equipment')
      .order('muscle_group')
      .order('name');
    if (data) setAllExercises(data);
  };

  const fetchProgramData = async () => {
    const supabase = createClient();

    // Fetch program
    const { data: programData, error } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error || !programData) {
      console.error('Error fetching program:', error);
      setLoading(false);
      return;
    }

    setProgram(programData);
    setFormData({
      title: programData.title || '',
      description: programData.description || '',
      duration_weeks: programData.duration_weeks || 12,
      program_type: programData.program_type || 'strength',
      days_per_week: programData.days_per_week || 4,
    });

    // Fetch workout templates (days) for this program
    const { data: templateData } = await supabase
      .from('workout_templates')
      .select(`
        id,
        title,
        name,
        focus,
        description,
        duration_minutes,
        day_number,
        workout_template_exercises (
          id,
          exercise_id,
          sets,
          reps,
          rest_seconds,
          notes,
          order_index,
          exercises (id, name, muscle_group)
        )
      `)
      .eq('program_id', programId)
      .order('day_number', { ascending: true });

    if (templateData && templateData.length > 0) {
      const days: WorkoutDay[] = templateData.map((t: any, index: number) => ({
        id: t.id,
        day_number: t.day_number || index + 1,
        name: t.name || t.title || `Day ${index + 1}`,
        focus: t.focus || '',
        description: t.description || '',
        duration_minutes: t.duration_minutes || 45,
        isExpanded: false,
        exercises: (t.workout_template_exercises || []).map((ex: any) => ({
          id: ex.id,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercises?.name || 'Unknown',
          muscle_group: ex.exercises?.muscle_group || '',
          sets: ex.sets || 3,
          reps: ex.reps || '10',
          rest_seconds: ex.rest_seconds || 60,
          notes: ex.notes || '',
          order_index: ex.order_index || 0,
        })),
      }));
      setWorkoutDays(days);
    }

    // Count assigned clients
    const { count } = await supabase
      .from('client_programs')
      .select('*', { count: 'exact', head: true })
      .eq('program_id', programId);

    setAssignedClients(count || 0);
    setLoading(false);
  };

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      day_number: workoutDays.length + 1,
      name: `Day ${workoutDays.length + 1}`,
      focus: '',
      description: '',
      duration_minutes: 45,
      exercises: [],
      isExpanded: true,
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  const updateWorkoutDay = (index: number, updates: Partial<WorkoutDay>) => {
    const updated = [...workoutDays];
    updated[index] = { ...updated[index], ...updates };
    setWorkoutDays(updated);
  };

  const removeWorkoutDay = (index: number) => {
    if (!confirm('Remove this workout day?')) return;
    const updated = workoutDays.filter((_, i) => i !== index);
    // Renumber days
    updated.forEach((day, i) => {
      day.day_number = i + 1;
    });
    setWorkoutDays(updated);
  };

  const addExerciseToDay = (dayIndex: number, exerciseId: string) => {
    const exercise = allExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newExercise: WorkoutExercise = {
      exercise_id: exerciseId,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: '10',
      rest_seconds: 60,
      notes: '',
      order_index: workoutDays[dayIndex].exercises.length,
    };

    const updated = [...workoutDays];
    updated[dayIndex].exercises.push(newExercise);
    setWorkoutDays(updated);
  };

  const updateExercise = (dayIndex: number, exIndex: number, updates: Partial<WorkoutExercise>) => {
    const updated = [...workoutDays];
    updated[dayIndex].exercises[exIndex] = {
      ...updated[dayIndex].exercises[exIndex],
      ...updates,
    };
    setWorkoutDays(updated);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const updated = [...workoutDays];
    updated[dayIndex].exercises.splice(exIndex, 1);
    // Renumber order indices
    updated[dayIndex].exercises.forEach((ex, i) => {
      ex.order_index = i;
    });
    setWorkoutDays(updated);
  };

  const saveProgram = async () => {
    if (!formData.title.trim()) {
      alert('Program title is required');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Update program details
    const { error: programError } = await supabase
      .from('workout_programs')
      .update({
        title: formData.title,
        description: formData.description,
        duration_weeks: formData.duration_weeks,
        program_type: formData.program_type,
        days_per_week: formData.days_per_week,
      })
      .eq('id', programId);

    if (programError) {
      alert('Failed to save program. Please try again.');
      console.error('Error saving program:', programError);
      setSaving(false);
      return;
    }

    // Save workout days (templates)
    for (const day of workoutDays) {
      let templateId = day.id;

      if (templateId) {
        // Update existing template
        await supabase
          .from('workout_templates')
          .update({
            name: day.name,
            title: day.name,
            focus: day.focus,
            description: day.description,
            duration_minutes: day.duration_minutes,
            day_number: day.day_number,
          })
          .eq('id', templateId);
      } else {
        // Create new template
        const { data: newTemplate, error: templateError } = await supabase
          .from('workout_templates')
          .insert({
            name: day.name,
            title: day.name,
            focus: day.focus,
            description: day.description,
            duration_minutes: day.duration_minutes,
            day_number: day.day_number,
            program_id: programId,
            created_by: user?.id,
          })
          .select()
          .single();

        if (templateError) {
          console.error('Error creating template:', templateError);
          continue;
        }
        templateId = newTemplate.id;
      }

      // Delete existing template exercises
      await supabase
        .from('workout_template_exercises')
        .delete()
        .eq('template_id', templateId);

      // Insert all exercises for this day
      if (day.exercises.length > 0) {
        const exerciseInserts = day.exercises.map((ex, index) => ({
          template_id: templateId,
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          order_index: index,
        }));

        const { error: exError } = await supabase
          .from('workout_template_exercises')
          .insert(exerciseInserts);

        if (exError) {
          console.error('Error inserting exercises:', exError);
        }
      }
    }

    // Delete removed templates
    const currentTemplateIds = workoutDays.filter(d => d.id).map(d => d.id);
    if (currentTemplateIds.length > 0) {
      await supabase
        .from('workout_templates')
        .delete()
        .eq('program_id', programId)
        .not('id', 'in', `(${currentTemplateIds.join(',')})`);
    }

    alert('Program saved successfully!');
    setSaving(false);
    fetchProgramData();
  };

  const generateWithAI = async () => {
    setGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          ...aiSettings,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate program');
      }

      // Refresh program data
      await fetchProgramData();
      setShowAIModal(false);
      alert('Program generated successfully!');
    } catch (error) {
      console.error('Error generating program:', error);
      alert('Failed to generate program. Please try again.');
    }

    setGenerating(false);
  };

  const deleteProgram = async () => {
    if (assignedClients > 0) {
      alert(`Cannot delete: ${assignedClients} client(s) are assigned to this program.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this program? This cannot be undone.')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', programId);

    if (error) {
      alert('Failed to delete program.');
      console.error('Error deleting program:', error);
      return;
    }

    router.push('/admin/programs');
  };

  // Group exercises by muscle group for dropdown
  const exercisesByMuscle = allExercises.reduce((acc, ex) => {
    const group = ex.muscle_group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-brown-500">Loading...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-brown-500">Program not found</p>
        <Button href="/admin/programs" variant="outline" className="mt-4">
          Back to Programs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-brown-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-brown-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-brown-900">Edit Program</h1>
          <p className="text-brown-600">
            {assignedClients} client{assignedClients !== 1 ? 's' : ''} assigned
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAIModal(true)} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          <Button onClick={deleteProgram} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={saveProgram} variant="primary" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Program Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-brown-900">Program Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Strength Building Phase 1"
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Program Type
                  </label>
                  <select
                    value={formData.program_type}
                    onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                  >
                    <option value="strength">Strength Building</option>
                    <option value="hypertrophy">Hypertrophy (Muscle Building)</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="endurance">Endurance</option>
                    <option value="powerlifting">Powerlifting</option>
                    <option value="athletic">Athletic Performance</option>
                    <option value="general">General Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Days Per Week
                  </label>
                  <select
                    value={formData.days_per_week}
                    onChange={(e) => setFormData({ ...formData, days_per_week: parseInt(e.target.value) })}
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                  >
                    {[2, 3, 4, 5, 6].map((days) => (
                      <option key={days} value={days}>
                        {days} days per week
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Duration (weeks)
                  </label>
                  <select
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                  >
                    {[4, 6, 8, 10, 12, 16, 20, 24].map((weeks) => (
                      <option key={weeks} value={weeks}>
                        {weeks} weeks
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe the program goals and structure..."
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workout Days */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-brown-900">Workout Days</h2>
                <Button onClick={addWorkoutDay} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Day
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workoutDays.length > 0 ? (
                <div className="space-y-4">
                  {workoutDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border border-brown-200 bg-brown-50"
                    >
                      {/* Day Header */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-brown-100"
                        onClick={() => updateWorkoutDay(dayIndex, { isExpanded: !day.isExpanded })}
                      >
                        <div className="w-10 h-10 bg-brown-700 flex items-center justify-center text-white font-bold">
                          {day.day_number}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={day.name}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateWorkoutDay(dayIndex, { name: e.target.value });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-brown-900 bg-transparent border-b border-transparent hover:border-brown-300 focus:border-brown-600 focus:outline-none w-full"
                            placeholder="Day name..."
                          />
                          <p className="text-sm text-brown-500 mt-1">
                            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''} • {day.duration_minutes} min
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWorkoutDay(dayIndex);
                          }}
                          className="p-2 text-brown-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {day.isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-brown-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-brown-400" />
                        )}
                      </div>

                      {/* Day Content */}
                      {day.isExpanded && (
                        <div className="border-t border-brown-200 p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-brown-700 mb-1">Focus</label>
                              <input
                                type="text"
                                value={day.focus}
                                onChange={(e) => updateWorkoutDay(dayIndex, { focus: e.target.value })}
                                placeholder="e.g., Upper Body, Legs"
                                className="w-full border border-brown-300 px-3 py-2 text-sm text-brown-900 focus:outline-none focus:border-brown-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-brown-700 mb-1">Duration (min)</label>
                              <input
                                type="number"
                                value={day.duration_minutes}
                                onChange={(e) => updateWorkoutDay(dayIndex, { duration_minutes: parseInt(e.target.value) || 45 })}
                                className="w-full border border-brown-300 px-3 py-2 text-sm text-brown-900 focus:outline-none focus:border-brown-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-brown-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={day.description}
                                onChange={(e) => updateWorkoutDay(dayIndex, { description: e.target.value })}
                                placeholder="Brief description..."
                                className="w-full border border-brown-300 px-3 py-2 text-sm text-brown-900 focus:outline-none focus:border-brown-600"
                              />
                            </div>
                          </div>

                          {/* Exercises */}
                          <div>
                            <h4 className="text-sm font-medium text-brown-900 mb-2">Exercises</h4>
                            {day.exercises.length > 0 ? (
                              <div className="space-y-2">
                                {day.exercises.map((ex, exIndex) => (
                                  <div
                                    key={exIndex}
                                    className="flex items-center gap-2 p-3 bg-white border border-brown-200"
                                  >
                                    <GripVertical className="h-4 w-4 text-brown-300" />
                                    <span className="w-6 text-center text-sm font-medium text-brown-500">
                                      {exIndex + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-brown-900 text-sm truncate">{ex.exercise_name}</p>
                                      <p className="text-xs text-brown-500">{ex.muscle_group}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={ex.sets}
                                        onChange={(e) => updateExercise(dayIndex, exIndex, { sets: parseInt(e.target.value) || 3 })}
                                        className="w-14 border border-brown-300 px-2 py-1 text-xs text-center text-brown-900"
                                        placeholder="Sets"
                                      />
                                      <span className="text-brown-400 text-xs">×</span>
                                      <input
                                        type="text"
                                        value={ex.reps}
                                        onChange={(e) => updateExercise(dayIndex, exIndex, { reps: e.target.value })}
                                        className="w-16 border border-brown-300 px-2 py-1 text-xs text-center text-brown-900"
                                        placeholder="Reps"
                                      />
                                      <input
                                        type="number"
                                        value={ex.rest_seconds}
                                        onChange={(e) => updateExercise(dayIndex, exIndex, { rest_seconds: parseInt(e.target.value) || 60 })}
                                        className="w-16 border border-brown-300 px-2 py-1 text-xs text-center text-brown-900"
                                        placeholder="Rest"
                                      />
                                      <span className="text-brown-400 text-xs">sec</span>
                                    </div>
                                    <button
                                      onClick={() => removeExercise(dayIndex, exIndex)}
                                      className="p-1 text-brown-400 hover:text-red-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-brown-400 text-center py-4">No exercises added yet</p>
                            )}

                            {/* Add Exercise */}
                            <div className="mt-3">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addExerciseToDay(dayIndex, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full border border-brown-300 px-3 py-2 text-sm text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                                defaultValue=""
                              >
                                <option value="">+ Add exercise...</option>
                                {Object.entries(exercisesByMuscle).map(([group, exercises]) => (
                                  <optgroup key={group} label={group}>
                                    {exercises.map((ex) => (
                                      <option key={ex.id} value={ex.id}>
                                        {ex.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-brown-50">
                  <Dumbbell className="h-10 w-10 mx-auto text-brown-300 mb-3" />
                  <p className="text-brown-500 text-sm mb-4">No workout days yet</p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={addWorkoutDay} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Day Manually
                    </Button>
                    <Button onClick={() => setShowAIModal(true)} variant="primary" size="sm">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-brown-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-brown-600" />
                Assigned Clients
              </h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-brown-900">{assignedClients}</p>
                <p className="text-brown-500 text-sm mt-1">
                  client{assignedClients !== 1 ? 's' : ''} using this program
                </p>
              </div>
              <Button href={`/admin/clients?program=${programId}&programName=${encodeURIComponent(formData.title)}`} variant="outline" className="w-full mt-4">
                View Clients
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-brown-900">Program Summary</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brown-500">Type</span>
                <span className="text-brown-900 capitalize">{formData.program_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-500">Duration</span>
                <span className="text-brown-900">{formData.duration_weeks} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-500">Days/Week</span>
                <span className="text-brown-900">{formData.days_per_week} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-500">Workout Days</span>
                <span className="text-brown-900">{workoutDays.length} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brown-500">Total Exercises</span>
                <span className="text-brown-900">
                  {workoutDays.reduce((sum, d) => sum + d.exercises.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-brown-900">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button href="/admin/exercises" variant="outline" className="w-full justify-start">
                <Dumbbell className="h-4 w-4 mr-2" />
                Manage Exercises
              </Button>
              <Button onClick={() => setShowAIModal(true)} variant="outline" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Generate Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-brown-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brown-600" />
                  Generate Program with AI
                </h3>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="p-2 hover:bg-brown-100"
                >
                  <X className="h-5 w-5 text-brown-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Program Type
                  </label>
                  <select
                    value={aiSettings.programType}
                    onChange={(e) => setAISettings({ ...aiSettings, programType: e.target.value })}
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                  >
                    <option value="strength">Strength Building</option>
                    <option value="hypertrophy">Hypertrophy (Muscle Building)</option>
                    <option value="fat_loss">Fat Loss</option>
                    <option value="endurance">Endurance</option>
                    <option value="powerlifting">Powerlifting</option>
                    <option value="athletic">Athletic Performance</option>
                    <option value="general">General Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Fitness Level
                  </label>
                  <select
                    value={aiSettings.fitnessLevel}
                    onChange={(e) => setAISettings({ ...aiSettings, fitnessLevel: e.target.value })}
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown-900 mb-2">
                      Days Per Week
                    </label>
                    <select
                      value={aiSettings.daysPerWeek}
                      onChange={(e) => setAISettings({ ...aiSettings, daysPerWeek: parseInt(e.target.value) })}
                      className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                    >
                      {[2, 3, 4, 5, 6].map((days) => (
                        <option key={days} value={days}>{days} days</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brown-900 mb-2">
                      Duration (weeks)
                    </label>
                    <select
                      value={aiSettings.durationWeeks}
                      onChange={(e) => setAISettings({ ...aiSettings, durationWeeks: parseInt(e.target.value) })}
                      className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                    >
                      {[4, 6, 8, 12].map((weeks) => (
                        <option key={weeks} value={weeks}>{weeks} weeks</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Equipment Available
                  </label>
                  <select
                    value={aiSettings.equipment}
                    onChange={(e) => setAISettings({ ...aiSettings, equipment: e.target.value })}
                    className="w-full border border-brown-300 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-600 bg-white"
                  >
                    <option value="commercial_gym">Full Commercial Gym</option>
                    <option value="home_gym">Home Gym (Barbell, Dumbbells, Bench)</option>
                    <option value="minimal">Minimal (Dumbbells & Bands)</option>
                    <option value="bodyweight">Bodyweight Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Focus Areas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'full_body', label: 'Full Body' },
                      { value: 'upper_body', label: 'Upper Body' },
                      { value: 'lower_body', label: 'Lower Body' },
                      { value: 'push', label: 'Push Muscles' },
                      { value: 'pull', label: 'Pull Muscles' },
                      { value: 'core', label: 'Core' },
                    ].map((area) => (
                      <label key={area.value} className="flex items-center gap-2 p-2 border border-brown-200 cursor-pointer hover:bg-brown-50">
                        <input
                          type="checkbox"
                          checked={aiSettings.focusAreas.includes(area.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAISettings({ ...aiSettings, focusAreas: [...aiSettings.focusAreas, area.value] });
                            } else {
                              setAISettings({ ...aiSettings, focusAreas: aiSettings.focusAreas.filter(f => f !== area.value) });
                            }
                          }}
                          className="text-brown-600"
                        />
                        <span className="text-sm text-brown-900">{area.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setShowAIModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateWithAI}
                  variant="primary"
                  className="flex-1"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Program
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
