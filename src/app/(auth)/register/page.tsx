'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone, CheckCircle } from 'lucide-react';

const goals = [
  'Lose fat & get lean',
  'Build muscle & strength',
  'Improve overall fitness',
  'Build discipline & structure',
  'Break through a plateau',
  'Other',
];

const workoutDays = ['2', '3', '4', '5', '6'];

const availability = [
  'Mornings (5:30 AM - 11 AM)',
  'Evenings (4:30 PM - 7 PM)',
  'Flexible / Either works',
];

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    workoutDays: '',
    availability: '',
    goals: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile with additional details
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: 'client',
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Create/update client details (trigger may have already created the row)
      const { error: detailsError } = await supabase.from('client_details').upsert({
        user_id: data.user.id,
        workout_days_per_week: parseInt(formData.workoutDays),
        availability: formData.availability,
        goals: formData.goals,
        onboarding_completed: false,
      }, { onConflict: 'user_id' });

      if (detailsError) {
        console.error('Client details error:', detailsError);
      }

      // If the session is already available (e.g., email confirmation disabled),
      // redirect to onboarding immediately
      if (data.session) {
        router.push('/dashboard/onboarding');
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white p-8 lg:p-10 text-center">
          <div className="w-16 h-16 bg-blue-600 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Check Your Email</h1>
          <p className="mt-4 text-grey-600">
            We&apos;ve sent a confirmation link to <strong>{formData.email}</strong>.
            Please click the link to verify your account.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white p-8 lg:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black">Create Your Account</h1>
          <p className="mt-2 text-grey-600">
            Join Elevated Physique Fitness
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-black">
              Full Name *
            </label>
            <div className="mt-2 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email *
            </label>
            <div className="mt-2 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-black">
              Phone Number *
            </label>
            <div className="mt-2 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black">
              Password *
            </label>
            <div className="mt-2 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full border border-grey-300 pl-10 pr-12 py-3 text-black focus:outline-none focus:border-blue-600"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
              Confirm Password *
            </label>
            <div className="mt-2 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Workout Days */}
          <div>
            <label htmlFor="workoutDays" className="block text-sm font-medium text-black">
              Days per Week to Workout *
            </label>
            <select
              id="workoutDays"
              name="workoutDays"
              value={formData.workoutDays}
              onChange={handleChange}
              required
              className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">Select...</option>
              {workoutDays.map((day) => (
                <option key={day} value={day}>
                  {day} days
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-black">
              Availability *
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">Select your preferred time...</option>
              {availability.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Goals */}
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-black">
              Primary Goal *
            </label>
            <select
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              required
              className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="">Select your primary goal...</option>
              {goals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-grey-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
