import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Policies | Elevated Physique Fitness',
  description: 'Cancellation policy, late policy, and client expectations for Elevated Physique Fitness coaching programs.',
};

const policies = [
  {
    title: 'Cancellation Policy',
    content: [
      'All cancellations or reschedules require at least 24 hours advance notice.',
      'Cancellations made with less than 24 hours notice will be charged at the full session rate.',
      'No-shows without any notice will also be charged at the full session rate.',
      'Emergencies and illness will be handled on a case-by-case basis with reasonable consideration.',
    ],
  },
  {
    title: 'Late Policy',
    content: [
      'Sessions begin at the scheduled time. Please arrive 5-10 minutes early to prepare.',
      'If you arrive late, your session will still end at the scheduled time to respect the next client\'s booking.',
      'Excessive lateness (15+ minutes) may be treated as a late cancellation and charged accordingly.',
    ],
  },
  {
    title: 'Payment & Refund Policy',
    content: [
      'Payment is due at the beginning of each billing period (weekly, bi-weekly, or monthly).',
      'All payments are non-refundable once processed.',
      'Unused sessions do not roll over to the next billing period.',
      'If you need to pause your membership for an extended period, please discuss options in advance.',
    ],
  },
  {
    title: 'Minimum Commitment',
    content: [
      'While there is no long-term contract, I recommend committing to at least 8-12 weeks for meaningful results.',
      'Transformation requires consistency — short-term thinking leads to short-term results.',
      'You may cancel your membership at any time with one billing period\'s notice.',
    ],
  },
  {
    title: 'Client Expectations',
    content: [
      'Show up consistently and on time for scheduled sessions.',
      'Communicate openly about your progress, challenges, and any concerns.',
      'Follow the program as designed between sessions.',
      'Be honest about your adherence to nutrition and lifestyle recommendations.',
      'Give full effort during training — you get out what you put in.',
      'Respect the training facility and equipment.',
    ],
  },
  {
    title: 'Coach Expectations',
    content: [
      'Provide a fully customized, evidence-based training program.',
      'Show up prepared and on time for every session.',
      'Communicate clearly and respond to messages within 24 hours.',
      'Adjust programming based on your progress and feedback.',
      'Create a professional, focused, and supportive training environment.',
      'Treat all client information with strict confidentiality.',
    ],
  },
];

export default function PoliciesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Policies
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Policies & Expectations
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Clear expectations create successful coaching relationships. Here&apos;s what we
              both commit to.
            </p>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {policies.map((policy, index) => (
              <div key={index} className="border-b border-grey-200 pb-12 last:border-0">
                <h2 className="text-2xl font-bold text-black mb-6">
                  {policy.title}
                </h2>
                <ul className="space-y-4">
                  {policy.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 mt-2 flex-shrink-0" />
                      <span className="text-grey-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agreement Note */}
      <section className="py-16 bg-grey-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-black text-white p-8 lg:p-12">
            <h3 className="text-xl font-bold mb-4">Agreement</h3>
            <p className="text-grey-300 leading-relaxed">
              By enrolling in any Elevated Physique Fitness coaching program, you acknowledge
              that you have read, understood, and agree to abide by these policies. These
              guidelines exist to ensure a productive, respectful, and successful coaching
              relationship for everyone involved.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Ready to Commit?
          </h2>
          <p className="mt-6 text-grey-600 max-w-2xl mx-auto">
            If you&apos;re ready to show up, put in the work, and transform your physique and life,
            let&apos;s get started.
          </p>
          <div className="mt-10">
            <Button href="/apply" size="lg" variant="primary">
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
