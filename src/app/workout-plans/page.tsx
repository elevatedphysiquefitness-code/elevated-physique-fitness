import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { ArrowRight, Clock, Dumbbell, Target, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workout Plans | Elevated Physique Fitness',
  description: 'Premium digital workout programs designed to build muscle, burn fat, and transform your physique. No guesswork, just results.',
};

const plans = [
  {
    id: 1,
    name: 'Foundation Builder',
    category: 'Beginner',
    duration: '12 weeks',
    frequency: '4 days/week',
    focus: 'Full Body',
    price: '49',
    description: 'The perfect starting point for beginners. Build a solid foundation with proper form and progressive overload.',
    features: ['Full exercise library with videos', 'Progressive overload built-in', 'Warm-up & cool-down routines', 'Deload weeks included'],
  },
  {
    id: 2,
    name: 'Hypertrophy Max',
    category: 'Intermediate',
    duration: '16 weeks',
    frequency: '5 days/week',
    focus: 'Muscle Building',
    price: '79',
    description: 'Advanced hypertrophy programming for maximum muscle growth. Push, Pull, Legs split with periodization.',
    features: ['PPL split design', 'Volume periodization', 'Mind-muscle connection cues', 'Intensity techniques'],
  },
  {
    id: 3,
    name: 'Shred Protocol',
    category: 'Intermediate',
    duration: '8 weeks',
    frequency: '5 days/week',
    focus: 'Fat Loss',
    price: '69',
    description: 'Strategic programming designed to preserve muscle while maximizing fat loss during a cut.',
    features: ['Muscle-preserving design', 'Metabolic conditioning', 'HIIT & steady-state cardio', 'Refeed day guidance'],
  },
  {
    id: 4,
    name: 'Strength Essentials',
    category: 'Intermediate',
    duration: '12 weeks',
    frequency: '4 days/week',
    focus: 'Strength',
    price: '69',
    description: 'Build raw strength with a focus on the big three: squat, bench, and deadlift.',
    features: ['Powerlifting-inspired', 'Percentage-based training', 'Accessory work included', 'Peak week protocol'],
  },
  {
    id: 5,
    name: 'Home Warrior',
    category: 'All Levels',
    duration: '12 weeks',
    frequency: '4-5 days/week',
    focus: 'Minimal Equipment',
    price: '59',
    description: 'No gym? No problem. Build an impressive physique with just dumbbells and resistance bands.',
    features: ['Minimal equipment needed', 'Scalable for any level', 'Space-efficient workouts', 'Progressive programming'],
  },
  {
    id: 6,
    name: 'Athletic Performance',
    category: 'Advanced',
    duration: '12 weeks',
    frequency: '5 days/week',
    focus: 'Performance',
    price: '89',
    description: 'Train like an athlete. Combine strength, power, and conditioning for peak performance.',
    features: ['Plyometric training', 'Speed & agility work', 'Sport-specific options', 'Recovery protocols'],
  },
];

const categories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export default function WorkoutPlansPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Digital Programs
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Premium Workout Plans.
              <span className="block text-blue-500">Proven Results.</span>
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Expertly designed programs that eliminate the guesswork. Each plan is built on
              proven training principles to help you build muscle, burn fat, or get stronger.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 bg-grey-100 border-b border-grey-200 sticky top-20 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    category === 'All'
                      ? 'bg-black text-white'
                      : 'bg-white text-grey-600 hover:bg-grey-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <p className="text-sm text-grey-500">
              Showing {plans.length} programs
            </p>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="group bg-grey-100 hover:bg-black transition-all duration-300 flex flex-col"
              >
                {/* Plan Image Placeholder */}
                <div className="h-48 bg-grey-300 group-hover:bg-grey-800 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Dumbbell className="h-16 w-16 text-grey-400 group-hover:text-grey-600 transition-colors" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1">
                      {plan.category}
                    </span>
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors">
                    {plan.name}
                  </h3>

                  <p className="mt-2 text-grey-600 group-hover:text-grey-400 transition-colors text-sm">
                    {plan.description}
                  </p>

                  {/* Meta Info */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-grey-500 group-hover:text-grey-400 transition-colors">
                      <Clock className="h-4 w-4" />
                      <span>{plan.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-grey-500 group-hover:text-grey-400 transition-colors">
                      <Zap className="h-4 w-4" />
                      <span>{plan.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1 text-grey-500 group-hover:text-grey-400 transition-colors">
                      <Target className="h-4 w-4" />
                      <span>{plan.focus}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-4 space-y-2 flex-grow">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-grey-600 group-hover:text-grey-400 transition-colors flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price & CTA */}
                  <div className="mt-6 pt-6 border-t border-grey-200 group-hover:border-grey-800 transition-colors flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-black group-hover:text-white transition-colors">
                        ${plan.price}
                      </span>
                      <span className="text-grey-500 group-hover:text-grey-400 transition-colors ml-1">
                        one-time
                      </span>
                    </div>
                    <Button
                      href={`/workout-plans/${plan.id}`}
                      variant="primary"
                      size="sm"
                    >
                      Get Plan
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Our Plans"
            title="What Sets Our Programs Apart"
            description="Every plan is designed with the same principles we use in our coaching programs."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8">
              <div className="w-14 h-14 bg-blue-600 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black">Evidence-Based</h3>
              <p className="mt-4 text-grey-600">
                Every program is built on proven training science—not trends or bro-science.
                Optimal volume, frequency, and intensity for your goals.
              </p>
            </div>
            <div className="bg-white p-8">
              <div className="w-14 h-14 bg-blue-600 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black">Progressive</h3>
              <p className="mt-4 text-grey-600">
                Built-in progression ensures you&apos;re always challenging yourself. No plateaus,
                just consistent improvement week after week.
              </p>
            </div>
            <div className="bg-white p-8">
              <div className="w-14 h-14 bg-blue-600 flex items-center justify-center mb-6">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black">Complete</h3>
              <p className="mt-4 text-grey-600">
                Every plan includes warm-ups, main work, accessories, and deload protocols.
                Everything you need, nothing you don&apos;t.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade CTA */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Want More Than a Program?</h2>
          <p className="mt-6 text-grey-400 max-w-2xl mx-auto">
            Our workout plans are great for self-motivated individuals. But if you want
            personalized coaching, accountability, and faster results—consider our coaching programs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/coaching" size="lg" variant="primary">
              Explore Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/contact"
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Talk to Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
