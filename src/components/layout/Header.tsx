'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Policies', href: '/policies' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#EBE4D6] border-b border-[#D4C4A8]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-28 sm:h-32 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Elevated Physique Fitness"
              width={400}
              height={400}
              className="h-24 sm:h-28 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-grey-700 hover:text-blue-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-grey-700 hover:text-[#3D2314] transition-colors border border-grey-300 px-4 py-2 hover:border-[#3D2314]"
            >
              Client Login
            </Link>
            <Link
              href="/apply"
              className="bg-[#3D2314] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#4D3324] transition-colors duration-200"
            >
              Apply for Coaching
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-grey-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-grey-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-grey-200 space-y-3">
                <Link
                  href="/login"
                  className="block bg-white text-[#3D2314] border-2 border-[#3D2314] px-6 py-3 text-center font-semibold hover:bg-[#EBE4D6] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Client Login
                </Link>
                <Link
                  href="/apply"
                  className="block bg-[#3D2314] text-white px-6 py-3 text-center font-semibold hover:bg-[#4D3324] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Apply for Coaching
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
