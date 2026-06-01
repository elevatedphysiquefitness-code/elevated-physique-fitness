import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { Users, Zap, Dumbbell, Heart, Clock, Check, ArrowRight, Calendar } from 'lucide-react';
import AdminImageUpload from '@/components/admin/AdminImageUpload';

export const metadata: Metadata = {
  title: 'Group Fitness | Elevated Physique Fitness',
  description:
    'High-energy group fitness classes in Houston — Bootcamp, HIIT, Strength & Conditioning, and Core & Mobility. Coach-led, all fitness levels welcome.',
};

const classes = [
  {
    icon: Zap,
    name: 'Bootcamp',
    duration: '45 min',
    level: 'All Levels',
    description:
      'A full-body circuit combining strength movements and cardio drills designed to build endurance, torch calories, and push your limits in a high-energy group setting.',
    schedule: 'Mon / Wed / Fri — 6:00 AM & 6:00 PM',
    imageKey: 'group-bootcamp',
    defaultImage:
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
  },
  {
    icon: Dumbbell,
    name: 'Strength & Conditioning',
    duration: '60 min',
    level: 'Beginner – Intermediate',
    description:
      'Barbell and dumbbell-based sessions focused on building real strength with proper form. Learn the fundamentals of lifting in a supportive group environment with direct coaching.',
    schedule: 'Tue / Thu — 6:00 AM & 7:00 PM',
    imageKey: 'group-strength',
    defaultImage:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  },
  {
    icon: Heart,
    name: 'HIIT Training',
    duration: '30 min',
    level: 'Intermediate',
    description:
      'Short, intense intervals designed to maximize calorie burn and improve cardiovascular fitness in minimum time. Efficient, challenging, and results-driven.',
    schedule: 'Sat — 9:00 AM',
    imageKey: 'group-hiit',
    defaultImage:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
  },
  {
    icon: Users,
    name: 'Core & Mobility',
    duration: '45 min',
    level: 'All Levels',
    description:
      'Targeted core work paired with mobility drills to improve posture, reduce injury risk, and help you move and feel better every day. Great as a standalone class or complement to other training.',
    schedule: 'Sun — 10:00 AM',
    imageKey: 'group-core',
    defaultImage:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  },
];

const benefits = [
  'Coach-led sessions with structured programming',
  'Small class sizes for personal attention and form coaching',
  'All equipment provided — just show up',
  'Programming updated monthly so it never gets stale',
  'Accountability from a motivated community',
  'Modifications available for every fitness level',
];

export default function GroupFitnessPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 bg-brown-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brown-300 text-sm font-semibold uppercase tracking-widest mb-6">
              Group Fitness
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Train Together. Push Harder.
            </h1>
            <p className="mt-8 text-xl text-brown-200 leading-relaxed">
              Coach-led group fitness classes in Houston built around structure, intensity,
              and community. Whether you&apos;re brand new to fitness or looking to level up,
              there&apos;s a class for you.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button href="/contact" size="lg">
                Reserve Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                href="/pricing"
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brown-900"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-brown-600 text-sm font-semibold uppercase tracking-widest mb-4">
              What We Offer
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
              Four Classes. One Mission.
            </h2>
            <p className="mt-4 text-brown-600 text-lg">
              Every class is programmed with purpose — no random workouts. You&apos;ll follow
              structured, progressive training that delivers real results over time.
            </p>
          </div>

          <div className="space-y-24">
            {classes.map((cls, index) => (
              <div
                key={cls.name}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-16 h-16 bg-brown-700 flex items-center justify-center mb-6">
                    <cls.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-brown-900">{cls.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-brown-600">
                      <Clock className="h-4 w-4" />
                      {cls.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-brown-600">
                      <Users className="h-4 w-4" />
                      {cls.level}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-brown-600">
                      <Calendar className="h-4 w-4" />
                      {cls.schedule}
                    </span>
                  </div>
                  <p className="mt-4 text-brown-600 text-lg">{cls.description}</p>
                </div>

                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <AdminImageUpload
                    imageKey={cls.imageKey}
                    className="w-full"
                    aspectRatio="aspect-[4/3]"
                    alt={cls.name}
                    defaultImage={cls.defaultImage}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-[#EBE4D6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brown-600 text-sm font-semibold uppercase tracking-widest mb-4">
                Why Group Fitness
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
                More Than a Workout
              </h2>
              <p className="mt-4 text-brown-700 text-lg">
                Group fitness at Elevated Physique isn&apos;t just about burning calories —
                it&apos;s about showing up consistently, building habits, and training
                alongside people who push you to be better.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brown-700 flex-shrink-0 mt-0.5" />
                    <span className="text-brown-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <AdminImageUpload
                imageKey="group-fitness-benefits"
                className="w-full"
                aspectRatio="aspect-[4/5]"
                alt="Group fitness class"
                defaultImage="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-brown-600 text-sm font-semibold uppercase tracking-widest mb-4">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
              Flexible Options
            </h2>
            <p className="mt-4 text-brown-600 text-lg">
              Whether you want to try a single class or commit to a membership, we have
              options to fit your schedule and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Drop-In', price: '$20', detail: 'Per class, no commitment' },
              {
                label: '10-Class Pack',
                price: '$150',
                detail: 'Use anytime — never expires',
                highlight: true,
              },
              { label: 'Unlimited Monthly', price: '$149', detail: 'All classes, every week' },
            ].map((tier) => (
              <div
                key={tier.label}
                className={`p-8 border-2 text-center ${
                  tier.highlight
                    ? 'border-brown-700 bg-brown-900 text-white'
                    : 'border-brown-200 bg-white text-brown-900'
                }`}
              >
                <p
                  className={`text-sm font-semibold uppercase tracking-widest mb-3 ${
                    tier.highlight ? 'text-brown-300' : 'text-brown-600'
                  }`}
                >
                  {tier.label}
                </p>
                <p className="text-4xl font-bold">{tier.price}</p>
                <p
                  className={`mt-2 text-sm ${
                    tier.highlight ? 'text-brown-300' : 'text-brown-500'
                  }`}
                >
                  {tier.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-brown-500 text-sm mt-8">
            Existing 1-on-1 coaching clients receive discounted group class add-ons.{' '}
            <a href="/contact" className="text-brown-700 underline hover:text-brown-900">
              Contact us for details.
            </a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brown-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Join Your First Class?
          </h2>
          <p className="mt-6 text-brown-200 max-w-2xl mx-auto">
            Spots are limited to keep class sizes small and coaching quality high.
            Reach out to reserve your spot or ask any questions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              size="lg"
              className="bg-white text-brown-700 hover:bg-brown-100"
            >
              Reserve Your Spot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/pricing"
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brown-700"
            >
              View Full Pricing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
