'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Target,
  Dumbbell,
  Activity,
  AlertTriangle,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from 'lucide-react';

const FITNESS_GOALS = [
  { id: 'fat_loss', label: 'Fat Loss', description: 'Reduce body fat while maintaining muscle' },
  { id: 'muscle_gain', label: 'Muscle Gain', description: 'Build lean muscle mass' },
  { id: 'strength', label: 'Strength', description: 'Increase overall strength and power' },
  { id: 'recomposition', label: 'Body Recomposition', description: 'Lose fat and build muscle simultaneously' },
  { id: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness' },
  { id: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness' },
];

const BODY_PART_GOALS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms (Biceps & Triceps)' },
  { id: 'legs', label: 'Legs (Quads & Hamstrings)' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'core', label: 'Core & Abs' },
  { id: 'full_body', label: 'Full Body (Even Development)' },
];

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to weight training (0-6 months)' },
  { id: 'intermediate', label: 'Intermediate', description: 'Consistent training (6 months - 2 years)' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced lifter (2+ years)' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'commercial_gym', label: 'Commercial Gym', description: 'Full access to gym equipment' },
  { id: 'home_gym', label: 'Home Gym', description: 'Barbells, dumbbells, bench, rack' },
  { id: 'minimal', label: 'Minimal Equipment', description: 'Dumbbells and resistance bands' },
  { id: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' },
];

const TRAINING_DAYS = [
  { id: '2', label: '2 Days', description: 'Full body or upper/lower split' },
  { id: '3', label: '3 Days', description: 'Full body or push/pull/legs' },
  { id: '4', label: '4 Days', description: 'Upper/lower or push/pull split' },
  { id: '5', label: '5 Days', description: 'Body part split or push/pull/legs' },
  { id: '6', label: '6 Days', description: 'Push/pull/legs twice weekly' },
];

const COMMON_INJURIES = [
  { id: 'knee_injury', label: 'Knee Issues' },
  { id: 'lower_back_injury', label: 'Lower Back Pain' },
  { id: 'shoulder_injury', label: 'Shoulder Problems' },
  { id: 'neck_injury', label: 'Neck Issues' },
  { id: 'wrist_injury', label: 'Wrist/Hand Issues' },
  { id: 'ankle_injury', label: 'Ankle/Foot Issues' },
  { id: 'hip_injury', label: 'Hip Problems' },
  { id: 'elbow_injury', label: 'Elbow Issues' },
  { id: 'none', label: 'No Current Injuries' },
];

const MEDICAL_CONDITIONS = [
  { id: 'high_blood_pressure', label: 'High Blood Pressure' },
  { id: 'heart_condition', label: 'Heart Condition' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'asthma', label: 'Asthma' },
  { id: 'arthritis', label: 'Arthritis' },
  { id: 'herniated_disc', label: 'Herniated Disc' },
  { id: 'none', label: 'No Medical Conditions' },
];

interface OnboardingData {
  fitnessGoals: string[];
  bodyPartGoals: string[];
  fitnessLevel: string;
  availableEquipment: string;
  trainingDays: string;
  injuries: string[];
  medicalConditions: string[];
  isPregnant: boolean;
  additionalNotes: string;
}

const STEPS = [
  { id: 'goals', title: 'Fitness Goals', icon: Target },
  { id: 'body_parts', title: 'Focus Areas', icon: Activity },
  { id: 'experience', title: 'Experience Level', icon: Dumbbell },
  { id: 'equipment', title: 'Equipment & Schedule', icon: Dumbbell },
  { id: 'health', title: 'Health & Safety', icon: Heart },
  { id: 'review', title: 'Review & Generate', icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fitnessGoals: [],
    bodyPartGoals: [],
    fitnessLevel: '',
    availableEquipment: '',
    trainingDays: '',
    injuries: [],
    medicalConditions: [],
    isPregnant: false,
    additionalNotes: '',
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user already completed onboarding
    const { data: clientDetails } = await supabase
      .from('client_details')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (clientDetails?.onboarding_completed) {
      // Pre-fill with existing data
      setData({
        fitnessGoals: clientDetails.fitness_goals || [],
        bodyPartGoals: clientDetails.body_part_goals || [],
        fitnessLevel: clientDetails.fitness_level || '',
        availableEquipment: clientDetails.available_equipment || '',
        trainingDays: clientDetails.workout_days_per_week?.toString() || '',
        injuries: clientDetails.injuries || [],
        medicalConditions: clientDetails.medical_conditions || [],
        isPregnant: clientDetails.is_pregnant || false,
        additionalNotes: '',
      });
    }

    setLoading(false);
  };

  const handleMultiSelect = (field: 'fitnessGoals' | 'bodyPartGoals' | 'injuries' | 'medicalConditions', value: string) => {
    setData(prev => {
      const current = prev[field];
      if (value === 'none') {
        return { ...prev, [field]: ['none'] };
      }
      const filtered = current.filter(v => v !== 'none');
      if (filtered.includes(value)) {
        return { ...prev, [field]: filtered.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...filtered, value] };
    });
  };

  const handleSingleSelect = (field: 'fitnessLevel' | 'availableEquipment' | 'trainingDays', value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.fitnessGoals.length > 0;
      case 1: return data.bodyPartGoals.length > 0;
      case 2: return data.fitnessLevel !== '';
      case 3: return data.availableEquipment !== '' && data.trainingDays !== '';
      case 4: return data.injuries.length > 0 && data.medicalConditions.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  const saveOnboarding = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('client_details')
      .upsert({
        user_id: user.id,
        fitness_goals: data.fitnessGoals,
        body_part_goals: data.bodyPartGoals,
        fitness_level: data.fitnessLevel,
        available_equipment: data.availableEquipment,
        workout_days_per_week: parseInt(data.trainingDays),
        injuries: data.injuries.filter(i => i !== 'none'),
        medical_conditions: data.medicalConditions.filter(m => m !== 'none'),
        is_pregnant: data.isPregnant,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    setSaving(false);

    if (error) {
      console.error('Error saving onboarding:', error);
      alert('Failed to save your preferences. Please try again.');
      return false;
    }

    return true;
  };

  const generateWorkout = async () => {
    setGenerating(true);

    // First save the onboarding data
    const saved = await saveOnboarding();
    if (!saved) {
      setGenerating(false);
      return;
    }

    // Call the AI workout generation API
    try {
      const response = await fetch('/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitnessGoals: data.fitnessGoals,
          bodyPartGoals: data.bodyPartGoals,
          fitnessLevel: data.fitnessLevel,
          availableEquipment: data.availableEquipment,
          trainingDays: parseInt(data.trainingDays),
          injuries: data.injuries.filter(i => i !== 'none'),
          medicalConditions: data.medicalConditions.filter(m => m !== 'none'),
          isPregnant: data.isPregnant,
          additionalNotes: data.additionalNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/workouts?generated=true');
      } else {
        console.error('Error generating workout:', result.error);
        alert('Error generating workout. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating workout. Please try again.');
    }

    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-grey-200 text-grey-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`hidden sm:block w-full h-1 mx-2 ${
                  index < currentStep ? 'bg-green-600' : 'bg-grey-200'
                }`} style={{ width: '60px' }} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">{STEPS[currentStep].title}</h1>
          <p className="text-grey-600 mt-1">Step {currentStep + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6 lg:p-8">
          {/* Step 0: Fitness Goals */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-grey-600 mb-6">Select your primary fitness goals (choose all that apply)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FITNESS_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleMultiSelect('fitnessGoals', goal.id)}
                    className={`p-4 text-left border-2 transition-colors ${
                      data.fitnessGoals.includes(goal.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-grey-200 hover:border-grey-300'
                    }`}
                  >
                    <p className="font-semibold text-black">{goal.label}</p>
                    <p className="text-sm text-grey-600 mt-1">{goal.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Body Part Goals */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-grey-600 mb-6">Which areas would you like to focus on? (choose up to 3)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BODY_PART_GOALS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => handleMultiSelect('bodyPartGoals', part.id)}
                    disabled={!data.bodyPartGoals.includes(part.id) && data.bodyPartGoals.length >= 3 && part.id !== 'full_body'}
                    className={`p-4 text-center border-2 transition-colors ${
                      data.bodyPartGoals.includes(part.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-grey-200 hover:border-grey-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <p className="font-medium text-black">{part.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-grey-600 mb-6">What is your current fitness level?</p>
              <div className="space-y-4">
                {FITNESS_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleSingleSelect('fitnessLevel', level.id)}
                    className={`w-full p-4 text-left border-2 transition-colors ${
                      data.fitnessLevel === level.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-grey-200 hover:border-grey-300'
                    }`}
                  >
                    <p className="font-semibold text-black">{level.label}</p>
                    <p className="text-sm text-grey-600 mt-1">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Equipment & Schedule */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-grey-600 mb-4">What equipment do you have access to?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => handleSingleSelect('availableEquipment', eq.id)}
                      className={`p-4 text-left border-2 transition-colors ${
                        data.availableEquipment === eq.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-grey-200 hover:border-grey-300'
                      }`}
                    >
                      <p className="font-semibold text-black">{eq.label}</p>
                      <p className="text-sm text-grey-600 mt-1">{eq.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-grey-600 mb-4">How many days per week can you train?</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {TRAINING_DAYS.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => handleSingleSelect('trainingDays', day.id)}
                      className={`p-4 text-center border-2 transition-colors ${
                        data.trainingDays === day.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-grey-200 hover:border-grey-300'
                      }`}
                    >
                      <p className="font-semibold text-black">{day.label}</p>
                      <p className="text-xs text-grey-500 mt-1">{day.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Health & Safety */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Important Safety Information</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    This helps us avoid exercises that may aggravate any existing conditions.
                    Always consult with a healthcare provider before starting a new exercise program.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-grey-600 mb-4">Do you have any current injuries or pain?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMON_INJURIES.map((injury) => (
                    <button
                      key={injury.id}
                      onClick={() => handleMultiSelect('injuries', injury.id)}
                      className={`p-3 text-center border-2 transition-colors ${
                        data.injuries.includes(injury.id)
                          ? injury.id === 'none' ? 'border-green-600 bg-green-50' : 'border-orange-600 bg-orange-50'
                          : 'border-grey-200 hover:border-grey-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-black">{injury.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-grey-600 mb-4">Do you have any medical conditions?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MEDICAL_CONDITIONS.map((condition) => (
                    <button
                      key={condition.id}
                      onClick={() => handleMultiSelect('medicalConditions', condition.id)}
                      className={`p-3 text-center border-2 transition-colors ${
                        data.medicalConditions.includes(condition.id)
                          ? condition.id === 'none' ? 'border-green-600 bg-green-50' : 'border-orange-600 bg-orange-50'
                          : 'border-grey-200 hover:border-grey-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-black">{condition.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.isPregnant}
                    onChange={(e) => setData(prev => ({ ...prev, isPregnant: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <span className="text-black">I am currently pregnant</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Review & Generate */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4">
                <p className="font-medium text-blue-900">Ready to Generate Your Program!</p>
                <p className="text-sm text-blue-700 mt-1">
                  Review your selections below. Our AI will create a personalized workout program based on your profile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-grey-500">Fitness Goals</p>
                    <p className="font-medium text-black">
                      {data.fitnessGoals.map(g => FITNESS_GOALS.find(fg => fg.id === g)?.label).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-grey-500">Focus Areas</p>
                    <p className="font-medium text-black">
                      {data.bodyPartGoals.map(b => BODY_PART_GOALS.find(bp => bp.id === b)?.label).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-grey-500">Experience Level</p>
                    <p className="font-medium text-black">
                      {FITNESS_LEVELS.find(l => l.id === data.fitnessLevel)?.label}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-grey-500">Equipment</p>
                    <p className="font-medium text-black">
                      {EQUIPMENT_OPTIONS.find(e => e.id === data.availableEquipment)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-grey-500">Training Days</p>
                    <p className="font-medium text-black">{data.trainingDays} days per week</p>
                  </div>
                  <div>
                    <p className="text-sm text-grey-500">Health Considerations</p>
                    <p className="font-medium text-black">
                      {data.injuries.includes('none') && data.medicalConditions.includes('none')
                        ? 'None reported'
                        : [...data.injuries, ...data.medicalConditions]
                            .filter(i => i !== 'none')
                            .map(i =>
                              COMMON_INJURIES.find(inj => inj.id === i)?.label ||
                              MEDICAL_CONDITIONS.find(mc => mc.id === i)?.label
                            )
                            .join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={data.additionalNotes}
                  onChange={(e) => setData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any other preferences or information you'd like to share..."
                  rows={3}
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-grey-200">
            <Button
              onClick={() => setCurrentStep(prev => prev - 1)}
              variant="outline"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                variant="primary"
                disabled={!canProceed()}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generateWorkout}
                variant="primary"
                disabled={generating || saving}
              >
                {generating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate My Program
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
