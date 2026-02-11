'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Users, Calendar, Copy } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Program {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  created_at: string;
  client_count?: number;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: '',
    description: '',
    duration_weeks: 12,
  });
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from('workout_programs')
      .select(`
        *,
        client_programs (id)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const programsWithCount = data.map((p: any) => ({
        ...p,
        client_count: p.client_programs?.length || 0,
      }));
      setPrograms(programsWithCount);
    }

    setLoading(false);
  };

  const createProgram = async () => {
    if (!newProgram.title.trim()) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('workout_programs')
      .insert({
        title: newProgram.title,
        description: newProgram.description,
        duration_weeks: newProgram.duration_weeks,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create program. Please try again.');
      console.error('Error creating program:', error);
    } else if (data) {
      setPrograms([{ ...data, client_count: 0 }, ...programs]);
      setNewProgram({ title: '', description: '', duration_weeks: 12 });
      setShowCreateModal(false);
    }

    setSaving(false);
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('workout_programs').delete().eq('id', id);
    if (error) {
      alert('Failed to delete program.');
      console.error('Error deleting program:', error);
      return;
    }
    setPrograms(programs.filter((p) => p.id !== id));
  };

  const duplicateProgram = async (programId: string, title: string) => {
    setDuplicating(programId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Get the original program
    const { data: originalProgram } = await supabase
      .from('workout_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (!originalProgram) {
      alert('Failed to find original program.');
      setDuplicating(null);
      return;
    }

    // 2. Create new program with "Copy of" prefix
    const { data: newProgram, error: programError } = await supabase
      .from('workout_programs')
      .insert({
        title: `Copy of ${title}`,
        description: originalProgram.description,
        duration_weeks: originalProgram.duration_weeks,
        program_type: originalProgram.program_type,
        days_per_week: originalProgram.days_per_week,
        created_by: user?.id,
      })
      .select()
      .single();

    if (programError || !newProgram) {
      alert('Failed to duplicate program.');
      console.error('Error duplicating program:', programError);
      setDuplicating(null);
      return;
    }

    // 3. Get all workout templates for original program
    const { data: templates } = await supabase
      .from('workout_templates')
      .select(`
        *,
        workout_template_exercises (*)
      `)
      .eq('program_id', programId);

    if (templates && templates.length > 0) {
      // 4. Copy each template and its exercises
      for (const template of templates) {
        const { data: newTemplate } = await supabase
          .from('workout_templates')
          .insert({
            program_id: newProgram.id,
            name: template.name,
            title: template.title,
            focus: template.focus,
            description: template.description,
            duration_minutes: template.duration_minutes,
            day_number: template.day_number,
            created_by: user?.id,
          })
          .select()
          .single();

        if (newTemplate && template.workout_template_exercises?.length > 0) {
          // Copy exercises to new template
          const exerciseCopies = template.workout_template_exercises.map((ex: any) => ({
            template_id: newTemplate.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
            order_index: ex.order_index,
          }));

          await supabase.from('workout_template_exercises').insert(exerciseCopies);
        }
      }
    }

    // Add to programs list
    setPrograms([{ ...newProgram, client_count: 0 }, ...programs]);
    setDuplicating(null);
    alert(`Program duplicated as "Copy of ${title}"`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Workout Programs</h1>
          <p className="text-grey-600 mt-1">Create and manage training programs</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <div key={program.id} className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-black">{program.title}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => duplicateProgram(program.id, program.title)}
                  disabled={duplicating === program.id}
                  className="p-2 text-grey-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                  title="Duplicate program"
                >
                  {duplicating === program.id ? (
                    <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <Link
                  href={`/admin/programs/${program.id}`}
                  className="p-2 text-grey-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => deleteProgram(program.id)}
                  className="p-2 text-grey-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {program.description && (
              <p className="text-sm text-grey-600 mb-4 line-clamp-2">{program.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-grey-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{program.duration_weeks} weeks</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{program.client_count} clients</span>
              </div>
            </div>

            <Link
              href={`/admin/programs/${program.id}`}
              className="mt-4 block text-center py-2 bg-grey-100 text-grey-700 hover:bg-grey-200 transition-colors text-sm font-medium"
            >
              Edit Program
            </Link>
          </div>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="bg-white p-12 text-center">
          <p className="text-grey-500 mb-4">No programs created yet</p>
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Create Your First Program
          </Button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-black mb-6">Create New Program</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Program Name *
                </label>
                <input
                  type="text"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                  placeholder="e.g., Strength Building Phase 1"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description
                </label>
                <textarea
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the program..."
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Duration (weeks)
                </label>
                <select
                  value={newProgram.duration_weeks}
                  onChange={(e) => setNewProgram({ ...newProgram, duration_weeks: parseInt(e.target.value) })}
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                >
                  {[4, 6, 8, 10, 12, 16].map((weeks) => (
                    <option key={weeks} value={weeks}>
                      {weeks} weeks
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createProgram}
                variant="primary"
                className="flex-1"
                disabled={saving || !newProgram.title.trim()}
              >
                {saving ? 'Creating...' : 'Create Program'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
