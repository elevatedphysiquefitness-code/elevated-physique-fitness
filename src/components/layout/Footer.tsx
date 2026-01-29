import Link from 'next/link';
import { Instagram, Youtube, Mail, MapPin, Facebook, Linkedin } from 'lucide-react';

const footerLinks = {
  services: [
    { name: 'Services', href: '/services' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Membership Benefits', href: '/membership' },
    { name: 'Apply for Coaching', href: '/apply' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Policies', href: '/policies' },
    { name: 'Blog', href: '/blog' },
  ],
  connect: [
    { name: 'Contact', href: '/contact' },
    { name: 'Client Portal', href: '/dashboard' },
  ],
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/johntefit', icon: Instagram },
  { name: 'Facebook', href: 'https://facebook.com/johntefit', icon: Facebook },
  { name: 'YouTube', href: 'https://youtube.com/@johntefit', icon: Youtube },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/johntefit', icon: Linkedin },
  { name: 'Email', href: 'mailto:elevatedphysiquefitness@gmail.com', icon: Mail },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold tracking-tight uppercase">
                Elevated Physique<span className="text-blue-500">.</span>
              </span>
            </Link>
            <p className="mt-4 text-grey-400 text-sm leading-relaxed">
              Structured coaching for real transformation — in the gym and beyond.
              Building discipline that elevates your entire life.
            </p>
            <div className="mt-6 flex items-center gap-2 text-grey-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Houston, TX</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-grey-400 hover:text-blue-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-grey-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-grey-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Connect
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.connect.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-grey-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <a
                href="mailto:elevatedphysiquefitness@gmail.com"
                className="text-sm text-grey-400 hover:text-blue-500 transition-colors"
              >
                elevatedphysiquefitness@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-grey-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-grey-500 text-sm">
              &copy; {new Date().getFullYear()} Elevated Physique Fitness. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/policies"
                className="text-grey-500 hover:text-white text-sm transition-colors"
              >
                Policies
              </Link>
              <Link
                href="/contact"
                className="text-grey-500 hover:text-white text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
