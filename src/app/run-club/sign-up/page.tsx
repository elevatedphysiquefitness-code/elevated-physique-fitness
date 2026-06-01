'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Send, CheckCircle, Loader2, Phone } from 'lucide-react';

const runningExperienceLevels = [
  "I've never run before",
  'I run occasionally (less than once a week)',
  'I run 1–3 days per week',
  'I run 4+ days per week / competitive runner',
];

const weeklyMileageOptions = [
  '0 miles (just starting out)',
  '1–10 miles per week',
  '11–20 miles per week',
  '20+ miles per week',
];

const paceOptions = [
  'Walk / run-walk intervals',
  '12+ min/mile',
  '10–12 min/mile',
  '8–10 min/mile',
  'Under 8 min/mile',
];

const runningGoals = [
  'Build a running habit',
  'Improve my pace & endurance',
  'Train for a 5K or 10K',
  'Train for a half or full marathon',
  'Add cardio to my current training',
  'Community & social running',
];

const howHeardOptions = [
  'Instagram / Social media',
  'Referred by a friend',
  'Google',
  "I'm an existing Elevated Physique member",
  'Other',
];

export default function RunClubSignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    runningExperience: '',
    weeklyMileage: '',
    currentPace: '',
    runningGoal: '',
    injuries: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    howHeard: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/run-club-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again or email us directly.');
      }
    } catch {
      alert('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-[#EBE4D6]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-brown-700 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-brown-900">You&apos;re In!</h2>
          <p className="mt-4 text-brown-700">
            Welcome to the Elevated Physique Run Club. We&apos;ll add you to the group chat
            and you&apos;ll receive the location and details before each Saturday run.
          </p>
          <p className="mt-3 text-brown-600 text-sm">See you out there.</p>
          <Button href="/run-club" className="mt-8">
            Back to Run Club
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="py-24 bg-brown-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brown-300 text-sm font-semibold uppercase tracking-widest mb-6">
              Run Club
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Join the Run Club
            </h1>
            <p className="mt-6 text-xl text-brown-200 leading-relaxed">
              Fill out the form below and we&apos;ll add you to our run group. You&apos;ll
              get the weekly meeting location and any updates before each Saturday run.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-24 bg-[#EBE4D6]">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-brown-900">Run Club Sign-Up</h2>
            <p className="mt-2 text-brown-600">
              All paces welcome — no experience required.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-brown-900">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brown-900">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700"
                  placeholder="you@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brown-900">
                  Phone Number
                </label>
                <div className="mt-2 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brown-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-brown-200 pl-10 pr-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="border-t border-brown-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brown-500 mb-5">
                  Your Running Background
                </p>

                {/* Running Experience */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="runningExperience" className="block text-sm font-medium text-brown-900">
                      Running Experience *
                    </label>
                    <select
                      id="runningExperience"
                      name="runningExperience"
                      required
                      value={formData.runningExperience}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700 bg-white"
                    >
                      <option value="">Select your experience level</option>
                      {runningExperienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weekly Mileage */}
                  <div>
                    <label htmlFor="weeklyMileage" className="block text-sm font-medium text-brown-900">
                      Current Weekly Mileage
                    </label>
                    <select
                      id="weeklyMileage"
                      name="weeklyMileage"
                      value={formData.weeklyMileage}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700 bg-white"
                    >
                      <option value="">Select approximate mileage</option>
                      {weeklyMileageOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pace */}
                  <div>
                    <label htmlFor="currentPace" className="block text-sm font-medium text-brown-900">
                      Approximate Pace per Mile
                    </label>
                    <select
                      id="currentPace"
                      name="currentPace"
                      value={formData.currentPace}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700 bg-white"
                    >
                      <option value="">Select your current pace</option>
                      {paceOptions.map((pace) => (
                        <option key={pace} value={pace}>
                          {pace}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Goal */}
                  <div>
                    <label htmlFor="runningGoal" className="block text-sm font-medium text-brown-900">
                      Running Goal *
                    </label>
                    <select
                      id="runningGoal"
                      name="runningGoal"
                      required
                      value={formData.runningGoal}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700 bg-white"
                    >
                      <option value="">Select your primary goal</option>
                      {runningGoals.map((goal) => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Injuries */}
                  <div>
                    <label htmlFor="injuries" className="block text-sm font-medium text-brown-900">
                      Injuries or Physical Limitations{' '}
                      <span className="text-brown-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="injuries"
                      name="injuries"
                      rows={3}
                      value={formData.injuries}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700 resize-none"
                      placeholder="Let us know about any injuries, chronic pain, or limitations we should be aware of..."
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-brown-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-brown-500 mb-5">
                  Emergency Contact <span className="normal-case font-normal">(optional but appreciated)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-brown-900">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-brown-900">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* How Heard */}
              <div className="border-t border-brown-100 pt-6">
                <label htmlFor="howHeard" className="block text-sm font-medium text-brown-900">
                  How did you hear about us?
                </label>
                <select
                  id="howHeard"
                  name="howHeard"
                  value={formData.howHeard}
                  onChange={handleChange}
                  className="mt-2 w-full border border-brown-200 px-4 py-3 text-brown-900 focus:outline-none focus:border-brown-700 bg-white"
                >
                  <option value="">Select...</option>
                  {howHeardOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing Up...
                  </>
                ) : (
                  <>
                    Join the Run Club
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-brown-500 text-center">
                We&apos;ll reach out with the group chat link and weekly run details.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
