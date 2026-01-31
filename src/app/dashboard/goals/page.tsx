'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Target,
  Plus,
  TrendingUp,
  Trophy,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Scale,
  Ruler,
  Star,
  X,
  ChevronRight,
  Award,
} from 'lucide-react';

interface Goal {
  id: string;
  goal_type: 'weight' | 'body_fat' | 'strength' | 'measurement' | 'habit' | 'custom';
  title: string;
  description: string | null;
  target_value: number | null;
  target_unit: string | null;
  current_value: number | null;
  start_value: number | null;
  target_date: string | null;
  exercise_id: string | null;
  status: 'active' | 'achieved' | 'abandoned';
  achieved_date: string | null;
  created_at: string;
}

interface Exercise {
  id: string;
  name: string;
}

const goalTypeConfig = {
  weight: { icon: Scale, color: 'bg-blue-600', label: 'Weight Goal', unit: 'lbs' },
  body_fat: { icon: TrendingUp, color: 'bg-green-600', label: 'Body Fat %', unit: '%' },
  strength: { icon: Dumbbell, color: 'bg-red-600', label: 'Strength Goal', unit: 'lbs' },
  measurement: { icon: Ruler, color: 'bg-purple-600', label: 'Measurement', unit: 'inches' },
  habit: { icon: CheckCircle2, color: 'bg-orange-600', label: 'Habit Goal', unit: 'days' },
  custom: { icon: Star, color: 'bg-grey-600', label: 'Custom Goal', unit: '' },
};

export default function GoalsPage() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'active' | 'achieved' | 'all'>('active');
  const [userId, setUserId] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState({
    goal_type: 'weight' as Goal['goal_type'],
    title: '',
    description: '',
    target_value: '',
    target_unit: 'lbs',
    current_value: '',
    start_value: '',
    target_date: '',
    exercise_id: '',
  });

  useEffect(() => {
    fetchGoals();
    fetchExercises();
  }, []);

  const fetchGoals = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setGoals(data as Goal[]);
    }

    setLoading(false);
  };

  const fetchExercises = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('exercises')
      .select('id, name')
      .order('name');

    if (data) {
      setExercises(data);
    }
  };

  const addGoal = async () => {
    if (!userId || !newGoal.title) return;

    const supabase = createClient();

    const goalData = {
      client_id: userId,
      goal_type: newGoal.goal_type,
      title: newGoal.title,
      description: newGoal.description || null,
      target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
      target_unit: newGoal.target_unit || null,
      current_value: newGoal.current_value ? parseFloat(newGoal.current_value) : null,
      start_value: newGoal.start_value ? parseFloat(newGoal.start_value) : (newGoal.current_value ? parseFloat(newGoal.current_value) : null),
      target_date: newGoal.target_date || null,
      exercise_id: newGoal.exercise_id || null,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('client_goals')
      .insert(goalData)
      .select()
      .single();

    if (data && !error) {
      setGoals([data as Goal, ...goals]);
      setShowAddModal(false);
      resetForm();
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    const supabase = createClient();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return;

    // Check if goal is achieved
    let isAchieved = false;
    if (goal.target_value !== null) {
      if (goal.goal_type === 'weight' || goal.goal_type === 'body_fat') {
        // For weight loss goals, achieved when current <= target
        isAchieved = newValue <= goal.target_value;
      } else {
        // For other goals, achieved when current >= target
        isAchieved = newValue >= goal.target_value;
      }
    }

    const updateData: Partial<Goal> = {
      current_value: newValue,
    };

    if (isAchieved && goal.status !== 'achieved') {
      updateData.status = 'achieved';
      updateData.achieved_date = new Date().toISOString().split('T')[0];
    }

    await supabase
      .from('client_goals')
      .update(updateData)
      .eq('id', goalId);

    setGoals(goals.map(g =>
      g.id === goalId ? { ...g, ...updateData } : g
    ));
  };

  const markGoalComplete = async (goalId: string) => {
    const supabase = createClient();

    await supabase
      .from('client_goals')
      .update({
        status: 'achieved',
        achieved_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', goalId);

    setGoals(goals.map(g =>
      g.id === goalId ? { ...g, status: 'achieved', achieved_date: new Date().toISOString().split('T')[0] } : g
    ));
  };

  const deleteGoal = async (goalId: string) => {
    const supabase = createClient();

    await supabase
      .from('client_goals')
      .delete()
      .eq('id', goalId);

    setGoals(goals.filter(g => g.id !== goalId));
  };

  const resetForm = () => {
    setNewGoal({
      goal_type: 'weight',
      title: '',
      description: '',
      target_value: '',
      target_unit: 'lbs',
      current_value: '',
      start_value: '',
      target_date: '',
      exercise_id: '',
    });
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.target_value || !goal.current_value) return 0;
    if (!goal.start_value) return 0;

    const totalChange = Math.abs(goal.target_value - goal.start_value);
    const currentChange = Math.abs(goal.current_value - goal.start_value);

    if (totalChange === 0) return goal.status === 'achieved' ? 100 : 0;

    return Math.min(Math.round((currentChange / totalChange) * 100), 100);
  };

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === 'all') return true;
    return goal.status === activeFilter;
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const achievedGoals = goals.filter(g => g.status === 'achieved');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Goals & Milestones</h1>
          <p className="mt-2 text-grey-600">Set targets and track your progress</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          <Plus className="mr-2 h-5 w-5" />
          Add Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{activeGoals.length}</p>
                <p className="text-sm text-grey-500">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{achievedGoals.length}</p>
                <p className="text-sm text-grey-500">Goals Achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{goals.length}</p>
                <p className="text-sm text-grey-500">Total Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {goals.length > 0 ? Math.round((achievedGoals.length / goals.length) * 100) : 0}%
                </p>
                <p className="text-sm text-grey-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['active', 'achieved', 'all'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && ` (${filter === 'active' ? activeGoals.length : achievedGoals.length})`}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-grey-100 mx-auto mb-6 flex items-center justify-center rounded-full">
              <Target className="h-8 w-8 text-grey-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">No Goals Yet</h2>
            <p className="text-grey-600 max-w-md mx-auto mb-6">
              Set your first goal to start tracking your fitness journey. You can track weight, strength PRs, measurements, and more.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const config = goalTypeConfig[goal.goal_type];
            const IconComponent = config.icon;
            const progress = calculateProgress(goal);

            return (
              <Card key={goal.id} className={goal.status === 'achieved' ? 'border-2 border-green-500' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-black">{goal.title}</h3>
                        <p className="text-sm text-grey-500">{config.label}</p>
                      </div>
                    </div>
                    {goal.status === 'achieved' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        Achieved!
                      </span>
                    )}
                  </div>

                  {goal.description && (
                    <p className="text-grey-600 text-sm mb-4">{goal.description}</p>
                  )}

                  {goal.target_value && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-grey-500">Progress</span>
                        <span className="font-medium text-black">
                          {goal.current_value || goal.start_value || 0} / {goal.target_value} {goal.target_unit}
                        </span>
                      </div>
                      <div className="h-3 bg-grey-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            goal.status === 'achieved' ? 'bg-green-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-grey-500 mt-1">{progress}% complete</p>
                    </div>
                  )}

                  {goal.target_date && (
                    <div className="flex items-center gap-2 text-sm text-grey-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {goal.status === 'active' && (
                    <div className="flex gap-2">
                      {goal.target_value && (
                        <button
                          onClick={() => {
                            const value = prompt('Enter current value:', goal.current_value?.toString() || '');
                            if (value) updateGoalProgress(goal.id, parseFloat(value));
                          }}
                          className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          Update Progress
                        </button>
                      )}
                      <button
                        onClick={() => markGoalComplete(goal.id)}
                        className="flex-1 py-2 px-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="py-2 px-3 bg-grey-100 text-grey-600 rounded-lg text-sm hover:bg-grey-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {goal.status === 'achieved' && goal.achieved_date && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span>Achieved on {new Date(goal.achieved_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-grey-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">Create New Goal</h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-2 hover:bg-grey-100 rounded-lg"
              >
                <X className="h-5 w-5 text-grey-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Goal Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(goalTypeConfig) as Goal['goal_type'][]).map((type) => {
                    const config = goalTypeConfig[type];
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewGoal({
                          ...newGoal,
                          goal_type: type,
                          target_unit: config.unit,
                        })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          newGoal.goal_type === type
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-grey-200 hover:border-grey-300'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 mx-auto ${newGoal.goal_type === type ? 'text-blue-600' : 'text-grey-400'}`} />
                        <p className="text-xs mt-1 text-grey-600">{config.label.split(' ')[0]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Lose 20 pounds, Bench press 225"
                  className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Exercise Selection (for strength goals) */}
              {newGoal.goal_type === 'strength' && (
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Exercise
                  </label>
                  <select
                    value={newGoal.exercise_id}
                    onChange={(e) => setNewGoal({ ...newGoal, exercise_id: e.target.value })}
                    className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an exercise</option>
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Starting Value
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newGoal.start_value}
                      onChange={(e) => setNewGoal({ ...newGoal, start_value: e.target.value })}
                      placeholder="Current"
                      className="w-full px-4 py-3 border border-grey-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="px-4 py-3 bg-grey-100 border border-l-0 border-grey-300 rounded-r-lg text-grey-600">
                      {newGoal.target_unit}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Target Value
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                      placeholder="Goal"
                      className="w-full px-4 py-3 border border-grey-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="px-4 py-3 bg-grey-100 border border-l-0 border-grey-300 rounded-r-lg text-grey-600">
                      {newGoal.target_unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  rows={3}
                  className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-grey-200 flex gap-3">
              <Button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addGoal}
                variant="primary"
                className="flex-1"
                disabled={!newGoal.title}
              >
                Create Goal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
