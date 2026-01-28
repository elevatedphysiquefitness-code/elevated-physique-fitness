import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { Check, ArrowRight, MessageCircle, Video, ClipboardCheck, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Coaching Programs | Elevated Physique Fitness',
  description: 'Explore our premium 1-on-1 coaching programs designed to transform your physique with personalized workouts, nutrition, and accountability.',
};

const programs = [
  {
    name: 'Foundation',
    price: '197',
    period: '/month',
    description: 'Perfect for those ready to build serious habits and see real progress with guided support.',
    features: [
      'Fully customized workout program',
      'Nutrition guidelines & macros',
      'Weekly check-ins via app',
      'Form review videos (2/week)',
      'Direct messaging support',
      'Access to training app',
    ],
    ideal: 'Beginners looking for structure and guidance',
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Elevated',
    price: '347',
    period: '/month',
    description: 'Our signature program for committed individuals seeking complete transformation.',
    features: [
      'Everything in Foundation',
      'Personalized meal plans',
      'Twice-weekly check-ins',
      'Unlimited form reviews',
      'Priority response time (< 4 hrs)',
      'Monthly 30-min strategy call',
      'Access to client community',
    ],
    ideal: 'Busy professionals serious about results',
    cta: 'Apply Now',
    featured: true,
  },
  {
    name: 'Elite',
    price: '597',
    period: '/month',
    description: 'Premium white-glove coaching for those who demand the absolute best.',
    features: [
      'Everything in Elevated',
      'Daily check-ins & adjustments',
      'Unlimited video reviews',
      'Weekly 45-min 1-on-1 calls',
      'Competition prep available',
      'VIP support channel',
      'Quarterly in-depth assessments',
    ],
    ideal: 'Experienced lifters & competitors',
    cta: 'Apply Now',
    featured: false,
  },
];

const process = [
  {
    step: '01',
    icon: MessageCircle,
    title: 'Apply & Connect',
    description: 'Fill out our application so we can understand your goals, history, and lifestyle. We\'ll schedule a call to discuss if we\'re a good fit.',
  },
  {
    step: '02',
    icon: ClipboardCheck,
    title: 'Custom Program Design',
    description: 'Based on your assessment, we create a fully personalized training and nutrition plan tailored to your specific goals.',
  },
  {
    step: '03',
    icon: Video,
    title: 'Execute & Review',
    description: 'Start training with your custom program. Submit check-ins and form videos for feedback and real-time adjustments.',
  },
  {
    step: '04',
    icon: BarChart3,
    title: 'Progress & Evolve',
    description: 'Track your progress together. We continuously optimize your program as you advance toward your goals.',
  },
];

const faqs = [
  {
    question: 'How is this different from other online coaching?',
    answer: 'We don\'t use templates. Every program is built from scratch based on your unique situation. Plus, our accountability system ensures you actually follow through.',
  },
  {
    question: 'What if I\'m a complete beginner?',
    answer: 'Perfect! Our Foundation tier is specifically designed for beginners. We\'ll teach you proper form, build sustainable habits, and progress you safely.',
  },
  {
    question: 'How quickly will I see results?',
    answer: 'Most clients notice improvements in energy and strength within 2-3 weeks. Visible physique changes typically occur within 4-8 weeks of consistent effort.',
  },
  {
    question: 'What equipment do I need?',
    answer: 'We can design programs for any environment—home gym, commercial gym, or even bodyweight only. We work with what you have.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. We operate on a monthly basis with no long-term contracts. We earn your business every month through results.',
  },
];

export default function CoachingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              1-on-1 Coaching
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Premium Coaching.
              <span className="block text-blue-500">Real Results.</span>
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Stop wasting time on generic programs that don&apos;t work. Get personalized coaching
              that delivers the structure, accountability, and expert guidance you need to transform.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Coaching Tiers"
            title="Choose Your Level of Support"
            description="Every program includes fully customized training and nutrition. Select the level of accountability that matches your goals."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div
                key={program.name}
                className={`relative flex flex-col p-8 ${
                  program.featured
                    ? 'bg-black text-white ring-4 ring-blue-600'
                    : 'bg-white'
                }`}
              >
                {program.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 text-xs font-semibold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className={`text-xl font-bold ${program.featured ? 'text-white' : 'text-black'}`}>
                    {program.name}
                  </h3>

                  <div className="mt-4 flex items-baseline">
                    <span className={`text-5xl font-bold ${program.featured ? 'text-white' : 'text-black'}`}>
                      ${program.price}
                    </span>
                    <span className={`ml-2 ${program.featured ? 'text-grey-400' : 'text-grey-500'}`}>
                      {program.period}
                    </span>
                  </div>

                  <p className={`mt-4 ${program.featured ? 'text-grey-300' : 'text-grey-600'}`}>
                    {program.description}
                  </p>

                  <div className={`mt-6 p-3 ${program.featured ? 'bg-grey-900' : 'bg-grey-100'}`}>
                    <p className={`text-sm ${program.featured ? 'text-grey-400' : 'text-grey-500'}`}>
                      <span className="font-semibold">Ideal for:</span> {program.ideal}
                    </p>
                  </div>
                </div>

                <ul className="mt-8 space-y-4 flex-grow">
                  {program.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        program.featured ? 'text-blue-500' : 'text-blue-600'
                      }`} />
                      <span className={`text-sm ${
                        program.featured ? 'text-grey-300' : 'text-grey-600'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    href="/contact"
                    variant={program.featured ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {program.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="Your Path to Transformation"
            description="A proven system that takes you from where you are to where you want to be."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-600 flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-grey-200">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-black">{item.title}</h3>
                <p className="mt-4 text-grey-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQs"
            title="Common Questions"
            description="Everything you need to know before getting started."
          />

          <div className="mt-16 max-w-3xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-black">{faq.question}</h3>
                  <p className="mt-3 text-grey-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mt-6 text-blue-100 max-w-2xl mx-auto">
            Take the first step toward your transformation. Apply now and let&apos;s discuss how we
            can help you achieve your goals.
          </p>
          <div className="mt-10">
            <Button
              href="/contact"
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
