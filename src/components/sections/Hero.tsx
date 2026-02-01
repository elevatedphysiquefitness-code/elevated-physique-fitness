import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-grey-900 to-black" />

      {/* Subtle EP logo pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("/ep-icon.png")`,
          backgroundSize: '80px 80px',
          backgroundRepeat: 'repeat',
          filter: 'sepia(100%) saturate(200%) brightness(1.2) hue-rotate(-10deg)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p className="text-biscotti text-sm font-semibold uppercase tracking-widest mb-6">
            Premium Fitness Coaching — Houston, TX
          </p>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            Elevate Your Physique
            <span className="block text-biscotti">Elevate Your Life</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 text-lg sm:text-xl text-grey-300 max-w-2xl leading-relaxed">
            Structured coaching for real transformation — in the gym and beyond.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="/apply"
              className="hero-cta-white inline-flex items-center justify-center px-8 py-4 font-semibold text-base"
            >
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <Button href="/services" size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-chocolate">
              View Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
