import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { Target, Heart, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react';

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
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              About
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              About Elevated Physique
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Building discipline in the gym. Building discipline in life.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-black">
                Founded in 2017
              </h2>
              <div className="mt-6 space-y-4 text-grey-600 text-lg leading-relaxed">
                <p>
                  Elevated Physique Fitness was founded in 2017 by John&apos;te Horace, whose personal pursuit
                  of a stronger, more disciplined physique grew into a passion for helping others
                  transform.
                </p>
                <p className="font-medium text-black italic border-l-4 border-blue-600 pl-4 py-2">
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
            <div className="bg-grey-100 p-8 lg:p-12">
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-6xl font-bold">JH</p>
                  <p className="text-blue-200 text-sm mt-2 uppercase tracking-wider">John&apos;te Horace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your Coach */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-4">
              Meet Your Coach
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-black">
              John&apos;te Horace
            </h2>
            <p className="mt-6 text-grey-600 text-lg leading-relaxed">
              John&apos;te is committed to helping clients build a body they&apos;re proud of and the
              habits to maintain it for life. With years of experience coaching beginners,
              busy professionals, and experienced lifters, his approach combines structured
              programming with genuine accountability to deliver real, lasting results.
            </p>
            <p className="mt-4 text-grey-600 text-lg leading-relaxed">
              Every session is intentional. Every program is personalized. Every client matters.
            </p>
          </div>
        </div>
      </section>

      {/* Coaching Philosophy */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Coaching Philosophy"
            title="What We Believe"
            description="These principles guide every program we create and every client we coach."
          />

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {philosophy.map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 bg-grey-100">
                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{item.title}</h3>
                  <p className="mt-2 text-grey-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-6 text-grey-400 max-w-2xl mx-auto">
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
