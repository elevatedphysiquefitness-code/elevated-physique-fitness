import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { ArrowRight, Quote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Testimonials | Elevated Physique Fitness',
  description: 'Real results from real clients. See the transformations achieved through structured, intentional coaching at Elevated Physique Fitness.',
};

const testimonials = [
  {
    quote: "I didn't just get stronger — I became more disciplined in every part of my life. The structure changed everything.",
    name: 'Marcus T.',
    role: 'Business Professional',
    result: 'Lost 35 lbs, gained confidence',
  },
  {
    quote: "As a complete beginner, I was nervous. Johnte made me feel comfortable from day one and gave me a clear path to follow.",
    name: 'Sarah K.',
    role: 'First-time gym goer',
    result: 'Built foundation, lost 20 lbs',
  },
  {
    quote: "I've worked with trainers before, but this is different. The accountability and structure kept me consistent for the first time.",
    name: 'David R.',
    role: 'Experienced lifter',
    result: 'Broke 2-year plateau',
  },
  {
    quote: "Working 60+ hours a week, I thought I didn't have time. The flexible scheduling and efficient programming fit my life perfectly.",
    name: 'Jennifer L.',
    role: 'Healthcare Executive',
    result: 'Lost 25 lbs while working full-time',
  },
  {
    quote: "The online coaching is legit. Weekly check-ins kept me accountable even though I train at home. Best investment I've made.",
    name: 'Chris M.',
    role: 'Remote worker',
    result: 'Gained 15 lbs of muscle',
  },
  {
    quote: "Johnte doesn't just train you — he educates you. I understand why I'm doing what I'm doing, and that made all the difference.",
    name: 'Amanda S.',
    role: 'Graduate student',
    result: 'Transformed lifestyle habits',
  },
];

const transformations = [
  {
    name: 'Client Transformation 1',
    duration: '6 months',
    description: 'Complete lifestyle transformation through structured coaching.',
  },
  {
    name: 'Client Transformation 2',
    duration: '4 months',
    description: 'Fat loss and strength gains with consistent programming.',
  },
  {
    name: 'Client Transformation 3',
    duration: '8 months',
    description: 'Building muscle and discipline as a busy professional.',
  },
];

export default function TestimonialsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Testimonials
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Client Transformations
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Real results from real people who committed to the process. These aren&apos;t
              just physical transformations — they&apos;re lifestyle changes.
            </p>
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Results"
            title="Before & After"
            description="Visual proof of what structured coaching and consistent effort can achieve."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {transformations.map((item, index) => (
              <div key={index} className="bg-white">
                <div className="aspect-[3/4] bg-gradient-to-br from-grey-200 to-grey-300 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-grey-500 font-medium">Before → After</p>
                    <p className="text-grey-400 text-xs mt-2 uppercase tracking-wider">Client Photo</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-blue-600 font-semibold">{item.duration}</p>
                  <p className="mt-2 text-grey-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Quotes */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What Clients Say"
            title="In Their Own Words"
            description="Hear directly from clients who have transformed with Elevated Physique."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-grey-100 group hover:bg-black transition-all duration-300"
              >
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                <p className="text-grey-700 group-hover:text-grey-300 leading-relaxed transition-colors">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="mt-6 pt-6 border-t border-grey-200 group-hover:border-grey-800 transition-colors">
                  <p className="font-semibold text-black group-hover:text-white transition-colors">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-grey-500 group-hover:text-grey-400 transition-colors">
                    {testimonial.role}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1">
                      {testimonial.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quote */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="h-12 w-12 text-blue-500 mx-auto mb-8" />
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-relaxed">
              &quot;I didn&apos;t just get stronger — I became more disciplined in every part of my life.&quot;
            </blockquote>
            <div className="mt-8">
              <p className="text-white font-semibold">— Elevated Physique Client</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Your Transformation Is Next
          </h2>
          <p className="mt-6 text-blue-100 max-w-2xl mx-auto">
            Every one of these clients started exactly where you are. They made the
            decision to invest in themselves. Will you?
          </p>
          <div className="mt-10">
            <Button
              href="/apply"
              size="lg"
              className="bg-white text-blue-600 hover:bg-grey-100"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
