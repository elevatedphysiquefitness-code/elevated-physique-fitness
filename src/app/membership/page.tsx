import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import {
  ClipboardList,
  Eye,
  Calendar,
  TrendingUp,
  Compass,
  Clock,
  Star,
  MessageCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Membership Benefits | Elevated Physique Fitness',
  description: 'Discover what\'s included in every Elevated Physique coaching membership. Premium benefits designed for real transformation.',
};

const benefits = [
  {
    icon: ClipboardList,
    title: 'Personalized Training Program',
    description: 'A fully customized program built specifically for your goals, experience level, and available equipment.',
  },
  {
    icon: Eye,
    title: 'Form Correction & Movement Education',
    description: 'Learn proper technique to maximize results and minimize injury risk. Every rep done right.',
  },
  {
    icon: Calendar,
    title: 'Weekly Accountability',
    description: 'Regular check-ins to keep you consistent, motivated, and on track toward your goals.',
  },
  {
    icon: TrendingUp,
    title: 'Monthly Progress Tracking',
    description: 'Data-driven assessments to measure your progress and make informed adjustments.',
  },
  {
    icon: Compass,
    title: 'Lifestyle Structure Coaching',
    description: 'Guidance on habits, routines, and mindset that support your transformation beyond the gym.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your life. We work around your schedule, not the other way around.',
  },
  {
    icon: Star,
    title: 'Priority Access to Open Session Times',
    description: 'Members get first access to preferred time slots and scheduling priority.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Support Between Sessions',
    description: 'Questions don\'t wait. Get answers and guidance whenever you need them.',
  },
  {
    icon: GraduationCap,
    title: 'Long-Term Training Education',
    description: 'Learn the principles behind your programming so you understand why it works.',
  },
  {
    icon: Sparkles,
    title: 'Coaching That Elevates Your Entire Life',
    description: 'Fitness should enhance everything else. We help you become more disciplined in every area.',
  },
];

export default function MembershipPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Membership
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              More Than Training.
              <span className="block text-blue-500">Complete Transformation.</span>
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Every membership includes premium benefits designed to support your
              transformation in the gym and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What's Included"
            title="Membership Benefits"
            description="Every Elevated Physique membership includes these premium benefits."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 p-6 bg-grey-100 hover:bg-grey-200 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{benefit.title}</h3>
                  <p className="mt-2 text-grey-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Elevated Difference */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              The Elevated Difference
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              This Isn&apos;t Just Fitness. It&apos;s a Lifestyle.
            </h2>
            <p className="mt-6 text-grey-300 text-lg leading-relaxed">
              At Elevated Physique, we don&apos;t just train your body — we help you build the
              discipline, structure, and habits that transform every area of your life.
              When you commit to elevating your physique, you commit to elevating everything.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-grey-800 p-8 text-center">
              <p className="text-5xl font-bold text-blue-500">100%</p>
              <p className="mt-4 text-grey-400">Personalized Programming</p>
            </div>
            <div className="border border-grey-800 p-8 text-center">
              <p className="text-5xl font-bold text-blue-500">24/7</p>
              <p className="mt-4 text-grey-400">Coach Access & Support</p>
            </div>
            <div className="border border-grey-800 p-8 text-center">
              <p className="text-5xl font-bold text-blue-500">1</p>
              <p className="mt-4 text-grey-400">Mission: Your Transformation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Experience the Difference?
          </h2>
          <p className="mt-6 text-blue-100 max-w-2xl mx-auto">
            Apply today and discover what structured, intentional coaching can do for
            your physique and your life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/apply"
              size="lg"
              className="bg-white text-blue-600 hover:bg-grey-100"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/pricing"
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
