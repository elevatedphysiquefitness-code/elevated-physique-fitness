'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Apple,
  Droplets,
  Beef,
  Wheat,
  Info,
  CheckCircle,
  Calculator,
  Target,
  Flame,
  Scale,
  Settings,
  X,
  Sparkles,
  Clock,
  ChefHat,
  RefreshCw,
} from 'lucide-react';

interface ClientData {
  weight: number | null;
  bodyFatPercentage: number | null;
  goal: string | null;
  activityLevel: string | null;
}

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

// Macro calculation function
function calculateMacros(
  weight: number, // in lbs
  goal: 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | 'strength' | 'general_fitness',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  bodyFatPercentage?: number // optional for more accurate calculation
): Macros {
  // Convert weight to kg for calculations
  const weightKg = weight * 0.453592;

  // Calculate BMR
  let bmr: number;

  if (bodyFatPercentage && bodyFatPercentage > 0 && bodyFatPercentage < 100) {
    // Katch-McArdle formula (more accurate when body fat % is known)
    // Uses lean body mass for calculation
    const leanBodyMassKg = weightKg * (1 - bodyFatPercentage / 100);
    bmr = 370 + (21.6 * leanBodyMassKg);
  } else {
    // Mifflin-St Jeor equation (simplified for avg values)
    // Assuming average height and age for simplicity
    bmr = 10 * weightKg + 6.25 * 170 - 5 * 30 + 5; // Male avg
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  // Goal-based calorie adjustment
  let calories: number;
  let proteinMultiplier: number;
  let fatMultiplier: number;

  switch (goal) {
    case 'fat_loss':
      calories = tdee - 500; // 500 cal deficit
      proteinMultiplier = 1.0; // 1g per lb
      fatMultiplier = 0.35; // 35% of calories from fat
      break;
    case 'muscle_gain':
      calories = tdee + 300; // 300 cal surplus
      proteinMultiplier = 1.0; // 1g per lb
      fatMultiplier = 0.25; // 25% of calories from fat
      break;
    case 'recomposition':
      calories = tdee; // Maintenance
      proteinMultiplier = 1.0; // 1g per lb
      fatMultiplier = 0.3; // 30% of calories from fat
      break;
    case 'strength':
      calories = tdee + 200; // Small surplus
      proteinMultiplier = 0.9; // 0.9g per lb
      fatMultiplier = 0.3;
      break;
    case 'maintenance':
    case 'general_fitness':
    default:
      calories = tdee;
      proteinMultiplier = 0.8; // 0.8g per lb
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
    carbs: Math.max(carbs, 100), // Minimum 100g carbs
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

const activityLabels: Record<string, string> = {
  sedentary: 'Sedentary (little/no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  very_active: 'Very Active (athlete)',
};

const nutritionPrinciples = [
  {
    title: 'Protein Priority',
    icon: Beef,
    description: 'Aim for 0.7-1g of protein per pound of body weight daily. Protein is essential for muscle repair and growth.',
    tips: [
      'Eat protein with every meal',
      'Good sources: chicken, fish, eggs, lean beef, Greek yogurt',
      'Consider a protein shake post-workout if needed',
    ],
  },
  {
    title: 'Stay Hydrated',
    icon: Droplets,
    description: 'Drink at least half your body weight in ounces of water daily. More if you exercise intensely.',
    tips: [
      'Start your day with a full glass of water',
      'Carry a water bottle with you',
      'Limit sugary drinks and alcohol',
    ],
  },
  {
    title: 'Whole Foods First',
    icon: Apple,
    description: 'Focus on whole, minimally processed foods. They provide better nutrition and keep you fuller longer.',
    tips: [
      'Shop the perimeter of the grocery store',
      'Eat a variety of colorful vegetables',
      'Choose whole grains over refined',
    ],
  },
  {
    title: 'Smart Carbs',
    icon: Wheat,
    description: 'Carbs are fuel for your workouts. Time them around your training for best results.',
    tips: [
      'Eat more carbs on training days',
      'Choose complex carbs: oats, rice, potatoes, fruits',
      'Limit refined sugars and processed foods',
    ],
  },
];

const mealTiming = [
  {
    time: 'Pre-Workout (1-2 hours before)',
    suggestion: 'Light meal with carbs and protein. Example: oatmeal with protein powder, banana.',
  },
  {
    time: 'Post-Workout (within 1-2 hours)',
    suggestion: 'Protein-rich meal to support recovery. Example: chicken breast with rice and vegetables.',
  },
  {
    time: 'Before Bed',
    suggestion: 'Stop eating 2-3 hours before sleep. If hungry, choose slow-digesting protein like cottage cheese.',
  },
];

export default function NutritionPage() {
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<ClientData>({
    weight: null,
    bodyFatPercentage: null,
    goal: null,
    activityLevel: null,
  });
  const [macros, setMacros] = useState<Macros | null>(null);
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestion[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMealOptionsModal, setShowMealOptionsModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    weight: '',
    bodyFatPercentage: '',
    goal: 'maintenance',
    activityLevel: 'moderate',
  });
  const [mealOptions, setMealOptions] = useState({
    mealType: 'all' as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all',
    numberOfMeals: 4,
    dietaryPreferences: [] as string[],
  });

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'dairy-free', label: 'Dairy Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
  ];

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

    // Fetch latest weight and body fat from measurements
    const { data: measurementData } = await supabase
      .from('measurements')
      .select('weight, body_fat_percentage')
      .eq('client_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .single();

    // Fetch client details for goal and activity level
    const { data: detailsData } = await supabase
      .from('client_details')
      .select('goals, activity_level')
      .eq('user_id', user.id)
      .single();

    const weight = measurementData?.weight || null;
    const bodyFatPercentage = measurementData?.body_fat_percentage || null;
    const goal = detailsData?.goals || null;
    const activityLevel = detailsData?.activity_level || null;

    setClientData({ weight, bodyFatPercentage, goal, activityLevel });

    // Calculate macros if we have all data
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

  const handleCalculate = () => {
    if (!tempSettings.weight) return;

    const weight = parseFloat(tempSettings.weight);
    const bodyFatPercentage = tempSettings.bodyFatPercentage ? parseFloat(tempSettings.bodyFatPercentage) : null;
    const calculatedMacros = calculateMacros(
      weight,
      tempSettings.goal as 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | 'strength' | 'general_fitness',
      tempSettings.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
      bodyFatPercentage || undefined
    );

    setClientData({
      weight,
      bodyFatPercentage,
      goal: tempSettings.goal,
      activityLevel: tempSettings.activityLevel,
    });
    setMacros(calculatedMacros);
    setShowSettingsModal(false);
  };

  const fetchMealSuggestions = async () => {
    if (!macros || !clientData.goal) return;
    setLoadingMeals(true);
    setShowMealOptionsModal(false);
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
          mealType: mealOptions.mealType,
          numberOfMeals: mealOptions.numberOfMeals,
          dietaryPreferences: mealOptions.dietaryPreferences,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMealSuggestions(data.meals);
      }
    } catch (err) {
      console.error('Error fetching meal suggestions:', err);
    }
    setLoadingMeals(false);
  };

  const toggleDietaryPreference = (value: string) => {
    setMealOptions(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(value)
        ? prev.dietaryPreferences.filter(p => p !== value)
        : [...prev.dietaryPreferences, value],
    }));
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
          <h1 className="text-2xl font-bold text-black">Nutrition Guidelines</h1>
          <p className="text-grey-600 mt-1">Fuel your body for optimal performance and results</p>
        </div>
        <Button onClick={() => {
          setTempSettings({
            weight: clientData.weight?.toString() || '',
            bodyFatPercentage: clientData.bodyFatPercentage?.toString() || '',
            goal: clientData.goal || 'maintenance',
            activityLevel: clientData.activityLevel || 'moderate',
          });
          setShowSettingsModal(true);
        }} variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Macros
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">General Recommendations</p>
          <p className="text-sm text-blue-700 mt-1">
            These are general nutrition guidelines to support your training. They are not a meal plan
            or medical advice. For personalized nutrition plans, please consult a registered dietitian.
          </p>
        </div>
      </div>

      {/* Macro Calculator Results */}
      {macros ? (
        <Card className="bg-black text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Your Daily Targets</h2>
                  <p className="text-grey-300 text-sm">
                    Based on {clientData.weight} lbs{clientData.bodyFatPercentage ? ` | ${clientData.bodyFatPercentage}% BF` : ''} | {goalLabels[clientData.goal || 'maintenance']}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTempSettings({
                    weight: clientData.weight?.toString() || '',
                    bodyFatPercentage: clientData.bodyFatPercentage?.toString() || '',
                    goal: clientData.goal || 'maintenance',
                    activityLevel: clientData.activityLevel || 'moderate',
                  });
                  setShowSettingsModal(true);
                }}
                className="text-grey-400 hover:text-white"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-orange-600 rounded-full flex items-center justify-center mb-3">
                  <Flame className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{macros.calories}</p>
                <p className="text-grey-400 text-sm">Calories</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center mb-3">
                  <Beef className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{macros.protein}g</p>
                <p className="text-grey-400 text-sm">Protein</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-600 rounded-full flex items-center justify-center mb-3">
                  <Wheat className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{macros.carbs}g</p>
                <p className="text-grey-400 text-sm">Carbs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-3">
                  <Apple className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{macros.fats}g</p>
                <p className="text-grey-400 text-sm">Fats</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-grey-800">
              <p className="text-sm text-grey-400 text-center">
                Water intake: {clientData.weight ? Math.round((clientData.weight / 2)) : '--'} oz daily minimum
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-grey-100 mx-auto mb-6 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-grey-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Calculate Your Macros</h2>
            <p className="text-grey-600 max-w-md mx-auto mb-6">
              {!clientData.weight
                ? "Log your weight in the Progress section first, or enter it manually to calculate your personalized macro targets."
                : "Set your goal and activity level to calculate your personalized macro targets."}
            </p>
            <Button
              onClick={() => {
                setTempSettings({
                  weight: clientData.weight?.toString() || '',
                  bodyFatPercentage: clientData.bodyFatPercentage?.toString() || '',
                  goal: clientData.goal || 'maintenance',
                  activityLevel: clientData.activityLevel || 'moderate',
                });
                setShowSettingsModal(true);
              }}
              variant="primary"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Meal Suggestions */}
      {macros && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">AI Meal Suggestions</h2>
                  <p className="text-sm text-grey-500">Personalized meals based on your macro targets</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowMealOptionsModal(true)}
                  variant="outline"
                  disabled={loadingMeals}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
                <Button
                  onClick={() => fetchMealSuggestions()}
                  variant="primary"
                  disabled={loadingMeals}
                >
                  {loadingMeals ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : mealSuggestions.length > 0 ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Current Options Display */}
            {(mealOptions.mealType !== 'all' || mealOptions.dietaryPreferences.length > 0) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {mealOptions.mealType !== 'all' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 capitalize">
                    {mealOptions.mealType} only
                  </span>
                )}
                {mealOptions.dietaryPreferences.map(pref => (
                  <span key={pref} className="text-xs bg-green-100 text-green-700 px-2 py-1 capitalize">
                    {pref.replace('-', ' ')}
                  </span>
                ))}
                <span className="text-xs bg-grey-100 text-grey-600 px-2 py-1">
                  {mealOptions.numberOfMeals} meals
                </span>
              </div>
            )}

            {loadingMeals && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-grey-500">Generating personalized meal ideas...</p>
                </div>
              </div>
            )}

            {!loadingMeals && mealSuggestions.length > 0 && (
              <div className="space-y-4">
                {mealSuggestions.map((meal, index) => (
                  <div key={index} className="border border-grey-200">
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
                            <span className="text-xs font-medium text-purple-600 uppercase">{meal.meal_type}</span>
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

                    {expandedMeal === index && (
                      <div className="px-4 pb-4 border-t border-grey-200 pt-4">
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

                        <div>
                          <p className="text-sm font-semibold text-black mb-2">Instructions:</p>
                          <p className="text-sm text-grey-700 whitespace-pre-line">{meal.instructions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loadingMeals && mealSuggestions.length === 0 && (
              <div className="text-center py-8 bg-grey-50">
                <ChefHat className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-600 text-sm">
                  Click &quot;Get Suggestions&quot; to receive AI-powered meal ideas tailored to your macro targets.
                </p>
              </div>
            )}

            <p className="mt-4 text-xs text-grey-400 text-center">
              These are general recommendations, not a medical meal plan. Consult a registered dietitian for specialized nutrition advice.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nutritionPrinciples.map((principle) => (
          <div key={principle.title} className="bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
                <principle.icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-bold text-black">{principle.title}</h2>
            </div>
            <p className="text-grey-600 mb-4">{principle.description}</p>
            <ul className="space-y-2">
              {principle.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-sm text-grey-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Meal Timing */}
      <div className="bg-white p-6">
        <h2 className="text-lg font-bold text-black mb-6">Meal Timing</h2>
        <div className="space-y-4">
          {mealTiming.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-grey-50">
              <div className="w-2 h-2 bg-blue-600 mt-2 flex-shrink-0" />
              <div>
                <p className="font-semibold text-black">{item.time}</p>
                <p className="text-grey-600 mt-1">{item.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Tips */}
      <div className="bg-white p-6">
        <h2 className="text-lg font-bold text-black mb-4">Additional Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-grey-50">
            <p className="font-medium text-black">Meal Prep</p>
            <p className="text-sm text-grey-600 mt-1">
              Prepare meals in advance to stay consistent and avoid unhealthy choices when busy.
            </p>
          </div>
          <div className="p-4 bg-grey-50">
            <p className="font-medium text-black">Track Your Food</p>
            <p className="text-sm text-grey-600 mt-1">
              Consider using an app like MyFitnessPal to track intake and build awareness.
            </p>
          </div>
          <div className="p-4 bg-grey-50">
            <p className="font-medium text-black">80/20 Rule</p>
            <p className="text-sm text-grey-600 mt-1">
              Aim for 80% whole, nutritious foods. 20% can be flexible for sustainability.
            </p>
          </div>
          <div className="p-4 bg-grey-50">
            <p className="font-medium text-black">Listen to Your Body</p>
            <p className="text-sm text-grey-600 mt-1">
              Eat when hungry, stop when satisfied. Pay attention to how foods make you feel.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Calculate Your Macros</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-grey-400 hover:text-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Current Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    value={tempSettings.weight}
                    onChange={(e) => setTempSettings({ ...tempSettings, weight: e.target.value })}
                    placeholder="e.g., 180"
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Body Fat % (optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempSettings.bodyFatPercentage}
                    onChange={(e) => setTempSettings({ ...tempSettings, bodyFatPercentage: e.target.value })}
                    placeholder="e.g., 18"
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                  <p className="mt-1 text-xs text-grey-500">
                    Adding body fat % uses Katch-McArdle formula for more accurate calculations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Goal *
                  </label>
                  <select
                    value={tempSettings.goal}
                    onChange={(e) => setTempSettings({ ...tempSettings, goal: e.target.value })}
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {Object.entries(goalLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Activity Level *
                  </label>
                  <select
                    value={tempSettings.activityLevel}
                    onChange={(e) => setTempSettings({ ...tempSettings, activityLevel: e.target.value })}
                    className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {Object.entries(activityLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => setShowSettingsModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCalculate}
                  variant="primary"
                  className="flex-1"
                  disabled={!tempSettings.weight}
                >
                  Calculate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Options Modal */}
      {showMealOptionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-black">Meal Suggestion Options</h3>
                <button
                  onClick={() => setShowMealOptionsModal(false)}
                  className="text-grey-400 hover:text-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Meal Type */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Meal Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setMealOptions(prev => ({ ...prev, mealType: type as any }))}
                        className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                          mealOptions.mealType === type
                            ? 'bg-purple-600 text-white'
                            : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Meals */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Number of Suggestions: {mealOptions.numberOfMeals}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={mealOptions.numberOfMeals}
                    onChange={(e) => setMealOptions(prev => ({ ...prev, numberOfMeals: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-grey-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-grey-500 mt-1">
                    <span>1</span>
                    <span>4</span>
                    <span>8</span>
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Dietary Preferences
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleDietaryPreference(option.value)}
                        className={`px-3 py-2 text-sm font-medium text-left transition-colors ${
                          mealOptions.dietaryPreferences.includes(option.value)
                            ? 'bg-green-600 text-white'
                            : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-grey-500">
                    Select any dietary restrictions or preferences
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => {
                    setMealOptions({
                      mealType: 'all',
                      numberOfMeals: 4,
                      dietaryPreferences: [],
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => fetchMealSuggestions()}
                  variant="primary"
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Meals
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
