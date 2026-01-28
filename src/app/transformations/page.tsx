import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { ArrowRight, Quote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Client Transformations | Elevated Physique Fitness',
  description: 'Real results from real clients. See the incredible transformations achieved through our premium fitness coaching programs.',
};

const transformations = [
  {
    id: 1,
    name: 'Michael T.',
    age: 34,
    occupation: 'Finance Manager',
    duration: '6 months',
    program: 'Elevated Coaching',
    weightLost: '45 lbs',
    quote: 'The structure and accountability changed everything. For the first time in my life, I actually followed through. Down 45 pounds and feeling like a new person.',
    stats: {
      before: { weight: '225 lbs', bodyFat: '28%' },
      after: { weight: '180 lbs', bodyFat: '14%' },
    },
  },
  {
    id: 2,
    name: 'Sarah M.',
    age: 29,
    occupation: 'Marketing Executive',
    duration: '5 months',
    program: 'Elevated Coaching',
    weightLost: '35 lbs',
    quote: 'I tried countless programs before. The difference with Elevated was having someone who actually cared if I showed up. The accountability was everything.',
    stats: {
      before: { weight: '175 lbs', bodyFat: '32%' },
      after: { weight: '140 lbs', bodyFat: '20%' },
    },
  },
  {
    id: 3,
    name: 'James K.',
    age: 26,
    occupation: 'Software Engineer',
    duration: '8 months',
    program: 'Foundation Coaching',
    weightLost: '+15 lbs muscle',
    quote: 'As a complete beginner, I was intimidated by the gym. The structured approach gave me confidence. Now I look forward to every workout.',
    stats: {
      before: { weight: '145 lbs', bodyFat: '18%' },
      after: { weight: '165 lbs', bodyFat: '12%' },
    },
  },
  {
    id: 4,
    name: 'David R.',
    age: 42,
    occupation: 'Business Owner',
    duration: '4 months',
    program: 'Elite Coaching',
    weightLost: 'Broke plateau',
    quote: 'After 10 years of lifting, I thought I knew it all. Working with Elevated showed me how much I was leaving on the table. Hit PRs I never thought possible.',
    stats: {
      before: { weight: '195 lbs', bodyFat: '16%' },
      after: { weight: '190 lbs', bodyFat: '10%' },
    },
  },
  {
    id: 5,
    name: 'Emily C.',
    age: 31,
    occupation: 'Nurse',
    duration: '6 months',
    program: 'Elevated Coaching',
    weightLost: '30 lbs',
    quote: 'Working 12-hour shifts, I thought fitness was impossible. They designed a program around my crazy schedule. No excuses, just results.',
    stats: {
      before: { weight: '165 lbs', bodyFat: '30%' },
      after: { weight: '135 lbs', bodyFat: '18%' },
    },
  },
  {
    id: 6,
    name: 'Marcus L.',
    age: 38,
    occupation: 'Attorney',
    duration: '7 months',
    program: 'Elite Coaching',
    weightLost: '50 lbs',
    quote: 'The weekly calls kept me accountable even during my busiest months. Lost 50 pounds while working 70-hour weeks. Worth every penny.',
    stats: {
      before: { weight: '240 lbs', bodyFat: '32%' },
      after: { weight: '190 lbs', bodyFat: '15%' },
    },
  },
];

const stats = [
  { value: '500+', label: 'Clients Transformed' },
  { value: '15,000+', label: 'Pounds Lost' },
  { value: '98%', label: 'Success Rate' },
  { value: '4.9/5', label: 'Average Rating' },
];

export default function TransformationsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Success Stories
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Real People.
              <span className="block text-blue-500">Real Results.</span>
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              These aren&apos;t models or sponsored athletes. These are everyday people—busy
              professionals, parents, beginners—who committed to the process and transformed
              their lives.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformations Grid */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Featured Transformations"
            title="Their Journey, Your Inspiration"
            description="Every transformation started with a single decision. Read their stories and imagine yours."
          />

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {transformations.map((transformation) => (
              <div
                key={transformation.id}
                className="bg-grey-100 group hover:bg-black transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Before/After Image */}
                  <div className="h-64 md:h-auto bg-gradient-to-br from-grey-200 to-grey-300 group-hover:from-grey-700 group-hover:to-grey-800 transition-colors relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-grey-500 group-hover:text-grey-400 font-semibold text-lg">Before → After</p>
                        <p className="text-grey-400 group-hover:text-grey-500 text-xs mt-2 uppercase tracking-wider">Client Photo</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors">
                          {transformation.name}
                        </h3>
                        <p className="text-grey-500 group-hover:text-grey-400 text-sm transition-colors">
                          {transformation.age} • {transformation.occupation}
                        </p>
                      </div>
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1">
                        {transformation.weightLost}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white group-hover:bg-grey-900 transition-colors">
                        <p className="text-xs text-grey-500 group-hover:text-grey-400 uppercase tracking-wider">Before</p>
                        <p className="text-sm font-semibold text-black group-hover:text-white mt-1 transition-colors">
                          {transformation.stats.before.weight}
                        </p>
                        <p className="text-xs text-grey-500 group-hover:text-grey-400">
                          {transformation.stats.before.bodyFat} BF
                        </p>
                      </div>
                      <div className="p-3 bg-white group-hover:bg-grey-900 transition-colors">
                        <p className="text-xs text-grey-500 group-hover:text-grey-400 uppercase tracking-wider">After</p>
                        <p className="text-sm font-semibold text-black group-hover:text-white mt-1 transition-colors">
                          {transformation.stats.after.weight}
                        </p>
                        <p className="text-xs text-grey-500 group-hover:text-grey-400">
                          {transformation.stats.after.bodyFat} BF
                        </p>
                      </div>
                    </div>

                    {/* Quote */}
                    <div className="mt-4">
                      <Quote className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="text-grey-600 group-hover:text-grey-300 text-sm italic transition-colors">
                        &quot;{transformation.quote}&quot;
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="mt-4 pt-4 border-t border-grey-200 group-hover:border-grey-800 transition-colors flex justify-between text-sm">
                      <span className="text-grey-500 group-hover:text-grey-400 transition-colors">
                        {transformation.duration}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        {transformation.program}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Your Transformation is Next
          </h2>
          <p className="mt-6 text-blue-100 max-w-2xl mx-auto">
            Every one of these clients started exactly where you are now—wondering if change
            was possible. They took the first step. Will you?
          </p>
          <div className="mt-10">
            <Button
              href="/contact"
              size="lg"
              className="bg-white text-blue-600 hover:bg-grey-100"
            >
              Start Your Transformation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
