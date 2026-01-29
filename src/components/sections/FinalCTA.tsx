import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-brown-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Your Elevated Era Starts Now.
          </h2>
          <p className="mt-6 text-lg text-brown-200">
            Stop waiting for the perfect moment. The transformation you&apos;ve been looking for begins with a single decision.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/apply"
              variant="secondary"
              size="lg"
              className="bg-white text-brown-900 hover:bg-grey-100"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              href="/pricing"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-brown-900"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
