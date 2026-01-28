import SectionHeading from '@/components/ui/SectionHeading';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I've tried countless programs before. The difference with Elevated was the accountability—someone actually cared if I showed up. Down 35 pounds and stronger than ever.",
    name: 'Sarah M.',
    title: 'Marketing Executive',
    result: 'Lost 35 lbs in 6 months',
  },
  {
    quote: "As a complete beginner, I was intimidated by the gym. The structured approach gave me confidence and a clear path. Now I look forward to every workout.",
    name: 'James K.',
    title: 'Software Engineer',
    result: 'Gained 15 lbs of muscle',
  },
  {
    quote: "After 10 years of lifting, I thought I knew it all. Working with Elevated showed me how much I was leaving on the table. Hit PRs I never thought possible.",
    name: 'David R.',
    title: 'Business Owner',
    result: 'Broke 3-year plateau',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Success Stories"
          title="Real People. Real Results."
          description="Don't take our word for it. Here's what our clients have to say about their transformation journey."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative p-8 bg-grey-100 group hover:bg-black transition-all duration-300"
            >
              <Quote className="h-10 w-10 text-blue-600 mb-6" />

              <p className="text-grey-700 group-hover:text-grey-300 leading-relaxed transition-colors">
                &quot;{testimonial.quote}&quot;
              </p>

              <div className="mt-8 pt-6 border-t border-grey-200 group-hover:border-grey-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-black group-hover:text-white transition-colors">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-grey-500 group-hover:text-grey-400 transition-colors">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
                <div className="mt-4 inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1">
                  {testimonial.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
