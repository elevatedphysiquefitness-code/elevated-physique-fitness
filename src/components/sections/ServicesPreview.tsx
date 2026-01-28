import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { Users, Package, Laptop, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Users,
    title: '1-on-1 Personal Training',
    description: 'Private gym sessions tailored to your goals, experience level, and schedule.',
  },
  {
    icon: Package,
    title: 'All-Inclusive Packages',
    description: 'Training, accountability, progress tracking, and lifestyle structure — everything you need.',
  },
  {
    icon: Laptop,
    title: 'Online Coaching',
    description: 'Remote programming, weekly check-ins, and habit coaching for clients anywhere.',
  },
];

export default function ServicesPreview() {
  return (
    <section className="py-24 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What We Offer"
          title="Coaching That Fits Your Life"
          description="Whether you train in-person or remotely, we have a program designed for your goals."
          light={true}
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="p-8 border border-grey-800 hover:border-blue-600 transition-colors"
            >
              <div className="w-14 h-14 bg-blue-600 flex items-center justify-center mb-6">
                <service.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{service.title}</h3>
              <p className="mt-4 text-grey-400 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href="/services" variant="primary" size="lg">
            Explore All Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
