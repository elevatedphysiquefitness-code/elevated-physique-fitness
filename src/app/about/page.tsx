import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { Target, Heart, Zap, Users, ArrowRight } from 'lucide-react';
import AdminImageUpload from '@/components/admin/AdminImageUpload';

export const metadata: Metadata = {
  title: 'About | Elevated Physique Fitness',
  description: 'Learn about Elevated Physique Fitness, founded in 2017, and our mission to help clients build discipline in the gym and in life.',
};

const philosophy = [
  {
    icon: Target,
    title: 'Structure Creates Confidence',
    description: 'Clear programming removes doubt and builds momentum toward your goals.',
  },
  {
    icon: Heart,
    title: 'Discipline Builds Results',
    description: 'Consistency and accountability are the foundation of lasting transformation.',
  },
  {
    icon: Zap,
    title: 'Training Should Elevate Your Life',
    description: 'Fitness isn\'t just about the gym — it\'s about becoming better in every area.',
  },
  {
    icon: Users,
    title: 'Intentional Coaching, Not Guesswork',
    description: 'Every client deserves a coach who is fully invested in their success.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section with Image */}
      <section className="py-24 bg-brown-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <AdminImageUpload
            imageKey="about-hero"
            className="w-full h-full"
            aspectRatio=""
            alt="Elevated Physique Fitness Hero"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brown-300 text-sm font-semibold uppercase tracking-widest mb-6">
              About
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              About Elevated Physique
            </h1>
            <p className="mt-8 text-xl text-brown-200 leading-relaxed">
              Building discipline in the gym. Building discipline in life.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story with Trainer Image */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brown-700 text-sm font-semibold uppercase tracking-widest mb-4">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
                Founded in 2017
              </h2>
              <div className="mt-6 space-y-4 text-brown-600 text-lg leading-relaxed">
                <p>
                  Elevated Physique Fitness was founded in 2017 by John&apos;te Horace, whose personal pursuit
                  of a stronger, more disciplined physique grew into a passion for helping others
                  transform.
                </p>
                <p className="font-medium text-brown-900 italic border-l-4 border-brown-700 pl-4 py-2">
                  &ldquo;At Elevated Physique Fitness, we don&apos;t just transform bodies — we transform lives.
                  Our approach goes beyond the gym, teaching you the &lsquo;why&rsquo; behind every workout,
                  nutrition recommendation, and habit we build together. Fitness is the foundation,
                  but discipline is the legacy.&rdquo;
                </p>
                <p>
                  Today, Elevated Physique guides beginners, busy professionals, and experienced
                  lifters through structured, intentional coaching designed to build discipline
                  not only in the gym, but in everyday life.
                </p>
                <p>
                  What started as a personal journey has become a mission: to help every client
                  build a body they&apos;re proud of and the habits to maintain it for life.
                </p>
              </div>
            </div>
            <div className="bg-brown-100 p-4">
              <AdminImageUpload
                imageKey="about-trainer-portrait"
                className="w-full"
                aspectRatio="aspect-square"
                alt="John'te Horace - Founder & Head Coach"
                placeholder={
                  <div className="text-center text-brown-500">
                    <p className="text-6xl font-bold text-brown-400">JH</p>
                    <p className="text-brown-400 text-sm mt-2 uppercase tracking-wider">John&apos;te Horace</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Training Images Gallery */}
      <section className="py-24 bg-brown-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brown-700 text-sm font-semibold uppercase tracking-widest mb-4">
              The Experience
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
              Training at Elevated Physique
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminImageUpload
              imageKey="about-training-client"
              className="w-full"
              aspectRatio="aspect-[4/3]"
              alt="Training a client"
              placeholder={
                <div className="text-center text-brown-500">
                  <p className="text-sm">Training Session</p>
                </div>
              }
            />
            <AdminImageUpload
              imageKey="about-gym-facility"
              className="w-full"
              aspectRatio="aspect-[4/3]"
              alt="Gym facility"
              placeholder={
                <div className="text-center text-brown-500">
                  <p className="text-sm">Training Facility</p>
                </div>
              }
            />
            <AdminImageUpload
              imageKey="about-action-shot"
              className="w-full"
              aspectRatio="aspect-[4/3]"
              alt="Action shot during workout"
              placeholder={
                <div className="text-center text-brown-500">
                  <p className="text-sm">In Action</p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Meet Your Coach */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brown-700 text-sm font-semibold uppercase tracking-widest mb-4">
              Meet Your Coach
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
              John&apos;te Horace
            </h2>
            <p className="mt-6 text-brown-600 text-lg leading-relaxed">
              John&apos;te is committed to helping clients build a body they&apos;re proud of and the
              habits to maintain it for life. With years of experience coaching beginners,
              busy professionals, and experienced lifters, his approach combines structured
              programming with genuine accountability to deliver real, lasting results.
            </p>
            <p className="mt-4 text-brown-600 text-lg leading-relaxed">
              Every session is intentional. Every program is personalized. Every client matters.
            </p>
          </div>
        </div>
      </section>

      {/* Coaching Philosophy */}
      <section className="py-24 bg-brown-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Coaching Philosophy"
            title="What We Believe"
            description="These principles guide every program we create and every client we coach."
          />

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {philosophy.map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 bg-white border border-brown-200">
                <div className="w-12 h-12 bg-brown-700 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown-900">{item.title}</h3>
                  <p className="mt-2 text-brown-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brown-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-6 text-brown-300 max-w-2xl mx-auto">
            Join the clients who have transformed their bodies and built lasting discipline
            with Elevated Physique Fitness.
          </p>
          <div className="mt-10">
            <Button href="/apply" size="lg" variant="primary">
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
