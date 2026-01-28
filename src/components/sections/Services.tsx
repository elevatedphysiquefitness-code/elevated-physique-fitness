import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { Check, ArrowRight } from 'lucide-react';

const services = [
  {
    name: 'Foundation',
    price: '197',
    period: '/month',
    description: 'For those ready to build serious habits and see real progress.',
    features: [
      'Customized workout program',
      'Nutrition guidelines',
      'Weekly check-ins',
      'Form review videos',
      'Direct messaging support',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Elevated',
    price: '347',
    period: '/month',
    description: 'Our most popular tier for committed individuals seeking transformation.',
    features: [
      'Everything in Foundation',
      'Personalized meal plans',
      'Twice-weekly check-ins',
      'Priority response time',
      'Monthly strategy calls',
      'Access to client community',
    ],
    cta: 'Apply Now',
    featured: true,
  },
  {
    name: 'Elite',
    price: '597',
    period: '/month',
    description: 'Premium 1-on-1 coaching for those who demand the best.',
    features: [
      'Everything in Elevated',
      'Daily check-ins',
      'Unlimited video reviews',
      'Weekly 1-on-1 calls',
      'Competition prep available',
      'VIP support channel',
    ],
    cta: 'Apply Now',
    featured: false,
  },
];

export default function Services() {
  return (
    <section className="py-24 bg-grey-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Coaching Programs"
          title="Choose Your Path to Transformation"
          description="Every program includes personalized coaching—not templates. Select the level of support that fits your goals."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.name}
              className={`relative p-8 ${
                service.featured
                  ? 'bg-black text-white ring-4 ring-blue-600'
                  : 'bg-white'
              }`}
            >
              {service.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 text-xs font-semibold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <h3 className={`text-lg font-semibold ${service.featured ? 'text-white' : 'text-black'}`}>
                {service.name}
              </h3>

              <div className="mt-4 flex items-baseline">
                <span className={`text-4xl font-bold ${service.featured ? 'text-white' : 'text-black'}`}>
                  ${service.price}
                </span>
                <span className={`ml-1 ${service.featured ? 'text-grey-400' : 'text-grey-500'}`}>
                  {service.period}
                </span>
              </div>

              <p className={`mt-4 text-sm ${service.featured ? 'text-grey-300' : 'text-grey-600'}`}>
                {service.description}
              </p>

              <ul className="mt-8 space-y-4">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${
                      service.featured ? 'text-blue-500' : 'text-blue-600'
                    }`} />
                    <span className={`text-sm ${
                      service.featured ? 'text-grey-300' : 'text-grey-600'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  href="/contact"
                  variant={service.featured ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {service.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
