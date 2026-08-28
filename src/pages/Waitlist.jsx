import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/school campus.jpg';
import teacherImg from '../assets/female_educator.png';
import schoolImg from '../assets/school_officer.png';
import BrandLogo from '../components/BrandLogo';

export default function Waitlist() {
  return (
    <div className="font-sans text-gray-900 bg-[#FAF9F6]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="School entrance background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-emerald-600/75 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-white">
              <BrandLogo />
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/for-schools" className="hover:text-white transition-colors">For schools</Link>
              <Link to="/for-teachers" className="hover:text-white transition-colors">For teachers</Link>
            </div>

            <Link
              to="/signup"
              className="hidden md:inline-block bg-white text-emerald-700 font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-black/10 transition hover:bg-emerald-50"
            >
              Sign Up
            </Link>
          </div>

          <div className="min-h-[90vh] flex flex-col items-center justify-center text-center py-20">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80 mb-4">Join the waitlist</p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white max-w-4xl leading-tight mb-6">
              Join the waitlist
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-lg text-white/85 leading-relaxed mb-10">
              Staffroom brings education recruitment into one place. Teachers can create professional profiles, discover verified opportunities, and connect with schools actively hiring. Schools can streamline recruitment, review candidates efficiently, and build stronger academic teams through a structured hiring process.
            </p>
            <Link
              to="/join-waitlist"
              className="inline-flex items-center justify-center bg-[#1CCB43] hover:bg-[#17a538] text-white font-bold px-10 py-4 rounded-full shadow-xl shadow-[#1CCB43]/30 transition-transform hover:-translate-y-0.5"
            >
              Get early access
            </Link>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mx-auto max-w-3xl mb-14">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">A better way to connect</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            A Better Way to <span className="text-emerald-600">Connect</span> Teachers and Schools
          </h2>
          <p className="mt-6 text-gray-600 text-sm md:text-base leading-relaxed">
            Staffroom brings education recruitment into one place. Teachers can create professional profiles, discover verified opportunities, and connect with schools actively hiring. Schools can streamline recruitment, review candidates efficiently, and build stronger academic teams through a structured hiring process.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Early Access',
              description: 'Be among the first to experience staffroom',
              icon: (
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ),
            },
            {
              title: 'Exclusive Updates',
              description: 'Receive product updates and launch announcements directly in your inbox.',
              icon: (
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ),
            },
            {
              title: 'Shape The Future',
              description: 'Help influence the future of education hiring through your feedback.',
              icon: (
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-3.866 0-7 3.134-7 7v1h14v-1c0-3.866-3.134-7-7-7z" />
                </svg>
              ),
            },
          ].map((card) => (
            <div key={card.title} className="bg-white border border-emerald-100 rounded-3xl p-8 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#ECFCEC] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-16">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="overflow-hidden rounded-[2rem] shadow-lg">
              <img src={teacherImg} alt="Teacher working on profile" className="w-full h-full object-cover min-h-[320px]" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">For Teachers</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                Discover Opportunities That Match Your Expertise
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Create a professional profile, access verified teaching opportunities, and connect with schools looking for qualified educators.
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-600 font-semibold mb-4">For Schools</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                Hire Qualified Teachers Faster
              </h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Post vacancies, review candidates, and simplify recruitment through a platform built specifically for education.
              </p>
            </div>
            <div className="overflow-hidden rounded-[2rem] shadow-lg order-1 lg:order-2">
              <img src={schoolImg} alt="School leader recruiting" className="w-full h-full object-cover min-h-[320px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mx-auto max-w-3xl mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Built Around <span className="text-emerald-600">Your Needs</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Verified Teaching Opportunities',
              description: 'Access trusted teaching jobs from schools actively hiring.',
            },
            {
              title: 'Professional Teacher Profiles',
              description: 'Showcase your qualifications, subjects, and experience.',
            },
            {
              title: 'Smart Job Discovery',
              description: 'Find opportunities that match your skills and location.',
            },
            {
              title: 'Streamline School Recruitment',
              description: 'Post jobs and manage applications more efficiently.',
            },
            {
              title: 'Faster Connections',
              description: 'Connect schools and teachers more quickly.',
            },
            {
              title: 'Built For Education',
              description: 'A platform designed exclusively for education hiring.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 mb-4 text-emerald-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#e9f7ea] py-20">
        <div className="absolute inset-0 opacity-20">
          <img src={heroBg} alt="Reserve your spot" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-600/70"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-6 md:px-8 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Reserve Your Spot <span className="text-emerald-200">Now</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-lg text-white/80 leading-relaxed mb-10">
            Join teachers and school leaders who are ready for a simpler, faster, and more reliable way to connect.
          </p>
          <Link
            to="/join-waitlist"
            className="inline-flex items-center justify-center bg-white text-emerald-700 font-bold px-10 py-4 rounded-full shadow-xl shadow-black/20 hover:bg-emerald-50 transition"
          >
            Get early access
          </Link>
        </div>
      </section>
    </div>
  );
}
