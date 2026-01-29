import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { ArrowRight, MapPin, Laptop, Check, Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | Elevated Physique Fitness',
  description: 'Transparent pricing for in-person personal training in Houston and online coaching. Choose the plan that fits your goals.',
};

const inPersonPlans = [
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: '5 sessions/week',
    price: 720,
    period: 'month',
    popular: true,
    features: [
      '5 sessions/week',
      'Hands-on coaching',
      'Priority support',
    ],
  },
  {
    id: 'elevated-physique',
    name: 'Elevated Physique',
    description: '4 sessions/week',
    price: 520,
    period: 'month',
    popular: false,
    features: [
      '4 sessions/week',
      'Structured routine',
      'Progress tracking',
    ],
  },
  {
    id: 'physique',
    name: 'Physique',
    description: '3 sessions/week',
    price: 420,
    period: 'month',
    popular: false,
    features: [
      '3 sessions/week',
      'Technique coaching',
      'Habit building',
    ],
  },
  {
    id: 'elevated',
    name: 'Elevated',
    description: '2 sessions/week',
    price: 320,
    period: 'month',
    popular: false,
    features: [
      '2 sessions/week',
      'Form fundamentals',
      'Flexible structure',
    ],
  },
];

const onlinePlans = [
  {
    id: 'unlimited',
    name: 'Unlimited',
    description: '5 days/week programming',
    price: 360,
    period: 'month',
    popular: true,
    features: [
      '5 days/week',
      'Remote guidance',
      'Full access',
    ],
  },
  {
    id: 'elevated-physique',
    name: 'Elevated Physique',
    description: '4 days/week programming',
    price: 260,
    period: 'month',
    popular: false,
    features: [
      '4 days/week',
      'Structured programming',
      'Weekly check-ins',
    ],
  },
  {
    id: 'physique',
    name: 'Physique',
    description: '3 days/week programming',
    price: 210,
    period: 'month',
    popular: false,
    features: [
      '3 days/week',
      'Progress tracking',
      'Workout library',
    ],
  },
  {
    id: 'elevated',
    name: 'Elevated',
    description: '2 days/week programming',
    price: 150,
    period: 'month',
    popular: false,
    features: [
      '2 days/week',
      'Basic support',
      'Email check-ins',
    ],
  },
];

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  popular: boolean;
  features: string[];
}

function PricingCard({ plan, type }: { plan: Plan; type: 'inperson' | 'online' }) {
  return (
    <div className={`bg-white p-6 flex flex-col h-full ${plan.popular ? 'ring-2 ring-blue-600' : 'border border-grey-200'}`}>
      {plan.popular && (
        <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 inline-block mb-3 self-start">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-xl font-bold text-black">{plan.name}</h3>
      <p className="text-grey-500 text-sm mt-1">{plan.description}</p>

      <div className="mt-4">
        <span className="text-3xl font-bold text-black">${plan.price}</span>
        <span className="text-grey-500">/{plan.period}</span>
      </div>

      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-grey-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button
          href={`/checkout/${type}/${plan.id}`}
          variant={plan.popular ? 'primary' : 'outline'}
          className="w-full"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Pricing
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Transparent Pricing.
              <span className="block text-blue-500">Real Value.</span>
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Invest in coaching that delivers results. Choose the plan that fits your
              goals and schedule.
            </p>
          </div>
        </div>
      </section>

      {/* In-Person Pricing */}
      <section id="in-person" className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">
              Houston, TX
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            In-Person Training
          </h2>
          <p className="mt-4 text-grey-600 max-w-2xl">
            Private 1-on-1 sessions at our dedicated training facility. Experience
            hands-on coaching and real-time feedback.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inPersonPlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} type="inperson" />
            ))}
          </div>
        </div>
      </section>

      {/* Online Pricing */}
      <section id="online" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Laptop className="h-6 w-6 text-blue-600" />
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">
              Train Anywhere
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Online Coaching
          </h2>
          <p className="mt-4 text-grey-600 max-w-2xl">
            Remote programming, weekly check-ins, and habit coaching for clients who
            train on their own schedule, anywhere in the world.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {onlinePlans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} type="online" />
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What's Included"
            title="Every Plan Includes"
            description="No matter which plan you choose, you get premium coaching with real accountability."
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Personalized training program',
              'Form correction & movement education',
              'Weekly accountability',
              'Progress tracking',
              'Direct access to your coach',
              'Program adjustments as you progress',
            ].map((item) => (
              <div key={item} className="bg-white p-6 flex items-center gap-4">
                <div className="w-3 h-3 bg-blue-600 flex-shrink-0" />
                <span className="text-grey-700 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button href="/membership" variant="outline">
              View All Membership Benefits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Welcome Gift Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-blue-600 mx-auto mb-6 flex items-center justify-center">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black">
              Elevated Physique Welcome Gift
            </h2>
            <p className="mt-4 text-grey-600">
              Every new client receives a welcome package to kickstart their fitness journey
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Resistance Bands', description: 'Premium bands for mobility and warm-ups' },
                { name: 'Shaker Bottle', description: 'Elevated Physique branded shaker' },
                { name: 'Welcome Note', description: 'Personalized welcome from your coach' },
                { name: 'Nutrition Guide', description: 'Foundational nutrition & meal guide' },
              ].map((item) => (
                <div key={item.name} className="bg-grey-100 p-6 text-center">
                  <div className="w-3 h-3 bg-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-black">{item.name}</h3>
                  <p className="mt-2 text-sm text-grey-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to Invest in Yourself?</h2>
          <p className="mt-6 text-grey-400 max-w-2xl mx-auto">
            Not sure which plan is right for you? Apply today and let&apos;s discuss
            which plan is the best fit for your goals, schedule, and experience level.
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
