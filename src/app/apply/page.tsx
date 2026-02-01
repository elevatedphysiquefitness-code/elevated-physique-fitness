'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Send, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const goals = [
  'Lose fat & get lean',
  'Build muscle & strength',
  'Improve overall fitness',
  'Build discipline & structure',
  'Break through a plateau',
  'Other',
];

const experienceLevels = [
  'Complete beginner (never trained)',
  'Some experience (0-1 year)',
  'Intermediate (1-3 years)',
  'Advanced (3+ years)',
];

const availability = [
  'Mornings (5:30 AM - 11 AM)',
  'Evenings (4:30 PM - 7 PM)',
  'Flexible / Either works',
];

const programInterest = [
  'In-Person Training (Houston)',
  'Online Coaching',
  'Not sure yet',
];

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    goals: '',
    experience: '',
    availability: '',
    programInterest: '',
    whyElevated: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again or contact us directly.');
      }
    } catch (error) {
      alert('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-grey-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-blue-600 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-black">Application Received</h2>
          <p className="mt-4 text-grey-600">
            Thank you for applying to Elevated Physique Fitness. I&apos;ll review your
            application and get back to you within 24-48 hours.
          </p>
          <Button href="/" variant="primary" className="mt-8">
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Apply
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Apply for Coaching
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Ready to elevate your physique and your life? Fill out the application below
              and I&apos;ll be in touch within 24-48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-black">Coaching Application</h2>
            <p className="mt-2 text-grey-600">
              Tell me about yourself and your goals. All fields are required.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-black">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  placeholder="you@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-black">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Training Goals */}
              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-black">
                  Training Goals *
                </label>
                <select
                  id="goals"
                  name="goals"
                  required
                  value={formData.goals}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="">Select your primary goal</option>
                  {goals.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-black">
                  Experience Level *
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
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
                  required
                  value={formData.availability}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="">Select your preferred time</option>
                  {availability.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Interest */}
              <div>
                <label htmlFor="programInterest" className="block text-sm font-medium text-black">
                  Which program are you interested in? *
                </label>
                <select
                  id="programInterest"
                  name="programInterest"
                  required
                  value={formData.programInterest}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="">Select a program</option>
                  {programInterest.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              {/* Why Elevated Physique */}
              <div>
                <label htmlFor="whyElevated" className="block text-sm font-medium text-black">
                  Why do you want to train with Elevated Physique? *
                </label>
                <textarea
                  id="whyElevated"
                  name="whyElevated"
                  required
                  rows={4}
                  value={formData.whyElevated}
                  onChange={handleChange}
                  className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                  placeholder="Tell me about your goals, what you've tried before, and what you're looking for in a coach..."
                />
              </div>

              {/* Submit */}
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-grey-500 text-center">
                I&apos;ll review your application and respond within 24-48 hours.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
