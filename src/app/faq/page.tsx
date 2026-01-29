import { Metadata } from 'next';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ | Elevated Physique Fitness',
  description: 'Frequently asked questions about personal training and online coaching at Elevated Physique Fitness.',
};

const faqs = [
  {
    question: 'Do you work with beginners?',
    answer: 'Absolutely. Many of my clients start with zero gym experience. I\'ll teach you proper form, build your confidence, and create a program that meets you exactly where you are. Everyone starts somewhere — what matters is that you start.',
  },
  {
    question: 'Where do sessions take place?',
    answer: 'In-person sessions take place at a private training facility in Houston, TX. This ensures a focused environment without the distractions of a commercial gym. For online coaching, you can train at any gym or home setup that works for you.',
  },
  {
    question: 'What\'s your cancellation policy?',
    answer: 'I require at least 24 hours notice for any cancellations or reschedules. Late cancellations or no-shows are charged at the full session rate. Life happens, but consistency is key to results — this policy helps both of us stay committed.',
  },
  {
    question: 'How soon will I see results?',
    answer: 'Most clients notice improvements in energy, strength, and how they feel within the first 2-3 weeks. Visible physique changes typically appear around 4-8 weeks with consistent effort. Remember, sustainable transformation takes time — we\'re building habits for life, not quick fixes.',
  },
  {
    question: 'What should I bring to sessions?',
    answer: 'Bring yourself, a positive attitude, workout clothes, your own water bottle, and a towel. If you have any specific equipment you prefer (lifting shoes, belt, etc.), feel free to bring those as well.',
  },
  {
    question: 'Do you offer nutrition guidance?',
    answer: 'Yes, nutrition guidance is included as part of the lifestyle coaching aspect of all programs. While I\'m not a registered dietitian, I provide practical guidance on eating habits, meal structure, and nutrition principles that support your training goals.',
  },
  {
    question: 'What\'s the difference between in-person and online coaching?',
    answer: 'In-person training includes hands-on coaching during your sessions — real-time form correction, motivation, and accountability face-to-face. Online coaching provides custom programming, video check-ins, and remote accountability for clients who prefer to train independently or aren\'t local to Houston.',
  },
  {
    question: 'How long are training sessions?',
    answer: 'In-person sessions typically run 45-60 minutes, depending on your program and goals. This includes warm-up, main training, and any necessary cooldown or mobility work.',
  },
  {
    question: 'What if I need to travel for work?',
    answer: 'We\'ll work around your schedule. For extended travel, I can provide temporary programming to keep you on track. Many clients also transition to online coaching for travel periods, then return to in-person when they\'re back.',
  },
  {
    question: 'Is there a minimum commitment?',
    answer: 'While there\'s no long-term contract, transformation requires consistency. I recommend committing to at least 8-12 weeks to see meaningful results. That said, you can cancel anytime with proper notice.',
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              FAQ
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Everything you need to know about training with Elevated Physique Fitness.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-grey-100 p-6 lg:p-8"
              >
                <h3 className="text-lg font-bold text-black">
                  {faq.question}
                </h3>
                <p className="mt-4 text-grey-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Still Have Questions?
          </h2>
          <p className="mt-6 text-grey-600 max-w-2xl mx-auto">
            Don&apos;t see your question here? Reach out directly and I&apos;ll be happy to help.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" variant="primary" size="lg">
              Contact Me
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button href="/apply" variant="outline" size="lg">
              Apply for Coaching
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
