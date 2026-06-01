import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { Users, Laptop, Zap, Footprints, ArrowRight, Check } from 'lucide-react';
import AdminImageUpload from '@/components/admin/AdminImageUpload';

export const metadata: Metadata = {
  title: 'Services | Elevated Physique Fitness',
  description: '1-on-1 personal training, online coaching, group fitness classes, and run club — all in Houston.',
};

const services = [
  {
    icon: Users,
    title: '1-on-1 Personal Training',
    imageKey: 'services-inperson',
    defaultImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    description: 'Private gym sessions tailored to your goals, experience level, and schedule.',
    features: [
      'Private training at a dedicated gym facility',
      'Fully customized programming for your goals',
      'Real-time form correction and coaching',
      'Flexible scheduling to fit your life',
      'Progress tracking and program adjustments',
      'Direct access to your coach between sessions',
      'Exclusive access to the Elevated Physique App',
    ],
    cta: 'View In-Person Pricing',
    href: '/pricing#in-person',
  },
  {
    icon: Laptop,
    title: 'Online Coaching',
    imageKey: 'services-online',
    defaultImage: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80',
    description: 'Remote programming, weekly check-ins, and habit coaching for clients who train on their own.',
    features: [
      'Fully customized training program',
      'Weekly video check-ins with your coach',
      'Form review and technique feedback',
      'Habit coaching and accountability',
      'Program adjustments based on progress',
      'Direct messaging support',
      'Exclusive access to the Elevated Physique App',
    ],
    cta: 'View Online Pricing',
    href: '/pricing#online',
  },
  {
    icon: Zap,
    title: 'Group Fitness',
    imageKey: 'services-group',
    defaultImage: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
    description: 'Coach-led group classes in Houston — Bootcamp, Strength & Conditioning, HIIT, and Core & Mobility. All fitness levels welcome.',
    features: [
      'Four class formats to choose from',
      'Small class sizes for personal attention',
      'Structured monthly programming',
      'Drop-in, class pack, or monthly membership options',
      'All equipment provided',
      'Modifications available for every level',
      'Community of motivated members',
    ],
    cta: 'View Group Fitness',
    href: '/group-fitness',
  },
  {
    icon: Footprints,
    title: 'Run Club',
    imageKey: 'services-runclub',
    defaultImage: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80',
    description: 'Weekly Saturday group runs in Houston open to all paces. Coach-led, community-driven, and completely beginner-friendly.',
    features: [
      'Every Saturday at 7:00 AM',
      'Rotating Houston routes',
      'Coach-led warm-up, run, and cool-down',
      'Pace groups for all fitness levels',
      'Free for current Elevated Physique members',
      'Monthly challenges and milestone recognition',
      'Post-run community meetup',
    ],
    cta: 'Learn About Run Club',
    href: '/run-club',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-brown-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brown-300 text-sm font-semibold uppercase tracking-widest mb-6">
              Services
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Coaching That Fits Your Life
            </h1>
            <p className="mt-8 text-xl text-brown-200 leading-relaxed">
              Whether you train in-person in Houston or remotely from anywhere, we have a
              program designed to help you build the physique and discipline you deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-16 h-16 bg-brown-700 flex items-center justify-center mb-6">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-brown-900">{service.title}</h2>
                  <p className="mt-4 text-brown-600 text-lg">{service.description}</p>

                  <ul className="mt-8 space-y-4">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-brown-700 flex-shrink-0 mt-0.5" />
                        <span className="text-brown-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button href={service.href} variant="primary">
                      {service.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <AdminImageUpload
                    imageKey={service.imageKey}
                    className="w-full"
                    aspectRatio="aspect-[4/3]"
                    alt={service.title}
                    defaultImage={service.defaultImage}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brown-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Not Sure Which Service Is Right for You?
          </h2>
          <p className="mt-6 text-brown-200 max-w-2xl mx-auto">
            Apply today and we&apos;ll help you find the perfect program based on your goals,
            schedule, and experience level.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/apply"
              size="lg"
              className="bg-white text-brown-700 hover:bg-brown-100"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/pricing"
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brown-700"
            >
              View All Pricing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
