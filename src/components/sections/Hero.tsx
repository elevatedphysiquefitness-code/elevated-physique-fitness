import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-grey-900 to-black" />

      {/* Subtle EP pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='40' font-family='Arial, sans-serif' font-size='32' font-weight='bold' fill='%23ffffff'%3EEP%3C/text%3E%3Ctext x='70' y='100' font-family='Arial, sans-serif' font-size='32' font-weight='bold' fill='%23ffffff'%3EEP%3C/text%3E%3C/svg%3E")`,
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
