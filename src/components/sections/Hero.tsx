import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-grey-900 to-black" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
            Premium Fitness Coaching — Houston, TX
          </p>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            Elevate Your Physique
            <span className="block text-blue-500">Elevate Your Life</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg sm:text-xl text-grey-300 max-w-2xl leading-relaxed">
            Structured coaching for real transformation — in the gym and beyond.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button href="/apply" size="lg" variant="primary">
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button href="/services" size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              View Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
