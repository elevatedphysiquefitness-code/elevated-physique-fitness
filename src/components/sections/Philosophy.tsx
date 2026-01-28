import SectionHeading from '@/components/ui/SectionHeading';
import { Target, Users, TrendingUp } from 'lucide-react';

const pillars = [
  {
    icon: Target,
    title: 'Structure',
    description: 'Clear, systematic programming that eliminates confusion and keeps you on the path to your goals.',
  },
  {
    icon: Users,
    title: 'Accountability',
    description: 'Regular check-ins and direct coaching support to keep you consistent when motivation fades.',
  },
  {
    icon: TrendingUp,
    title: 'Progression',
    description: 'Data-driven adjustments that ensure continuous improvement, not just busy work.',
  },
];

export default function Philosophy() {
  return (
    <section className="py-24 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <SectionHeading
              eyebrow="Our Philosophy"
              title="The Elevated Approach"
              centered={false}
              light={true}
            />
            <p className="mt-6 text-grey-300 text-lg leading-relaxed">
              Transformation isn&apos;t about motivation—it&apos;s about systems. We combine
              evidence-based programming with relentless accountability to create lasting change.
            </p>
            <p className="mt-4 text-grey-400 leading-relaxed">
              No cookie-cutter plans. No empty promises. Just personalized coaching that meets
              you where you are and takes you where you want to be.
            </p>

            <div className="mt-10 space-y-6">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 flex items-center justify-center">
                    <pillar.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                    <p className="mt-1 text-grey-400">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual/Stats */}
          <div className="relative">
            <div className="bg-grey-900 p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-6 border border-grey-800">
                  <p className="text-4xl lg:text-5xl font-bold text-blue-500">500+</p>
                  <p className="mt-2 text-grey-400 text-sm">Clients Transformed</p>
                </div>
                <div className="text-center p-6 border border-grey-800">
                  <p className="text-4xl lg:text-5xl font-bold text-blue-500">98%</p>
                  <p className="mt-2 text-grey-400 text-sm">Client Retention</p>
                </div>
                <div className="text-center p-6 border border-grey-800">
                  <p className="text-4xl lg:text-5xl font-bold text-blue-500">10+</p>
                  <p className="mt-2 text-grey-400 text-sm">Years Experience</p>
                </div>
                <div className="text-center p-6 border border-grey-800">
                  <p className="text-4xl lg:text-5xl font-bold text-blue-500">4.9</p>
                  <p className="mt-2 text-grey-400 text-sm">Average Rating</p>
                </div>
              </div>
              <div className="mt-8 p-6 border border-grey-800 bg-grey-800/50">
                <p className="text-grey-300 italic">
                  &quot;The structure and accountability changed everything. For the first time,
                  I actually followed through.&quot;
                </p>
                <p className="mt-4 text-sm text-grey-500">— Michael T., lost 45 lbs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
