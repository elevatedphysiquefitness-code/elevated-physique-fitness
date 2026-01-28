'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Video,
  X,
  Save,
  PlayCircle,
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  youtube_url: string | null;
  instructions: string | null;
  difficulty_level: string | null;
  equipment_required: string[] | null;
  is_compound: boolean;
  primary_muscles: string[] | null;
  secondary_muscles: string[] | null;
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Core', 'Full Body', 'Cardio',
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const emptyExercise = {
  name: '',
  description: '',
  muscle_group: 'Chest',
  youtube_url: '',
  instructions: '',
  difficulty_level: 'beginner',
  equipment_required: '',
  is_compound: false,
  primary_muscles: '',
  secondary_muscles: '',
};

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyExercise);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name');
    if (data) setExercises(data);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyExercise);
    setShowModal(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name,
      description: exercise.description || '',
      muscle_group: exercise.muscle_group,
      youtube_url: exercise.youtube_url || '',
      instructions: exercise.instructions || '',
      difficulty_level: exercise.difficulty_level || 'beginner',
      equipment_required: exercise.equipment_required?.join(', ') || '',
      is_compound: exercise.is_compound,
      primary_muscles: exercise.primary_muscles?.join(', ') || '',
      secondary_muscles: exercise.secondary_muscles?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      muscle_group: form.muscle_group,
      youtube_url: form.youtube_url.trim() || null,
      instructions: form.instructions.trim() || null,
      difficulty_level: form.difficulty_level || null,
      equipment_required: form.equipment_required ? form.equipment_required.split(',').map(s => s.trim()).filter(Boolean) : null,
      is_compound: form.is_compound,
      primary_muscles: form.primary_muscles ? form.primary_muscles.split(',').map(s => s.trim()).filter(Boolean) : null,
      secondary_muscles: form.secondary_muscles ? form.secondary_muscles.split(',').map(s => s.trim()).filter(Boolean) : null,
    };

    if (editingId) {
      await supabase.from('exercises').update(payload).eq('id', editingId);
    } else {
      await supabase.from('exercises').insert(payload);
    }

    setShowModal(false);
    setSaving(false);
    fetchExercises();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exercise? This cannot be undone.')) return;
    const supabase = createClient();
    await supabase.from('exercises').delete().eq('id', id);
    setExercises(exercises.filter(e => e.id !== id));
  };

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGroup = filterGroup === 'All' || e.muscle_group === filterGroup;
    return matchSearch && matchGroup;
  });

  const groupCounts = exercises.reduce<Record<string, number>>((acc, e) => {
    acc[e.muscle_group] = (acc[e.muscle_group] || 0) + 1;
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-black">Exercise Library</h1>
          <p className="text-grey-600 mt-1">{exercises.length} exercises total</p>
        </div>
        <Button onClick={openCreate} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="w-full sm:w-48 border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="All">All Groups ({exercises.length})</option>
          {MUSCLE_GROUPS.map(g => (
            <option key={g} value={g}>{g} ({groupCounts[g] || 0})</option>
          ))}
        </select>
      </div>

      {/* Exercise Table */}
      <div className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-grey-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-black">Exercise</th>
                <th className="text-left px-4 py-3 font-semibold text-black">Muscle Group</th>
                <th className="text-left px-4 py-3 font-semibold text-black">Level</th>
                <th className="text-center px-4 py-3 font-semibold text-black">Video</th>
                <th className="text-right px-4 py-3 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-200">
              {filtered.map(exercise => (
                <tr key={exercise.id} className="hover:bg-grey-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">{exercise.name}</p>
                    {exercise.description && (
                      <p className="text-grey-500 text-xs mt-0.5 line-clamp-1">{exercise.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1">
                      {exercise.muscle_group}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey-600 capitalize">
                    {exercise.difficulty_level || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {exercise.youtube_url ? (
                      <PlayCircle className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-grey-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(exercise)}
                        className="p-2 text-grey-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="p-2 text-grey-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Video className="h-10 w-10 mx-auto text-grey-300 mb-3" />
            <p className="text-grey-500">No exercises found</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">
                  {editingId ? 'Edit Exercise' : 'Add New Exercise'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-grey-400 hover:text-black">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Barbell Bench Press"
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Muscle Group *</label>
                    <select
                      value={form.muscle_group}
                      onChange={e => setForm({ ...form, muscle_group: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Difficulty</label>
                    <select
                      value={form.difficulty_level}
                      onChange={e => setForm({ ...form, difficulty_level: e.target.value })}
                      className="w-full border border-grey-300 px-4 py-3 text-black bg-white focus:outline-none focus:border-blue-600"
                    >
                      {DIFFICULTY_LEVELS.map(l => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={form.youtube_url}
                    onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description..."
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Instructions</label>
                  <textarea
                    value={form.instructions}
                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                    rows={3}
                    placeholder="Step-by-step instructions..."
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={form.equipment_required}
                    onChange={e => setForm({ ...form, equipment_required: e.target.value })}
                    placeholder="e.g., Barbell, Bench"
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Primary Muscles</label>
                    <input
                      type="text"
                      value={form.primary_muscles}
                      onChange={e => setForm({ ...form, primary_muscles: e.target.value })}
                      placeholder="e.g., Chest, Triceps"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Secondary Muscles</label>
                    <input
                      type="text"
                      value={form.secondary_muscles}
                      onChange={e => setForm({ ...form, secondary_muscles: e.target.value })}
                      placeholder="e.g., Shoulders"
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_compound}
                    onChange={e => setForm({ ...form, is_compound: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-black">Compound Movement</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button onClick={handleSave} variant="primary" className="flex-1" disabled={saving || !form.name.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
