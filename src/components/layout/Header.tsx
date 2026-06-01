'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Policies', href: '/policies' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

const servicesDropdown = [
  { name: '1-on-1 Personal Training', href: '/services' },
  { name: 'Online Coaching', href: '/services#online' },
  { name: 'Group Fitness', href: '/group-fitness' },
  { name: 'Run Club', href: '/run-club' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#AB875F] border-b border-[#8B6D4A]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 sm:h-24 items-center justify-between">
          {/* Logo - overflows header for bigger presence */}
          <Link href="/" className="flex items-center relative -my-8">
            <Image
              src="/logo.png"
              alt="Elevated Physique Fitness"
              width={600}
              height={600}
              className="h-28 sm:h-40 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-grey-700 hover:text-blue-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-grey-700 hover:text-blue-600 transition-colors duration-200">
                Services
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white shadow-lg border border-grey-100 z-50">
                  {servicesDropdown.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-3 text-sm text-grey-700 hover:bg-[#EBE4D6] hover:text-brown-900 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navigation.slice(2).map((item) => (
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
              Client Login/Signup
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
              {navigation.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-grey-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Services group */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-grey-400 mb-2">
                  Services
                </p>
                {servicesDropdown.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block pl-3 py-1.5 text-base font-medium text-grey-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              {navigation.slice(2).map((item) => (
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
                  Client Login/Signup
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
