import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col bg-black">
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

      {/* Top Left Text - Right below nav bar */}
      <p className="absolute top-[88px] sm:top-[104px] left-4 sm:left-6 lg:left-8 z-20 text-sm sm:text-lg md:text-xl text-grey-300 max-w-[45%] sm:max-w-sm leading-relaxed">
        Structured coaching for real transformation — in the gym and beyond.
      </p>

      {/* Top Right Text - Right below nav bar */}
      <p className="absolute top-[88px] sm:top-[104px] right-4 sm:right-6 lg:right-8 z-20 text-biscotti text-xs sm:text-sm font-semibold uppercase tracking-widest text-right max-w-[45%] sm:max-w-xs">
        Premium Fitness Coaching — Houston, TX
      </p>

      {/* Main Content - Centered in middle of page */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40">
        <div className="text-center">
          {/* Main Headline - Brand Name */}
          <h1 className="font-[family-name:var(--font-cinzel)] tracking-wide leading-[1.1] inline-block">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
              Elevated Physique
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-biscotti mt-1 text-right">
              Fitness
            </span>
          </h1>

          {/* CTAs - Stacked vertically */}
          <div className="mt-10 flex flex-col gap-4 items-center">
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

          {/* Tagline - Below buttons */}
          <p className="mt-8 text-xl sm:text-2xl md:text-3xl font-medium text-grey-300 italic">
            Elevate Your Physique, Elevate Your Life
          </p>
        </div>
      </div>
    </section>
  );
}
