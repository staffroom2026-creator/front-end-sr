import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const navigationLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'For Schools', to: '/for-schools' },
  { label: 'For Teachers', to: '/for-teachers' },
  { label: 'Contact', to: '/contact' },
];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/staffroomng/' },
  { label: 'Instagram', href: 'https://www.instagram.com/staffroomng?igsi=YnBjOWY1NXE3cmdt&utm_source=qr' },
  { label: 'X', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'WhatsApp', href: '#' },
];

const policyLinks = [
  { label: 'Privacy Policy', to: '/terms' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/terms' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#F5FFF1] border-t border-emerald-500/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-4 md:gap-8 md:text-left">
          <div className="md:pr-8">
            <Link to="/" className="inline-flex items-center no-underline text-gray-900">
              <BrandLogo />
            </Link>
            <p className="mt-3 text-sm leading-[1.45] text-gray-500">
              Staffroom is a professional platform that connects qualified teachers with trusted private schools, making it easier for teachers to discover the right opportunities and for schools to find the right talent for their classrooms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-emerald-700">Navigation</h2>
            <nav className="mt-2 flex flex-col gap-1 text-sm text-gray-500" aria-label="Footer navigation">
              {navigationLinks.map(({ label, to }) => (
                <Link key={label} to={to} className="transition-colors hover:text-primary">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-lg font-bold text-emerald-700">Social Links</h2>
            <div className="mt-2 flex flex-col gap-1 text-sm text-gray-500">
              {socialLinks.map(({ label, href }) => (
                <a key={label} href={href} className="transition-colors hover:text-primary">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-emerald-700">Policies</h2>
            <nav className="mt-2 flex flex-col gap-1 text-sm text-gray-500" aria-label="Footer policies">
              {policyLinks.map(({ label, to }) => (
                <Link key={label} to={to} className="transition-colors hover:text-primary">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <p className="mt-16 text-center text-sm text-gray-400">&copy; 2026 Staffroom. All rights reserved</p>
      </div>
    </footer>
  );
}
