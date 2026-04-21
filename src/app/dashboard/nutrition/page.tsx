'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
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
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Loader2,
  ScanBarcode,
  Camera,
  Wand2,
  Star,
  Copy,
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

interface FoodLog {
  id: string;
  client_id: string;
  log_date: string;
  food_name: string;
  servings: number;
  serving_size: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other' | null;
  notes: string | null;
  logged_at: string;
}

interface SavedFood {
  id: string;
  client_id: string;
  food_name: string;
  serving_size: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_favorite: boolean;
  use_count: number;
  last_used_at: string;
}

interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  pre_workout: 'Pre-Workout',
  post_workout: 'Post-Workout',
  other: 'Other',
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
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData>({
    weight: null,
    bodyFatPercentage: null,
    goal: null,
    activityLevel: null,
  });
  const [macros, setMacros] = useState<Macros | null>(null);
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestion[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [burnedCalories, setBurnedCalories] = useState(0);
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

  // Food logging state
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodLog | null>(null);
  const [savingFood, setSavingFood] = useState(false);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [newFood, setNewFood] = useState({
    food_name: '',
    servings: '1',
    serving_size: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meal_type: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other',
    notes: '',
  });
  const [foodQueue, setFoodQueue] = useState<Array<{
    food_name: string;
    servings: number;
    serving_size: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | 'other';
    notes: string | null;
  }>>([]);

  // AI Nutrition Tips state
  const [nutritionTips, setNutritionTips] = useState<{ title: string; tip: string; actionStep: string }[]>([]);
  const [loadingNutritionTips, setLoadingNutritionTips] = useState(false);

  // Food search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [foodEntryMode, setFoodEntryMode] = useState<'search' | 'manual' | 'scan'>('search');
  const [lookingUpMacros, setLookingUpMacros] = useState(false);

  // Barcode scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);

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

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const [historyLogs, setHistoryLogs] = useState<FoodLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRange, setHistoryRange] = useState<'week' | 'month' | 'all'>('week');

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(dateStr + 'T00:00:00');

    if (selectedDateObj.getTime() === todayDate.getTime()) {
      return 'Today';
    }

    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    if (selectedDateObj.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate + 'T00:00:00');
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    const newDate = current.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const isToday = selectedDate === today;

  useEffect(() => {
    fetchClientData();
  }, []);

  // Refetch food logs and burned calories when date changes
  useEffect(() => {
    if (userId) {
      fetchFoodLogs(userId, selectedDate);
      fetchBurnedCalories(userId, selectedDate);
    }
  }, [selectedDate, userId]);

  const fetchBurnedCalories = async (clientId: string, date: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('activity_logs')
      .select('calories_burned')
      .eq('client_id', clientId)
      .eq('log_date', date);

    if (data) {
      setBurnedCalories(data.reduce((sum, log) => sum + (log.calories_burned || 0), 0));
    }
  };

  const fetchClientData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

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

    // Fetch today's food logs and saved favorites
    await fetchFoodLogs(user.id, today);
    await fetchSavedFoods(user.id);

    setLoading(false);
  };

  const fetchFoodLogs = async (clientId: string, date: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('client_id', clientId)
      .eq('log_date', date)
      .order('logged_at', { ascending: true });

    if (data) {
      setFoodLogs(data);
    }
    if (error) {
      console.error('Error fetching food logs:', error);
    }
  };

  const fetchSavedFoods = async (clientId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('saved_foods')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_favorite', true)
      .order('use_count', { ascending: false });
    if (data) setSavedFoods(data);
  };

  const fetchHistoryLogs = async (clientId: string, range: 'week' | 'month' | 'all') => {
    setHistoryLoading(true);
    const supabase = createClient();

    let startDate = '';
    const now = new Date();

    if (range === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
    }

    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('log_date', { ascending: false })
      .order('logged_at', { ascending: true });

    if (startDate) {
      query = query.gte('log_date', startDate);
    }

    const { data, error } = await query;

    if (data) {
      setHistoryLogs(data);
    }
    if (error) {
      console.error('Error fetching history logs:', error);
    }
    setHistoryLoading(false);
  };

  // Fetch history when tab changes or range changes
  useEffect(() => {
    if (activeTab === 'history' && userId) {
      fetchHistoryLogs(userId, historyRange);
    }
  }, [activeTab, historyRange, userId]);

  // Group history logs by date
  const groupedHistoryLogs = historyLogs.reduce((acc, log) => {
    if (!acc[log.log_date]) acc[log.log_date] = [];
    acc[log.log_date].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  // Calculate daily totals for history
  const calculateDayTotals = (logs: FoodLog[]) => {
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  // Calculate consumed macros from food logs
  const consumedMacros = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate remaining macros
  const remainingMacros = macros ? {
    calories: Math.max(0, macros.calories - consumedMacros.calories),
    protein: Math.max(0, macros.protein - consumedMacros.protein),
    carbs: Math.max(0, macros.carbs - consumedMacros.carbs),
    fat: Math.max(0, macros.fats - consumedMacros.fat),
  } : null;

  // Calculate percentages
  const calculatePercentage = (consumed: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((consumed / target) * 100), 100);
  };

  const fetchNutritionTips = async () => {
    if (!macros) {
      alert('Please calculate your macros first to get personalized tips.');
      return;
    }
    setLoadingNutritionTips(true);
    try {
      const res = await fetch('/api/ai/coaching-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habits: [],
          goals: [],
          nutrition: {
            goal: clientData.goal || 'maintenance',
            targetCalories: macros.calories,
            targetProtein: macros.protein,
            targetCarbs: macros.carbs,
            targetFat: macros.fats,
            consumedCalories: consumedMacros.calories,
            consumedProtein: Math.round(consumedMacros.protein),
            consumedCarbs: Math.round(consumedMacros.carbs),
            consumedFat: Math.round(consumedMacros.fat),
            recentFoods: foodLogs.map(l => `${l.food_name} (${l.calories} cal, ${l.protein}g protein)`),
          },
          section: 'nutrition',
        }),
      });
      const data = await res.json();
      if (data.success && data.tips) {
        setNutritionTips(data.tips);
      } else {
        alert('Failed to generate tips. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching nutrition tips:', err);
      alert('Failed to generate tips. Please try again.');
    } finally {
      setLoadingNutritionTips(false);
    }
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

  const resetFoodForm = () => {
    setNewFood({
      food_name: '',
      servings: '1',
      serving_size: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      meal_type: 'lunch',
      notes: '',
    });
    setEditingFood(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setFoodEntryMode('search');
    setScanError(null);
    stopScanner();
  };

  const lookUpMacros = async () => {
    if (!newFood.food_name) return;
    setLookingUpMacros(true);

    try {
      const quantity = newFood.serving_size || (newFood.servings !== '1' ? `${newFood.servings} servings` : '');
      const response = await fetch('/api/ai/macro-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: newFood.food_name,
          quantity: quantity || null,
        }),
      });

      const data = await response.json();

      if (data.success && data.nutrition) {
        setNewFood(prev => ({
          ...prev,
          serving_size: data.nutrition.serving_size || prev.serving_size,
          calories: String(data.nutrition.calories),
          protein: String(data.nutrition.protein),
          carbs: String(data.nutrition.carbs),
          fat: String(data.nutrition.fat),
        }));
        toast.success('Macros filled in automatically!');
      } else {
        toast.error(data.error || 'Could not look up macros.');
      }
    } catch {
      toast.error('Failed to look up macros. Try entering them manually.');
    } finally {
      setLookingUpMacros(false);
    }
  };

  // Barcode scanner functions
  const startScanner = async () => {
    setScanError(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (!scannerRef.current) return;

      const html5QrCode = new Html5Qrcode('barcode-scanner');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        async (decodedText) => {
          // Barcode detected - stop scanner and look up product
          await stopScanner();
          await lookupBarcode(decodedText);
        },
        () => {
          // Ignore QR code not found errors
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setIsScanning(false);
      if (err instanceof Error) {
        if (err.message.includes('Permission')) {
          setScanError('Camera permission denied. Please allow camera access.');
        } else {
          setScanError('Could not start camera. Try manual entry instead.');
        }
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const lookupBarcode = async (barcode: string) => {
    setIsSearching(true);
    setScanError(null);

    try {
      const response = await fetch(`/api/barcode-lookup?code=${encodeURIComponent(barcode)}`);
      const data = await response.json();

      if (data.found && data.product) {
        setNewFood({
          ...newFood,
          food_name: data.product.name,
          serving_size: data.product.servingSize,
          calories: data.product.calories.toString(),
          protein: data.product.protein.toString(),
          carbs: data.product.carbs.toString(),
          fat: data.product.fat.toString(),
        });
        setFoodEntryMode('manual'); // Switch to manual to show filled form
        toast.success('Product found!');
      } else {
        setScanError(`Product not found for barcode: ${barcode}`);
        toast.error('Product not found. Try manual entry.');
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
      setScanError('Failed to look up product. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Debounced food search
  const handleFoodSearch = (query: string) => {
    setSearchQuery(query);
    setNewFood({ ...newFood, food_name: query });

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Food search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Select a food from search results
  const selectSearchResult = (food: FoodSearchResult) => {
    setNewFood({
      ...newFood,
      food_name: food.name,
      serving_size: food.servingSize,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
    });
    setSearchQuery(food.name);
    setShowSearchResults(false);
    setSearchResults([]);
    setFoodEntryMode('manual'); // Switch to manual mode to show all fields
  };

  const selectFavoriteFood = async (food: SavedFood) => {
    setNewFood({
      ...newFood,
      food_name: food.food_name,
      serving_size: food.serving_size || '',
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
    });
    setSearchQuery(food.food_name);
    setFoodEntryMode('manual');
    // Increment use count in background
    const supabase = createClient();
    supabase.from('saved_foods').update({ use_count: food.use_count + 1, last_used_at: new Date().toISOString() }).eq('id', food.id);
  };

  const openAddFoodModal = () => {
    resetFoodForm();
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (userId) fetchSavedFoods(userId);
    setShowFoodModal(true);
  };

  const openEditFoodModal = (food: FoodLog) => {
    setEditingFood(food);
    setNewFood({
      food_name: food.food_name,
      servings: food.servings.toString(),
      serving_size: food.serving_size || '',
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      meal_type: food.meal_type || 'lunch',
      notes: food.notes || '',
    });
    setSearchQuery(food.food_name);
    setSearchResults([]);
    setShowSearchResults(false);
    setFoodEntryMode('manual'); // Always use manual mode when editing
    setShowFoodModal(true);
  };

  const handleAddToQueue = () => {
    if (!newFood.food_name || !newFood.calories) return;
    setFoodQueue(prev => [...prev, {
      food_name: newFood.food_name,
      servings: parseFloat(newFood.servings) || 1,
      serving_size: newFood.serving_size || null,
      calories: parseInt(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
      meal_type: newFood.meal_type,
      notes: newFood.notes || null,
    }]);
    setNewFood({
      food_name: '',
      servings: '1',
      serving_size: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      meal_type: newFood.meal_type,
      notes: '',
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setFoodEntryMode('search');
    setScanError(null);
    stopScanner();
  };

  const handleSaveFood = async () => {
    if (!userId) return;

    setSavingFood(true);
    const supabase = createClient();

    const currentFoodData = newFood.food_name && newFood.calories ? {
      client_id: userId,
      log_date: selectedDate,
      food_name: newFood.food_name,
      servings: parseFloat(newFood.servings) || 1,
      serving_size: newFood.serving_size || null,
      calories: parseInt(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
      meal_type: newFood.meal_type,
      notes: newFood.notes || null,
    } : null;

    if (editingFood && currentFoodData) {
      // Update existing food log
      const { error } = await supabase
        .from('food_logs')
        .update(currentFoodData)
        .eq('id', editingFood.id);

      if (error) {
        console.error('Error updating food log:', error);
        toast.error('Failed to update food');
      } else {
        await fetchFoodLogs(userId, selectedDate);
        setShowFoodModal(false);
        setFoodQueue([]);
        resetFoodForm();
        toast.success('Food updated!');
      }
    } else {
      // Build all items to insert: queued items + current form item (if filled)
      const queuedItems = foodQueue.map(item => ({
        client_id: userId,
        log_date: selectedDate,
        ...item,
      }));
      const allItems = currentFoodData ? [...queuedItems, currentFoodData] : queuedItems;

      if (allItems.length === 0) {
        setSavingFood(false);
        return;
      }

      const { error } = await supabase
        .from('food_logs')
        .insert(allItems);

      if (error) {
        console.error('Error adding food log:', error);
        toast.error('Failed to add food');
      } else {
        await fetchFoodLogs(userId, selectedDate);
        setShowFoodModal(false);
        setFoodQueue([]);
        resetFoodForm();
        toast.success(allItems.length > 1 ? `${allItems.length} items logged!` : 'Food logged!');
      }
    }

    setSavingFood(false);
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food entry?')) return;
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting food log:', error);
      toast.error('Failed to delete food');
    } else {
      // Update both current day logs and history logs
      setFoodLogs(foodLogs.filter(f => f.id !== id));
      setHistoryLogs(historyLogs.filter(f => f.id !== id));
      toast.success('Food deleted!');
    }
  };

  const toggleFavorite = async (food: FoodLog) => {
    if (!userId) return;
    const supabase = createClient();

    const { data: existing } = await supabase
      .from('saved_foods')
      .select('id, is_favorite')
      .eq('client_id', userId)
      .eq('food_name', food.food_name)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('saved_foods')
        .update({ is_favorite: !existing.is_favorite, last_used_at: new Date().toISOString() })
        .eq('id', existing.id);
      toast.success(existing.is_favorite ? 'Removed from favorites' : 'Added to favorites!');
    } else {
      await supabase.from('saved_foods').insert({
        client_id: userId,
        food_name: food.food_name,
        serving_size: food.serving_size,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        is_favorite: true,
      });
      toast.success('Added to favorites!');
    }
    await fetchSavedFoods(userId);
  };

  const handleDuplicateFood = async (food: FoodLog) => {
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase.from('food_logs').insert({
      client_id: userId,
      log_date: selectedDate,
      food_name: food.food_name,
      servings: food.servings,
      serving_size: food.serving_size,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      meal_type: food.meal_type,
      notes: food.notes,
    });
    if (error) {
      toast.error('Failed to duplicate food');
    } else {
      await fetchFoodLogs(userId, selectedDate);
      toast.success(`${food.food_name} duplicated!`);
    }
  };

  // Group food logs by meal type
  const groupedFoodLogs = foodLogs.reduce((acc, log) => {
    const mealType = log.meal_type || 'other';
    if (!acc[mealType]) acc[mealType] = [];
    acc[mealType].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  const favoriteNames = new Set(savedFoods.filter(f => f.is_favorite).map(f => f.food_name));

  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other'];

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

      {/* Macro Calculator Results with Progress Bars */}
      {macros ? (
        <Card className="border-2 border-blue-600">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">Your Daily Targets</h2>
                  <p className="text-grey-600 text-sm">
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
                className="text-grey-500 hover:text-black"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Calories */}
              <div className="text-center bg-orange-50 p-4 rounded-lg">
                <div className="w-14 h-14 mx-auto bg-orange-600 rounded-full flex items-center justify-center mb-3">
                  <Flame className="h-7 w-7 text-white" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{consumedMacros.calories}</p>
                <p className="text-orange-700 text-sm">/ {macros.calories}</p>
                <div className="mt-3 h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.calories, macros.calories)}%` }}
                  />
                </div>
                <p className="text-xs text-orange-700 mt-1 font-medium">
                  {calculatePercentage(consumedMacros.calories, macros.calories)}% Calories
                </p>
              </div>

              {/* Protein */}
              <div className="text-center bg-red-50 p-4 rounded-lg">
                <div className="w-14 h-14 mx-auto bg-red-600 rounded-full flex items-center justify-center mb-3">
                  <Beef className="h-7 w-7 text-white" />
                </div>
                <p className="text-2xl font-bold text-red-600">{Math.round(consumedMacros.protein)}g</p>
                <p className="text-red-700 text-sm">/ {macros.protein}g</p>
                <div className="mt-3 h-2 bg-red-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.protein, macros.protein)}%` }}
                  />
                </div>
                <p className="text-xs text-red-700 mt-1 font-medium">
                  {calculatePercentage(consumedMacros.protein, macros.protein)}% Protein
                </p>
              </div>

              {/* Carbs */}
              <div className="text-center bg-yellow-50 p-4 rounded-lg">
                <div className="w-14 h-14 mx-auto bg-yellow-600 rounded-full flex items-center justify-center mb-3">
                  <Wheat className="h-7 w-7 text-white" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{Math.round(consumedMacros.carbs)}g</p>
                <p className="text-yellow-700 text-sm">/ {macros.carbs}g</p>
                <div className="mt-3 h-2 bg-yellow-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.carbs, macros.carbs)}%` }}
                  />
                </div>
                <p className="text-xs text-yellow-700 mt-1 font-medium">
                  {calculatePercentage(consumedMacros.carbs, macros.carbs)}% Carbs
                </p>
              </div>

              {/* Fats */}
              <div className="text-center bg-green-50 p-4 rounded-lg">
                <div className="w-14 h-14 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-3">
                  <Apple className="h-7 w-7 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-600">{Math.round(consumedMacros.fat)}g</p>
                <p className="text-green-700 text-sm">/ {macros.fats}g</p>
                <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-500"
                    style={{ width: `${calculatePercentage(consumedMacros.fat, macros.fats)}%` }}
                  />
                </div>
                <p className="text-xs text-green-700 mt-1 font-medium">
                  {calculatePercentage(consumedMacros.fat, macros.fats)}% Fats
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-grey-200">
              <p className="text-sm text-blue-600 text-center font-medium">
                💧 Water intake: {clientData.weight ? Math.round((clientData.weight / 2)) : '--'} oz daily minimum
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

      {/* Food Log Section - Always visible */}
      <Card>
          <CardContent className="p-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-4 mb-6 border-b border-grey-200">
              <button
                onClick={() => setActiveTab('log')}
                className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === 'log'
                    ? 'text-chocolate'
                    : 'text-grey-500 hover:text-grey-700'
                }`}
              >
                Daily Log
                {activeTab === 'log' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chocolate" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === 'history'
                    ? 'text-chocolate'
                    : 'text-grey-500 hover:text-grey-700'
                }`}
              >
                History
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chocolate" />
                )}
              </button>
            </div>

            {activeTab === 'log' ? (
              <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chocolate flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">Food Log</h2>
                  <p className="text-sm text-grey-500">Track your daily meals</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Date Navigation */}
                <div className="flex items-center gap-1 bg-grey-100 rounded-lg p-1">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 hover:bg-grey-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-grey-600" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 min-w-[100px] justify-center">
                    <Calendar className="h-4 w-4 text-grey-500" />
                    <span className="text-sm font-medium text-black">{formatDateDisplay(selectedDate)}</span>
                  </div>
                  <button
                    onClick={() => navigateDate('next')}
                    disabled={isToday}
                    className={`p-2 rounded-lg transition-colors ${
                      isToday ? 'text-grey-300 cursor-not-allowed' : 'hover:bg-grey-200 text-grey-600'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <Button onClick={openAddFoodModal} variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Food
                </Button>
              </div>
            </div>

            {/* Remaining Macros Summary */}
            {remainingMacros && (
              <div className="bg-grey-50 p-4 mb-4 rounded-lg">
                <p className="text-sm font-medium text-grey-700 mb-2">
                  {isToday ? 'Remaining Today:' : `Remaining for ${formatDateDisplay(selectedDate)}:`}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-orange-600 font-semibold">{remainingMacros.calories} cal</span>
                  <span className="text-red-600 font-semibold">{Math.round(remainingMacros.protein)}g protein</span>
                  <span className="text-yellow-600 font-semibold">{Math.round(remainingMacros.carbs)}g carbs</span>
                  <span className="text-green-600 font-semibold">{Math.round(remainingMacros.fat)}g fat</span>
                </div>
              </div>
            )}

            {/* Energy Balance */}
            {burnedCalories > 0 && (
              <div className="bg-grey-50 p-4 mb-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-grey-700">Energy Balance</span>
                  </div>
                  <a href="/dashboard/activity" className="text-xs text-blue-600 hover:underline">
                    Log Activity
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-2 rounded">
                    <p className="text-sm font-bold text-orange-600">{consumedMacros.calories}</p>
                    <p className="text-xs text-grey-500">Consumed</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-sm font-bold text-red-600">{burnedCalories}</p>
                    <p className="text-xs text-grey-500">Burned</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-sm font-bold text-blue-600">{consumedMacros.calories - burnedCalories}</p>
                    <p className="text-xs text-grey-500">Net</p>
                  </div>
                </div>
              </div>
            )}

            {/* Food Log List */}
            {foodLogs.length > 0 ? (
              <div className="space-y-4">
                {mealTypeOrder.map((mealType) => {
                  const meals = groupedFoodLogs[mealType];
                  if (!meals || meals.length === 0) return null;

                  return (
                    <div key={mealType}>
                      <p className="text-xs font-semibold text-grey-500 uppercase tracking-wider mb-2">
                        {mealTypeLabels[mealType]}
                      </p>
                      <div className="space-y-2">
                        {meals.map((food) => (
                          <div
                            key={food.id}
                            className="flex items-center justify-between p-3 bg-grey-50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="font-medium text-black truncate">
                                {food.food_name}
                                {food.serving_size && (
                                  <span className="text-grey-500 text-sm ml-1">({food.serving_size})</span>
                                )}
                              </p>
                              <p className="text-xs text-grey-500 mt-0.5">
                                P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-semibold text-black text-sm sm:text-base">{food.calories} cal</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => toggleFavorite(food)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    favoriteNames.has(food.food_name)
                                      ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                                      : 'text-grey-400 hover:text-yellow-500 hover:bg-yellow-50'
                                  }`}
                                  title={favoriteNames.has(food.food_name) ? 'Remove from favorites' : 'Save as favorite'}
                                >
                                  <Star className="h-4 w-4" fill={favoriteNames.has(food.food_name) ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                  onClick={() => handleDuplicateFood(food)}
                                  className="p-2 text-grey-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Duplicate"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openEditFoodModal(food)}
                                  className="p-2 text-grey-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFood(food.id)}
                                  className="p-2 text-grey-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Daily Total */}
                <div className="pt-4 border-t border-grey-200">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-black">Total {isToday ? 'Today' : formatDateDisplay(selectedDate)}</p>
                    <p className="text-sm text-grey-600">
                      <span className="font-semibold text-black">{consumedMacros.calories} cal</span>
                      {' · '}P: {Math.round(consumedMacros.protein)}g
                      {' · '}C: {Math.round(consumedMacros.carbs)}g
                      {' · '}F: {Math.round(consumedMacros.fat)}g
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-grey-50 rounded-lg">
                <UtensilsCrossed className="h-10 w-10 mx-auto text-grey-300 mb-3" />
                <p className="text-grey-600 text-sm">
                  {isToday
                    ? 'No foods logged yet today. Click "Log Food" to start tracking.'
                    : `No foods logged for ${formatDateDisplay(selectedDate)}.`}
                </p>
              </div>
            )}
              </>
            ) : (
              /* History Tab Content */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-chocolate flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black">Food History</h2>
                      <p className="text-sm text-grey-500">View your past food logs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['week', 'month', 'all'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setHistoryRange(range)}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                          historyRange === range
                            ? 'bg-chocolate text-white'
                            : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
                        }`}
                      >
                        {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All Time'}
                      </button>
                    ))}
                  </div>
                </div>

                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-chocolate" />
                  </div>
                ) : Object.keys(groupedHistoryLogs).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedHistoryLogs)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, logs]) => {
                        const dayTotals = calculateDayTotals(logs);
                        const dateObj = new Date(date + 'T00:00:00');
                        const formattedDate = dateObj.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <div key={date} className="border border-grey-200 rounded-lg overflow-hidden">
                            <div className="bg-grey-50 px-4 py-3 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-black">{formattedDate}</p>
                                <p className="text-xs text-grey-500">{logs.length} items logged</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-chocolate">{dayTotals.calories} cal</p>
                                <p className="text-xs text-grey-500">
                                  P: {Math.round(dayTotals.protein)}g · C: {Math.round(dayTotals.carbs)}g · F: {Math.round(dayTotals.fat)}g
                                </p>
                              </div>
                            </div>
                            <div className="divide-y divide-grey-100">
                              {logs.map((log) => (
                                <div key={log.id} className="px-4 py-2 flex items-center justify-between">
                                  <div className="flex-1 min-w-0 mr-2">
                                    <p className="text-sm font-medium text-black truncate">{log.food_name}</p>
                                    <p className="text-xs text-grey-500">
                                      {mealTypeLabels[log.meal_type || 'other']}
                                      {log.serving_size && ` · ${log.serving_size}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-black">{log.calories} cal</p>
                                      <p className="text-xs text-grey-400">
                                        P: {log.protein}g · C: {log.carbs}g · F: {log.fat}g
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleDuplicateFood(log)}
                                        className="p-1.5 text-grey-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="Add to today's log"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedDate(log.log_date);
                                          openEditFoodModal(log);
                                        }}
                                        className="p-1.5 text-grey-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteFood(log.id)}
                                        className="p-1.5 text-grey-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                    {/* Summary Stats */}
                    <div className="bg-chocolate text-white p-4 rounded-lg">
                      <p className="font-semibold mb-2">
                        {historyRange === 'week' ? '7-Day' : historyRange === 'month' ? '30-Day' : 'All Time'} Summary
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">
                            {Math.round(historyLogs.reduce((sum, l) => sum + (l.calories || 0), 0) / Object.keys(groupedHistoryLogs).length)}
                          </p>
                          <p className="text-xs text-biscotti">Avg Cal/Day</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {Math.round(historyLogs.reduce((sum, l) => sum + (l.protein || 0), 0) / Object.keys(groupedHistoryLogs).length)}g
                          </p>
                          <p className="text-xs text-biscotti">Avg Protein</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{Object.keys(groupedHistoryLogs).length}</p>
                          <p className="text-xs text-biscotti">Days Logged</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{historyLogs.length}</p>
                          <p className="text-xs text-biscotti">Total Entries</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-grey-50 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-grey-300 mb-3" />
                    <p className="text-grey-600 font-medium">No food history yet</p>
                    <p className="text-grey-500 text-sm mt-1">
                      Start logging your meals to see your history here
                    </p>
                    <Button
                      onClick={() => setActiveTab('log')}
                      variant="primary"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log Your First Meal
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                  Click &quot;Generate&quot; to receive AI-powered meal ideas tailored to your macro targets.
                </p>
              </div>
            )}

            <p className="mt-4 text-xs text-grey-400 text-center">
              These are general recommendations, not a medical meal plan. Consult a registered dietitian for specialized nutrition advice.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Nutrition Coaching Tips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">Nutrition Coaching Tips</h2>
          <Button
            onClick={fetchNutritionTips}
            variant={nutritionTips.length > 0 ? 'outline' : 'primary'}
            disabled={loadingNutritionTips}
          >
            {loadingNutritionTips ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : nutritionTips.length > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Tips
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get Coaching Tips
              </>
            )}
          </Button>
        </div>

        {nutritionTips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutritionTips.map((tip, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-black">{tip.title}</h3>
                </div>
                <p className="text-sm text-grey-700 mb-3">{tip.tip}</p>
                <div className="bg-white/70 border border-green-100 p-3">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-1">Action Step</p>
                  <p className="text-sm text-black">{tip.actionStep}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
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
                        onClick={() => setMealOptions(prev => ({ ...prev, mealType: type as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all' }))}
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

      {/* Add/Edit Food Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">
                  {editingFood ? 'Edit Food Entry' : foodQueue.length > 0 ? `Log Foods (${foodQueue.length} queued)` : 'Log Food'}
                </h3>
                <button
                  onClick={() => {
                    setShowFoodModal(false);
                    setFoodQueue([]);
                    resetFoodForm();
                  }}
                  className="text-grey-400 hover:text-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Queue — shown at top so user sees the list they're building */}
              {!editingFood && foodQueue.length > 0 && (
                <div className="mb-4 border border-grey-200 rounded-lg overflow-hidden">
                  <div className="bg-grey-50 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-grey-600 uppercase tracking-wide">
                      Items to log ({foodQueue.length})
                    </span>
                    <span className="text-xs text-grey-500">
                      {foodQueue.reduce((sum, i) => sum + i.calories, 0)} cal &bull;{' '}
                      {foodQueue.reduce((sum, i) => sum + i.protein, 0).toFixed(0)}g P &bull;{' '}
                      {foodQueue.reduce((sum, i) => sum + i.carbs, 0).toFixed(0)}g C &bull;{' '}
                      {foodQueue.reduce((sum, i) => sum + i.fat, 0).toFixed(0)}g F
                    </span>
                  </div>
                  <ul className="divide-y divide-grey-100">
                    {foodQueue.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between px-4 py-2 text-sm">
                        <span className="font-medium text-black truncate max-w-[55%]">{item.food_name}</span>
                        <span className="text-grey-500 text-xs mr-2">{item.calories} cal &bull; {item.protein}g P</span>
                        <button
                          type="button"
                          onClick={() => setFoodQueue(prev => prev.filter((_, i) => i !== idx))}
                          className="text-grey-400 hover:text-red-500 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {/* Mode Toggle */}
                {!editingFood && (
                  <div className="flex bg-grey-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        stopScanner();
                        setFoodEntryMode('search');
                        setNewFood({ ...newFood, food_name: '', calories: '', protein: '', carbs: '', fat: '', serving_size: '' });
                        setSearchQuery('');
                        setScanError(null);
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        foodEntryMode === 'search'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-grey-600 hover:text-grey-800'
                      }`}
                    >
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopScanner();
                        setFoodEntryMode('scan');
                        setScanError(null);
                        // Start scanner after state update
                        setTimeout(() => startScanner(), 100);
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        foodEntryMode === 'scan'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-grey-600 hover:text-grey-800'
                      }`}
                    >
                      <ScanBarcode className="h-4 w-4" />
                      <span className="hidden sm:inline">Scan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopScanner();
                        setFoodEntryMode('manual');
                        setSearchResults([]);
                        setShowSearchResults(false);
                        setScanError(null);
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        foodEntryMode === 'manual'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-grey-600 hover:text-grey-800'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Custom</span>
                    </button>
                  </div>
                )}

                {/* Barcode Scanner (only show in scan mode) */}
                {foodEntryMode === 'scan' && !editingFood && (
                  <div className="space-y-4">
                    <div className="bg-grey-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Camera className="h-5 w-5 text-grey-600" />
                        <p className="text-sm font-medium text-black">Scan Product Barcode</p>
                      </div>
                      <p className="text-xs text-grey-500 mb-4">
                        Point your camera at a product barcode to automatically fill in nutrition info.
                      </p>

                      {/* Scanner Container */}
                      <div
                        id="barcode-scanner"
                        ref={scannerRef}
                        className="w-full aspect-[3/2] bg-black rounded-lg overflow-hidden"
                      />

                      {isSearching && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-grey-600">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm">Looking up product...</span>
                        </div>
                      )}

                      {scanError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{scanError}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setScanError(null);
                              startScanner();
                            }}
                            className="mt-2 text-sm text-red-600 font-medium hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-grey-500 text-center">
                      Product not scanning? Try{' '}
                      <button
                        type="button"
                        onClick={() => {
                          stopScanner();
                          setFoodEntryMode('search');
                        }}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        searching
                      </button>
                      {' '}or{' '}
                      <button
                        type="button"
                        onClick={() => {
                          stopScanner();
                          setFoodEntryMode('manual');
                        }}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        entering manually
                      </button>
                      .
                    </p>
                  </div>
                )}

                {/* Favorites (shown in search mode when favorites exist) */}
                {foodEntryMode === 'search' && !editingFood && savedFoods.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-grey-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                      My Favorites
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {savedFoods.map((food) => (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => selectFavoriteFood(food)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 hover:bg-yellow-100 transition-colors rounded-lg"
                        >
                          <span className="font-medium truncate max-w-[140px]">{food.food_name}</span>
                          <span className="text-yellow-600 text-xs flex-shrink-0">{food.calories} cal</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-grey-100 mb-3" />
                  </div>
                )}

                {/* Food Search (only show in search mode) */}
                {foodEntryMode === 'search' && !editingFood ? (
                  <div className="relative">
                    <label className="block text-sm font-medium text-black mb-2">
                      Search Food
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
                      <input
                        type="text"
                        value={searchQuery || newFood.food_name}
                        onChange={(e) => handleFoodSearch(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                        placeholder="Search for a food (e.g., chicken breast, rice)..."
                        className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400 animate-spin" />
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && (searchResults.length > 0 || isSearching) && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-grey-300 shadow-lg max-h-60 overflow-y-auto">
                        {isSearching && searchResults.length === 0 ? (
                          <div className="p-4 text-center text-grey-500">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                            Searching foods...
                          </div>
                        ) : (
                          searchResults.map((food) => (
                            <button
                              key={food.id}
                              type="button"
                              onClick={() => selectSearchResult(food)}
                              className="w-full p-3 text-left hover:bg-blue-50 border-b border-grey-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-black truncate">{food.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {food.brand && (
                                      <span className="text-xs text-blue-600 font-medium">{food.brand}</span>
                                    )}
                                    {food.brand && food.category && food.category !== 'Restaurant' && (
                                      <span className="text-grey-300">•</span>
                                    )}
                                    {food.category && food.category !== food.brand && (
                                      <span className="text-xs text-grey-500">{food.category}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-grey-400 mt-0.5">{food.servingSize}</p>
                                </div>
                                <div className="text-right text-xs flex-shrink-0">
                                  <p className="font-bold text-black">{food.calories} cal</p>
                                  <p className="text-grey-500 whitespace-nowrap">
                                    P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                        {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                          <div className="p-4 text-center space-y-2">
                            <p className="text-grey-500">No foods found.</p>
                            <button
                              type="button"
                              onClick={async () => {
                                setFoodEntryMode('manual');
                                setNewFood({ ...newFood, food_name: searchQuery });
                                setShowSearchResults(false);
                                // Auto-lookup macros
                                setLookingUpMacros(true);
                                try {
                                  const response = await fetch('/api/ai/macro-lookup', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ foodName: searchQuery, quantity: null }),
                                  });
                                  const data = await response.json();
                                  if (data.success && data.nutrition) {
                                    setNewFood(prev => ({
                                      ...prev,
                                      food_name: searchQuery,
                                      serving_size: data.nutrition.serving_size || '',
                                      calories: String(data.nutrition.calories),
                                      protein: String(data.nutrition.protein),
                                      carbs: String(data.nutrition.carbs),
                                      fat: String(data.nutrition.fat),
                                    }));
                                    toast.success('Macros filled in automatically!');
                                  }
                                } catch { /* silent */ } finally {
                                  setLookingUpMacros(false);
                                }
                              }}
                              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                            >
                              <Wand2 className="h-4 w-4" />
                              Auto-fill macros for &quot;{searchQuery}&quot;
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFoodEntryMode('manual');
                                setNewFood({ ...newFood, food_name: searchQuery });
                                setShowSearchResults(false);
                              }}
                              className="text-grey-500 text-sm hover:text-grey-700"
                            >
                              or enter macros manually →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Click outside to close */}
                    {showSearchResults && (
                      <div
                        className="fixed inset-0 z-0"
                        onClick={() => setShowSearchResults(false)}
                      />
                    )}

                    {/* Hint to switch to manual */}
                    <p className="text-xs text-grey-500 mt-2">
                      Can&apos;t find your food? Switch to <button type="button" onClick={() => setFoodEntryMode('manual')} className="text-blue-600 font-medium hover:underline">Add Custom</button> to enter it manually.
                    </p>
                  </div>
                ) : (
                  /* Manual Entry - Food Name Field */
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Food Name *
                    </label>
                    <input
                      type="text"
                      value={newFood.food_name}
                      onChange={(e) => setNewFood({ ...newFood, food_name: e.target.value })}
                      placeholder="e.g., Homemade Protein Shake, Grilled Salmon..."
                      className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    />
                    {newFood.food_name && !newFood.calories && (
                      <button
                        type="button"
                        onClick={lookUpMacros}
                        disabled={lookingUpMacros}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 w-full justify-center"
                      >
                        {lookingUpMacros ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Looking up macros...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4" />
                            Auto-fill macros for &quot;{newFood.food_name}&quot;
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Form fields - hidden during scan mode */}
                {foodEntryMode !== 'scan' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Servings
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={newFood.servings}
                          onChange={(e) => setNewFood({ ...newFood, servings: e.target.value })}
                          placeholder="1"
                          className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Serving Size
                        </label>
                        <input
                          type="text"
                          value={newFood.serving_size}
                          onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                          placeholder="e.g., 4 oz"
                          className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-black">
                          Calories *
                        </label>
                        {foodEntryMode === 'manual' && newFood.food_name && (
                          <button
                            type="button"
                            onClick={lookUpMacros}
                            disabled={lookingUpMacros}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                          >
                            {lookingUpMacros ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Wand2 className="h-3 w-3" />
                            )}
                            {lookingUpMacros ? 'Looking up...' : 'Auto-fill macros'}
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        value={newFood.calories}
                        onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                        placeholder="e.g., 165"
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFood.protein}
                          onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                          placeholder="31"
                          className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFood.carbs}
                          onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                          placeholder="0"
                          className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Fat (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={newFood.fat}
                          onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                          placeholder="3.6"
                          className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Meal Type
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewFood({ ...newFood, meal_type: type })}
                            className={`px-2 py-2 text-xs font-medium transition-colors ${
                              newFood.meal_type === type
                                ? 'bg-blue-600 text-white'
                                : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                            }`}
                          >
                            {mealTypeLabels[type]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={newFood.notes}
                        onChange={(e) => setNewFood({ ...newFood, notes: e.target.value })}
                        placeholder="Any additional notes..."
                        rows={2}
                        className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {!editingFood && (
                  <Button
                    onClick={handleAddToQueue}
                    variant="outline"
                    className="w-full"
                    disabled={!newFood.food_name || !newFood.calories}
                  >
                    + Queue Item &amp; Add Another
                  </Button>
                )}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowFoodModal(false);
                      setFoodQueue([]);
                      resetFoodForm();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveFood}
                    variant="primary"
                    className="flex-1"
                    disabled={(!newFood.food_name && foodQueue.length === 0) || (!newFood.calories && foodQueue.length === 0) || savingFood}
                  >
                    {savingFood ? 'Saving...' : editingFood ? 'Update' : foodQueue.length > 0 ? `Log All (${foodQueue.length + (newFood.food_name && newFood.calories ? 1 : 0)})` : 'Log Food'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
