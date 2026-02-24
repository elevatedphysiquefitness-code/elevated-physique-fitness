'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ChefHat,
  Clock,
  RefreshCw,
  Loader2,
  Flame,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  prep_time_minutes: number;
  meal_type: string;
}

// Same formula as nutrition page
function calculateMacros(
  weight: number,
  goal: 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | 'strength' | 'general_fitness',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  bodyFatPercentage?: number
): Macros {
  const weightKg = weight * 0.453592;

  let bmr: number;
  if (bodyFatPercentage && bodyFatPercentage > 0 && bodyFatPercentage < 100) {
    const leanBodyMassKg = weightKg * (1 - bodyFatPercentage / 100);
    bmr = 370 + (21.6 * leanBodyMassKg);
  } else {
    bmr = 10 * weightKg + 6.25 * 170 - 5 * 30 + 5;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  let calories: number;
  let proteinMultiplier: number;
  let fatMultiplier: number;

  switch (goal) {
    case 'fat_loss':
      calories = tdee - 500;
      proteinMultiplier = 1.0;
      fatMultiplier = 0.35;
      break;
    case 'muscle_gain':
      calories = tdee + 300;
      proteinMultiplier = 1.0;
      fatMultiplier = 0.25;
      break;
    case 'recomposition':
      calories = tdee;
      proteinMultiplier = 1.0;
      fatMultiplier = 0.3;
      break;
    case 'strength':
      calories = tdee + 200;
      proteinMultiplier = 0.9;
      fatMultiplier = 0.3;
      break;
    case 'maintenance':
    case 'general_fitness':
    default:
      calories = tdee;
      proteinMultiplier = 0.8;
      fatMultiplier = 0.3;
      break;
  }

  const protein = Math.round(weight * proteinMultiplier);
  const fats = Math.round((calories * fatMultiplier) / 9);
  const proteinCals = protein * 4;
  const fatCals = fats * 9;
  const carbs = Math.round((calories - proteinCals - fatCals) / 4);

  return {
    calories: Math.round(calories),
    protein,
    carbs: Math.max(carbs, 100),
    fats,
  };
}

const goalLabels: Record<string, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  recomposition: 'Body Recomposition',
  maintenance: 'Maintenance',
  strength: 'Strength',
  general_fitness: 'General Fitness',
};

const MEAL_ORDER = ['breakfast', 'snack', 'lunch', 'snack', 'dinner'] as const;
const MEAL_LABELS = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Low-Carb', 'High-Protein',
  'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
];

export default function MealPlanPage() {
  const [loading, setLoading] = useState(true);
  const [macros, setMacros] = useState<Macros | null>(null);
  const [clientData, setClientData] = useState<{ weight: number | null; goal: string | null }>({ weight: null, goal: null });
  const [meals, setMeals] = useState<(MealSuggestion | null)[]>([null, null, null, null, null]);
  const [generating, setGenerating] = useState(false);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: measurementData } = await supabase
      .from('measurements')
      .select('weight, body_fat_percentage')
      .eq('client_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    const { data: detailsData } = await supabase
      .from('client_details')
      .select('goals, activity_level')
      .eq('user_id', user.id)
      .single();

    const weight = measurementData?.weight || null;
    const bodyFatPercentage = measurementData?.body_fat_percentage || null;
    const goal = detailsData?.goals || null;
    const activityLevel = detailsData?.activity_level || null;

    setClientData({ weight, goal });

    if (weight && goal && activityLevel) {
      const calculatedMacros = calculateMacros(
        weight,
        goal as 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | 'strength' | 'general_fitness',
        activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
        bodyFatPercentage || undefined
      );
      setMacros(calculatedMacros);
    }

    setLoading(false);
  };

  const hasMeals = meals.some(m => m !== null);

  const planTotals = meals.reduce(
    (acc, meal) => {
      if (!meal) return acc;
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const generateFullPlan = async () => {
    if (!macros || !clientData.goal) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/food-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: clientData.goal,
          targetCalories: macros.calories,
          targetProtein: macros.protein,
          targetCarbs: macros.carbs,
          targetFat: macros.fats,
          mealType: 'all',
          numberOfMeals: 5,
          dietaryPreferences: preferences,
        }),
      });

      const data = await res.json();
      if (data.success && data.meals) {
        // Map returned meals to our 5 slots by meal_type
        const mapped: (MealSuggestion | null)[] = [null, null, null, null, null];
        const breakfasts = data.meals.filter((m: MealSuggestion) => m.meal_type === 'breakfast');
        const lunches = data.meals.filter((m: MealSuggestion) => m.meal_type === 'lunch');
        const dinners = data.meals.filter((m: MealSuggestion) => m.meal_type === 'dinner');
        const snacks = data.meals.filter((m: MealSuggestion) => m.meal_type === 'snack');

        mapped[0] = breakfasts[0] || data.meals[0] || null;
        mapped[1] = snacks[0] || data.meals[1] || null;
        mapped[2] = lunches[0] || data.meals[2] || null;
        mapped[3] = snacks[1] || data.meals[3] || null;
        mapped[4] = dinners[0] || data.meals[4] || null;

        setMeals(mapped);
        setExpandedMeal(null);
      } else {
        setError('Failed to generate meal plan. Please try again.');
      }
    } catch {
      setError('Failed to generate meal plan. Please try again.');
    }

    setGenerating(false);
  };

  const swapMeal = async (index: number) => {
    if (!macros || !clientData.goal) return;
    setSwappingIndex(index);
    setError(null);

    // Calculate remaining budget from other meals
    const otherMeals = meals.filter((_, i) => i !== index && _ !== null) as MealSuggestion[];
    const otherTotals = otherMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const targetCalories = Math.max(100, macros.calories - otherTotals.calories);
    const targetProtein = Math.max(10, macros.protein - otherTotals.protein);
    const targetCarbs = Math.max(10, macros.carbs - otherTotals.carbs);
    const targetFat = Math.max(5, macros.fats - otherTotals.fat);

    const mealType = MEAL_ORDER[index];

    try {
      const res = await fetch('/api/ai/food-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: clientData.goal,
          targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
          mealType,
          numberOfMeals: 1,
          dietaryPreferences: preferences,
        }),
      });

      const data = await res.json();
      if (data.success && data.meals && data.meals.length > 0) {
        setMeals(prev => {
          const updated = [...prev];
          updated[index] = data.meals[0];
          return updated;
        });
      } else {
        setError('Failed to swap meal. Please try again.');
      }
    } catch {
      setError('Failed to swap meal. Please try again.');
    }

    setSwappingIndex(null);
  };

  const togglePreference = (pref: string) => {
    setPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const getDiffColor = (actual: number, target: number) => {
    const diff = Math.abs(actual - target);
    const pct = target > 0 ? (diff / target) * 100 : 0;
    if (pct <= 5) return 'text-green-600';
    if (pct <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-grey-400" />
      </div>
    );
  }

  if (!macros) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-grey-300 mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">Macro Targets Not Set Up</h2>
            <p className="text-grey-600 mb-6">
              To generate a meal plan, you need to configure your macro targets first.
            </p>
            <Button href="/dashboard/nutrition">
              Go to Nutrition Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Daily Meal Plan</h1>
        <p className="text-grey-600 text-sm mt-1">
          Generate a full day of meals tailored to your macro targets
          {clientData.goal && <span className="text-purple-600 font-medium"> — {goalLabels[clientData.goal] || clientData.goal}</span>}
        </p>
      </div>

      {/* Macro Targets Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-grey-500" />
            <span className="text-sm font-semibold text-black">Daily Macro Targets</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-orange-50 p-3 text-center">
              <p className="text-xs text-grey-500">Calories</p>
              <p className="text-lg font-bold text-orange-600">{macros.calories}</p>
            </div>
            <div className="bg-red-50 p-3 text-center">
              <p className="text-xs text-grey-500">Protein</p>
              <p className="text-lg font-bold text-red-600">{macros.protein}g</p>
            </div>
            <div className="bg-yellow-50 p-3 text-center">
              <p className="text-xs text-grey-500">Carbs</p>
              <p className="text-lg font-bold text-yellow-600">{macros.carbs}g</p>
            </div>
            <div className="bg-green-50 p-3 text-center">
              <p className="text-xs text-grey-500">Fat</p>
              <p className="text-lg font-bold text-green-600">{macros.fats}g</p>
            </div>
          </div>

          {/* Plan totals comparison */}
          {hasMeals && (
            <div className="mt-3 pt-3 border-t border-grey-200">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-grey-500" />
                <span className="text-xs font-semibold text-grey-600">Meal Plan Totals</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className={`text-sm font-bold ${getDiffColor(planTotals.calories, macros.calories)}`}>
                    {planTotals.calories}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${getDiffColor(planTotals.protein, macros.protein)}`}>
                    {planTotals.protein}g
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${getDiffColor(planTotals.carbs, macros.carbs)}`}>
                    {planTotals.carbs}g
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${getDiffColor(planTotals.fat, macros.fats)}`}>
                    {planTotals.fat}g
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <button
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-grey-50 transition-colors"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          <span className="text-sm font-semibold text-black">Dietary Preferences</span>
          <div className="flex items-center gap-2">
            {preferences.length > 0 && (
              <span className="text-xs text-purple-600 font-medium">{preferences.length} selected</span>
            )}
            {showPreferences ? (
              <ChevronUp className="h-4 w-4 text-grey-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-grey-400" />
            )}
          </div>
        </button>
        {showPreferences && (
          <div className="px-6 pb-4 border-t border-grey-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => togglePreference(option)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                    preferences.includes(option)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-grey-600 border-grey-300 hover:border-grey-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Generate Button */}
      <Button
        onClick={generateFullPlan}
        disabled={generating}
        className="w-full"
        size="lg"
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Generating Meal Plan...
          </>
        ) : hasMeals ? (
          <>
            <RefreshCw className="h-5 w-5 mr-2" />
            Regenerate Meal Plan
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Meal Plan
          </>
        )}
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Skeleton Loading */}
      {generating && (
        <div className="space-y-4">
          {MEAL_LABELS.map((label, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-grey-200 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 w-20 bg-grey-200 mb-2" />
                      <div className="h-4 w-48 bg-grey-200 mb-1" />
                      <div className="h-3 w-64 bg-grey-200" />
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-16 bg-grey-200 mb-1" />
                      <div className="h-3 w-24 bg-grey-200" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-grey-400 mt-2">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meal Cards */}
      {!generating && hasMeals && (
        <div className="space-y-4">
          {meals.map((meal, index) => {
            if (!meal) return null;
            const isSwapping = swappingIndex === index;

            return (
              <Card key={index}>
                <div className="relative">
                  {isSwapping && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  )}

                  {/* Meal Header */}
                  <button
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-grey-50 transition-colors"
                    onClick={() => setExpandedMeal(expandedMeal === index ? null : index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-grey-100 flex items-center justify-center flex-shrink-0">
                        <ChefHat className="h-5 w-5 text-grey-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-purple-600 uppercase">{MEAL_LABELS[index]}</span>
                          <span className="text-xs text-grey-400">|</span>
                          <span className="text-xs text-grey-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {meal.prep_time_minutes} min
                          </span>
                        </div>
                        <p className="font-semibold text-black">{meal.name}</p>
                        <p className="text-sm text-grey-500 mt-0.5">{meal.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-black">{meal.calories} cal</p>
                      <p className="text-xs text-grey-500">P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g</p>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedMeal === index && (
                    <div className="px-4 pb-4 border-t border-grey-200 pt-4">
                      {/* Macro Badges */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-orange-50 p-2 text-center">
                          <p className="text-xs text-grey-500">Calories</p>
                          <p className="font-bold text-orange-600">{meal.calories}</p>
                        </div>
                        <div className="bg-red-50 p-2 text-center">
                          <p className="text-xs text-grey-500">Protein</p>
                          <p className="font-bold text-red-600">{meal.protein}g</p>
                        </div>
                        <div className="bg-yellow-50 p-2 text-center">
                          <p className="text-xs text-grey-500">Carbs</p>
                          <p className="font-bold text-yellow-600">{meal.carbs}g</p>
                        </div>
                        <div className="bg-green-50 p-2 text-center">
                          <p className="text-xs text-grey-500">Fat</p>
                          <p className="font-bold text-green-600">{meal.fat}g</p>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-black mb-2">Ingredients:</p>
                        <ul className="space-y-1">
                          {meal.ingredients.map((ing, i) => (
                            <li key={i} className="text-sm text-grey-700 flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Instructions */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-black mb-2">Instructions:</p>
                        <p className="text-sm text-grey-700 whitespace-pre-line">{meal.instructions}</p>
                      </div>

                      {/* Swap Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          swapMeal(index);
                        }}
                        disabled={swappingIndex !== null}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Swap This Meal
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Totals Summary */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-grey-500" />
                <span className="text-sm font-semibold text-black">Plan Summary vs Targets</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xs text-grey-500 mb-1">Calories</p>
                  <p className={`text-lg font-bold ${getDiffColor(planTotals.calories, macros.calories)}`}>
                    {planTotals.calories}
                  </p>
                  <p className="text-xs text-grey-400">/ {macros.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-grey-500 mb-1">Protein</p>
                  <p className={`text-lg font-bold ${getDiffColor(planTotals.protein, macros.protein)}`}>
                    {planTotals.protein}g
                  </p>
                  <p className="text-xs text-grey-400">/ {macros.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-grey-500 mb-1">Carbs</p>
                  <p className={`text-lg font-bold ${getDiffColor(planTotals.carbs, macros.carbs)}`}>
                    {planTotals.carbs}g
                  </p>
                  <p className="text-xs text-grey-400">/ {macros.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-grey-500 mb-1">Fat</p>
                  <p className={`text-lg font-bold ${getDiffColor(planTotals.fat, macros.fats)}`}>
                    {planTotals.fat}g
                  </p>
                  <p className="text-xs text-grey-400">/ {macros.fats}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!generating && !hasMeals && (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="h-12 w-12 mx-auto text-grey-300 mb-4" />
            <p className="text-grey-600 text-sm">
              Click &quot;Generate Meal Plan&quot; to get a full day of meals tailored to your macro targets.
            </p>
            <p className="text-grey-400 text-xs mt-2">
              Breakfast, 2 snacks, lunch, and dinner — all balanced to hit your daily goals.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
