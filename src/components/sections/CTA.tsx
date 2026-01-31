import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-[#6B4423]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ready to Elevate?
          </h2>
          <p className="mt-6 text-lg text-[#EBE4D6]">
            Your transformation starts with a single decision. Apply today and take the first step
            toward the physique—and life—you deserve.
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
              href="/workout-plans"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-base border-2 border-white text-white hover:bg-white hover:text-[#3D2314] transition-colors"
            >
              Browse Workout Plans
            </a>
          </div>
          <p className="mt-8 text-[#D4C4A8] text-sm">
            Limited spots available. Application required for coaching programs.
          </p>
        </div>
      </div>
    </section>
  );
}
