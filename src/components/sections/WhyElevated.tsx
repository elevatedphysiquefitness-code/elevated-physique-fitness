import SectionHeading from '@/components/ui/SectionHeading';
import { LayoutGrid, Shield, TrendingUp } from 'lucide-react';

const pillars = [
  {
    icon: LayoutGrid,
    title: 'Structure',
    description: 'Clear programming and lifestyle coaching that eliminates guesswork and builds confidence.',
  },
  {
    icon: Shield,
    title: 'Discipline',
    description: 'Weekly accountability and habit building that creates lasting change beyond the gym.',
  },
  {
    icon: TrendingUp,
    title: 'Results',
    description: 'Visible progress and long-term transformation through intentional, personalized coaching.',
  },
];

export default function WhyElevated() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Elevated Physique"
          title="The Three Pillars of Transformation"
          description="Our coaching methodology is built on the foundation of what actually creates lasting change."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group p-8 bg-grey-100 hover:bg-black transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 bg-blue-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <pillar.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black group-hover:text-white transition-colors">
                {pillar.title}
              </h3>
              <p className="mt-4 text-grey-600 group-hover:text-grey-400 transition-colors leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
