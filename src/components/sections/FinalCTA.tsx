import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-[#3D2314]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Your Elevated Era Starts Now.
          </h2>
          <p className="mt-6 text-lg text-[#D4C4A8]">
            Stop waiting for the perfect moment. The transformation you&apos;ve been looking for begins with a single decision.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/apply"
              className="hero-cta-white inline-flex items-center justify-center px-8 py-4 font-semibold text-base"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-base border-2 border-white text-white hover:bg-white hover:text-[#3D2314] transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
