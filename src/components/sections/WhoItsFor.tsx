import SectionHeading from '@/components/ui/SectionHeading';
import { Dumbbell, Briefcase, Trophy } from 'lucide-react';

const audiences = [
  {
    icon: Dumbbell,
    title: 'Beginners',
    description: 'New to fitness and overwhelmed by conflicting advice? Get a clear, proven roadmap to build your foundation right—no guesswork, just results.',
  },
  {
    icon: Briefcase,
    title: 'Busy Professionals',
    description: 'Limited time but serious about your health? Our efficient, structured programs fit your schedule while maximizing every minute in the gym.',
  },
  {
    icon: Trophy,
    title: 'Experienced Lifters',
    description: 'Hit a plateau? Ready for the next level? Advanced programming and accountability to break through barriers and reach new peaks.',
  },
];

export default function WhoItsFor() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Who This Is For"
          title="Built for Every Stage of Your Journey"
          description="Whether you're taking your first step or your thousandth, our coaching adapts to meet you where you are."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((item) => (
            <div
              key={item.title}
              className="group p-8 bg-grey-100 hover:bg-black transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                <item.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="mt-4 text-grey-600 group-hover:text-grey-400 transition-colors leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
