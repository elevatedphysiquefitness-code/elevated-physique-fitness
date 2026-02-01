'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Send, CheckCircle, MapPin, Mail, ArrowRight, Phone, Loader2 } from 'lucide-react';

const goals = [
  'Lose fat & get lean',
  'Build muscle & strength',
  'Improve overall fitness',
  'Build discipline & structure',
  'Break through a plateau',
  'Just have a question',
  'Other',
];

const workoutDays = ['2', '3', '4', '5', '6'];

const availability = [
  'Mornings (5:30 AM - 11 AM)',
  'Evenings (4:30 PM - 7 PM)',
  'Flexible / Either works',
  'Online coaching only',
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workoutDays: '',
    availability: '',
    goals: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again or email us directly.');
      }
    } catch (error) {
      alert('Something went wrong. Please try again or email us directly.');
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
          <h2 className="text-3xl font-bold text-black">Message Sent</h2>
          <p className="mt-4 text-grey-600">
            Thank you for reaching out. I&apos;ll get back to you as soon as possible.
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
              Contact
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Get In Touch
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Have questions? Ready to start your transformation? I&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-black">Contact Information</h2>
              <p className="mt-4 text-grey-600">
                Based in Houston, TX offering private gym training and online coaching worldwide.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-black">Location</p>
                    <p className="text-grey-600">Houston, TX</p>
                    <p className="text-grey-500 text-sm">Private gym training facility</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-black">Email</p>
                    <a
                      href="mailto:elevatedphysiquefitness@gmail.com"
                      className="text-blue-600 hover:underline"
                    >
                      elevatedphysiquefitness@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="mt-12 p-8 bg-black text-white">
                <h3 className="text-xl font-bold">Ready to Apply?</h3>
                <p className="mt-2 text-grey-400">
                  If you&apos;re ready to start your transformation, apply directly for coaching.
                </p>
                <Button href="/apply" variant="primary" className="mt-6">
                  Apply for Coaching
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Quick Contact */}
              <div className="mt-8 p-6 bg-white">
                <h3 className="text-lg font-bold text-black mb-4">Prefer to Email Directly?</h3>
                <p className="text-grey-600 text-sm mb-4">
                  Send me an email and I&apos;ll get back to you within 24 hours.
                </p>
                <Button
                  href="mailto:elevatedphysiquefitness@gmail.com"
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Me Directly
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 lg:p-12">
              <h2 className="text-2xl font-bold text-black">Send a Message</h2>
              <p className="mt-2 text-grey-600">
                Tell me about yourself and your goals.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black">
                    Email *
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
                    Phone Number
                  </label>
                  <div className="mt-2 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Workout Days */}
                <div>
                  <label htmlFor="workoutDays" className="block text-sm font-medium text-black">
                    Days per Week to Workout
                  </label>
                  <select
                    id="workoutDays"
                    name="workoutDays"
                    value={formData.workoutDays}
                    onChange={handleChange}
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
                    Availability
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
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
                    Primary Goal
                  </label>
                  <select
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
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

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-2 w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                    placeholder="How can I help you?"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
