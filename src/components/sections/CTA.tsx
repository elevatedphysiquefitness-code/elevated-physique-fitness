import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-24 bg-blue-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ready to Elevate?
          </h2>
          <p className="mt-6 text-lg text-blue-100">
            Your transformation starts with a single decision. Apply today and take the first step
            toward the physique—and life—you deserve.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-grey-100"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/workout-plans"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Browse Workout Plans
            </Button>
          </div>
          <p className="mt-8 text-blue-200 text-sm">
            Limited spots available. Application required for coaching programs.
          </p>
        </div>
      </div>
    </section>
  );
}
