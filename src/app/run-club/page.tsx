import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { MapPin, Clock, Users, Calendar, ArrowRight, Check, Footprints } from 'lucide-react';
import AdminImageUpload from '@/components/admin/AdminImageUpload';

export const metadata: Metadata = {
  title: 'Run Club | Elevated Physique Fitness',
  description:
    'Join the Elevated Physique Run Club in Houston. Weekly group runs for all paces, community accountability, and a team that shows up every week.',
};

const runDetails = [
  {
    icon: Calendar,
    label: 'When',
    value: 'Every Saturday — 7:00 AM',
  },
  {
    icon: MapPin,
    label: 'Where',
    value: 'Houston, TX — location shared weekly',
  },
  {
    icon: Clock,
    label: 'Duration',
    value: '30–60 minutes depending on route',
  },
  {
    icon: Users,
    label: 'Who',
    value: 'All paces welcome — no one left behind',
  },
];

const whatToExpect = [
  'A structured route with distance options for different fitness levels',
  'A warm-up and cool-down led by a coach',
  'Community accountability that keeps you showing up',
  'Post-run meetup for connection and conversation',
  'Monthly challenges and milestone recognition',
  'A safe, supportive environment to build your running base',
];

const faq = [
  {
    q: 'Do I need to be a fast runner to join?',
    a: 'Not at all. We group runners by pace and no one gets left behind. Whether you walk-run or cruise at an 8-minute mile, there&apos;s a spot for you.',
  },
  {
    q: 'Is there a cost to join?',
    a: 'Run Club is free for current Elevated Physique members. Non-members can join for a small drop-in fee. Contact us for current rates.',
  },
  {
    q: 'What should I bring?',
    a: 'Running shoes, water, and a good attitude. We&apos;ll handle the route, the coaching, and the community.',
  },
  {
    q: 'What if the weather is bad?',
    a: 'We run rain or shine unless conditions are unsafe. Updates are posted to our group chat — sign up to get added.',
  },
];

export default function RunClubPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 bg-brown-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brown-300 text-sm font-semibold uppercase tracking-widest mb-6">
              Run Club
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Run With Us. Every Week.
            </h1>
            <p className="mt-8 text-xl text-brown-200 leading-relaxed">
              The Elevated Physique Run Club meets every Saturday in Houston for community
              runs open to all fitness levels. No race times, no pressure — just people
              committed to showing up and putting in the miles together.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button href="/run-club/sign-up" size="lg">
                Join the Run Club
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                href="#what-to-expect"
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brown-900"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Details */}
      <section className="py-16 bg-[#EBE4D6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {runDetails.map((detail) => (
              <div key={detail.label} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brown-700 flex items-center justify-center flex-shrink-0">
                  <detail.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-brown-600 text-xs font-semibold uppercase tracking-widest">
                    {detail.label}
                  </p>
                  <p className="mt-1 text-brown-900 font-medium">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Run Club */}
      <section className="py-24 bg-white" id="what-to-expect">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <AdminImageUpload
                imageKey="run-club-main"
                className="w-full"
                aspectRatio="aspect-[4/5]"
                alt="Elevated Physique Run Club"
                defaultImage="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80"
              />
            </div>
            <div>
              <p className="text-brown-600 text-sm font-semibold uppercase tracking-widest mb-4">
                Why We Run
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
                Built for Community. Fueled by Consistency.
              </h2>
              <p className="mt-4 text-brown-600 text-lg">
                Running is one of the most accessible ways to build cardiovascular fitness,
                mental toughness, and discipline. The Run Club was created to make it social
                — because everything is easier when you&apos;re not doing it alone.
              </p>
              <p className="mt-4 text-brown-600 text-lg">
                We rotate routes throughout Houston to keep it fresh, and every run is
                coached — meaning you&apos;ll get guidance on pacing, breathing, and building
                your base the right way, not just grinding miles.
              </p>
              <div className="mt-10">
                <Button href="/run-club/sign-up">
                  Sign Up to Join
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-24 bg-brown-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brown-300 text-sm font-semibold uppercase tracking-widest mb-4">
                What to Expect
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Every Run Is Structured. Every Runner Belongs.
              </h2>
              <p className="mt-4 text-brown-200 text-lg">
                No matter your pace or experience, you&apos;ll find your place in the group.
                Here&apos;s what a typical Saturday looks like:
              </p>
              <ul className="mt-8 space-y-4">
                {whatToExpect.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brown-400 flex-shrink-0 mt-0.5" />
                    <span
                      className="text-brown-200"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <AdminImageUpload
                imageKey="run-club-group"
                className="w-full"
                aspectRatio="aspect-[4/3]"
                alt="Run Club group photo"
                defaultImage="https://images.unsplash.com/photo-1452626212852-811d58933cae?w=800&q=80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-brown-600 text-sm font-semibold uppercase tracking-widest mb-4">
              Who It&apos;s For
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-brown-900">
              For Anyone Ready to Move
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Footprints,
                title: 'New Runners',
                description:
                  'Never run a mile in your life? Perfect. We start where you are and build from there. Walk-run intervals, slow paces, zero judgment.',
              },
              {
                icon: Users,
                title: 'Fitness Enthusiasts',
                description:
                  'Already lifting or training? Running is the cardio you&apos;ve been avoiding. Add it to your routine and watch your conditioning skyrocket.',
              },
              {
                icon: MapPin,
                title: 'Experienced Runners',
                description:
                  'Training for a race or chasing a PR? Join the faster groups, get coaching on form, and benefit from running with a team.',
              },
            ].map((card) => (
              <div key={card.title} className="p-8 border-2 border-brown-100">
                <div className="w-12 h-12 bg-brown-700 flex items-center justify-center mb-6">
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brown-900">{card.title}</h3>
                <p
                  className="mt-3 text-brown-600"
                  dangerouslySetInnerHTML={{ __html: card.description }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#EBE4D6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-brown-600 text-sm font-semibold uppercase tracking-widest mb-4">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-brown-900 mb-12">
              Common Questions
            </h2>
            <div className="space-y-8">
              {faq.map((item) => (
                <div key={item.q} className="border-b border-brown-200 pb-8">
                  <h3 className="text-lg font-semibold text-brown-900">{item.q}</h3>
                  <p
                    className="mt-2 text-brown-700"
                    dangerouslySetInnerHTML={{ __html: item.a }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brown-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Next Run Is Saturday. Will You Be There?
          </h2>
          <p className="mt-6 text-brown-200 max-w-2xl mx-auto">
            Sign up to get added to our run group chat — you&apos;ll receive the weekly
            meeting location, route details, and any updates before each run.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/run-club/sign-up"
              size="lg"
              className="bg-white text-brown-700 hover:bg-brown-100"
            >
              Join the Run Club
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/contact"
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brown-700"
            >
              Ask a Question
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
