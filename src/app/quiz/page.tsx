'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Target,
  Dumbbell,
  Clock,
  User,
  Mail,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface QuizAnswer {
  goal: string;
  fitnessLevel: string;
  timeAvailable: string;
  preferredStyle: string;
  challenges: string[];
  name: string;
  email: string;
  phone: string;
}

const questions = [
  {
    id: 'goal',
    title: "What's your primary fitness goal?",
    subtitle: 'Choose the goal that matters most to you right now',
    icon: Target,
    options: [
      { value: 'lose-weight', label: 'Lose Weight', description: 'Burn fat and get leaner' },
      { value: 'build-muscle', label: 'Build Muscle', description: 'Gain strength and size' },
      { value: 'get-toned', label: 'Get Toned', description: 'Build definition without bulk' },
      { value: 'improve-health', label: 'Improve Health', description: 'Better energy and wellness' },
    ],
  },
  {
    id: 'fitnessLevel',
    title: 'How would you describe your current fitness level?',
    subtitle: 'Be honest - this helps us customize your plan',
    icon: Dumbbell,
    options: [
      { value: 'beginner', label: 'Beginner', description: "New to fitness or haven't worked out in years" },
      { value: 'intermediate', label: 'Intermediate', description: 'Some experience, workout occasionally' },
      { value: 'advanced', label: 'Advanced', description: 'Regular workouts, looking to optimize' },
    ],
  },
  {
    id: 'timeAvailable',
    title: 'How much time can you commit to workouts?',
    subtitle: 'Per session, not total per week',
    icon: Clock,
    options: [
      { value: '30-min', label: '30 Minutes', description: 'Quick and efficient workouts' },
      { value: '45-min', label: '45 Minutes', description: 'Balanced sessions' },
      { value: '60-min', label: '60+ Minutes', description: 'Comprehensive training' },
    ],
  },
  {
    id: 'preferredStyle',
    title: 'What type of training interests you most?',
    subtitle: 'We can mix styles, but what draws you in?',
    icon: Sparkles,
    options: [
      { value: 'strength', label: 'Strength Training', description: 'Weights, resistance bands, bodyweight' },
      { value: 'hiit', label: 'HIIT/Cardio', description: 'High intensity, calorie burning' },
      { value: 'hybrid', label: 'Hybrid', description: 'Mix of strength and cardio' },
      { value: 'flexible', label: 'I\'m Flexible', description: 'Whatever works best for my goals' },
    ],
  },
  {
    id: 'challenges',
    title: 'What challenges have held you back before?',
    subtitle: 'Select all that apply',
    icon: User,
    multiSelect: true,
    options: [
      { value: 'motivation', label: 'Staying Motivated', description: 'Hard to stay consistent' },
      { value: 'time', label: 'Finding Time', description: 'Busy schedule' },
      { value: 'knowledge', label: 'Not Sure What to Do', description: 'Lack of guidance' },
      { value: 'nutrition', label: 'Nutrition', description: 'Struggle with eating right' },
      { value: 'injury', label: 'Previous Injury', description: 'Working around limitations' },
      { value: 'accountability', label: 'Accountability', description: 'Need someone to check in' },
    ],
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({
    goal: '',
    fitnessLevel: '',
    timeAvailable: '',
    preferredStyle: '',
    challenges: [],
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const totalSteps = questions.length + 1; // +1 for contact form
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleOptionSelect = (questionId: string, value: string, multiSelect?: boolean) => {
    if (multiSelect) {
      const current = answers[questionId as keyof QuizAnswer] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
      // Auto-advance for single select
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setCurrentStep(questions.length); // Go to contact form
        }
      }, 300);
    }
  };

  const canProceed = () => {
    if (currentStep < questions.length) {
      const question = questions[currentStep];
      const answer = answers[question.id as keyof QuizAnswer];
      if (question.multiSelect) {
        return (answer as string[]).length > 0;
      }
      return answer !== '';
    }
    return answers.name && answers.email;
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);

    try {
      // Save quiz lead to database
      const supabase = createClient();
      await supabase.from('quiz_leads').insert({
        name: answers.name,
        email: answers.email,
        phone: answers.phone || null,
        goal: answers.goal,
        fitness_level: answers.fitnessLevel,
        time_available: answers.timeAvailable,
        preferred_style: answers.preferredStyle,
        challenges: answers.challenges,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving quiz lead:', error);
    }

    setIsSubmitting(false);
    setShowResults(true);
  };

  const getRecommendation = () => {
    const { goal, fitnessLevel, timeAvailable } = answers;

    let program = 'Personalized Fitness Program';
    let description = '';

    if (goal === 'lose-weight') {
      program = fitnessLevel === 'beginner' ? 'Fat Loss Fundamentals' : 'Accelerated Fat Loss';
      description = 'A proven system combining strategic workouts with nutrition guidance to help you shed fat while preserving muscle.';
    } else if (goal === 'build-muscle') {
      program = fitnessLevel === 'beginner' ? 'Muscle Building Basics' : 'Hypertrophy Program';
      description = 'Progressive resistance training designed to maximize muscle growth and strength gains.';
    } else if (goal === 'get-toned') {
      program = 'Body Sculpting Program';
      description = 'Build lean muscle definition with a balanced approach to strength training and nutrition.';
    } else {
      program = 'Total Wellness Program';
      description = 'A holistic approach focusing on sustainable habits, functional fitness, and overall well-being.';
    }

    const duration = timeAvailable === '30-min' ? '30-minute' : timeAvailable === '45-min' ? '45-minute' : '60-minute';

    return {
      program,
      description,
      features: [
        `Customized ${duration} workouts`,
        'Progressive training plan',
        'Nutrition guidelines',
        'Weekly check-ins',
        'Direct coach access',
      ],
    };
  };

  if (showResults) {
    const recommendation = getRecommendation();

    return (
      <div className="min-h-screen bg-grey-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Your Results Are In!</h1>
              <p className="text-blue-100">Based on your answers, we&apos;ve identified the perfect program for you.</p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-grey-500 uppercase text-sm tracking-wider mb-2">Recommended Program</p>
                <h2 className="text-2xl font-bold text-black mb-4">{recommendation.program}</h2>
                <p className="text-grey-600">{recommendation.description}</p>
              </div>

              <div className="bg-grey-50 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-black mb-4">What&apos;s Included:</h3>
                <ul className="space-y-3">
                  {recommendation.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-grey-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center space-y-4">
                <p className="text-grey-600">
                  <strong>{answers.name}</strong>, let&apos;s schedule a free consultation to discuss your personalized plan!
                </p>

                <Button href="/apply" variant="primary" size="lg" className="w-full">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Free Consultation
                </Button>

                <p className="text-sm text-grey-500">
                  We&apos;ll reach out to {answers.email} within 24 hours
                </p>

                <Link href="/pricing" className="text-blue-600 hover:underline text-sm">
                  View pricing options →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-grey-500 mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-grey-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {currentStep < questions.length ? (
            // Question Steps
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const IconComponent = questions[currentStep].icon;
                  return (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-xl font-bold text-black">{questions[currentStep].title}</h2>
                  <p className="text-grey-500 text-sm">{questions[currentStep].subtitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                {questions[currentStep].options.map((option) => {
                  const questionId = questions[currentStep].id as keyof QuizAnswer;
                  const isMultiSelect = questions[currentStep].multiSelect;
                  const isSelected = isMultiSelect
                    ? (answers[questionId] as string[]).includes(option.value)
                    : answers[questionId] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(questions[currentStep].id, option.value, isMultiSelect)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-grey-200 hover:border-grey-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-black">{option.label}</p>
                          <p className="text-sm text-grey-500">{option.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation for multi-select */}
              {questions[currentStep].multiSelect && (
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 text-grey-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </button>
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    variant="primary"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Contact Form Step
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Almost there!</h2>
                  <p className="text-grey-500 text-sm">Enter your details to see your personalized results</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={answers.name}
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={answers.email}
                    onChange={(e) => setAnswers({ ...answers, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    value={answers.phone}
                    onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(questions.length - 1)}
                  className="flex items-center gap-2 text-grey-600 hover:text-black"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  variant="primary"
                >
                  {isSubmitting ? 'Processing...' : 'See My Results'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <p className="text-xs text-grey-500 text-center mt-6">
                By submitting, you agree to receive emails about your fitness journey.
                We respect your privacy and will never spam you.
              </p>
            </div>
          )}
        </div>

        {/* Back Navigation for non-multiselect */}
        {currentStep < questions.length && !questions[currentStep].multiSelect && currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="mt-4 flex items-center gap-2 text-grey-600 hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        )}
      </div>
    </div>
  );
}
