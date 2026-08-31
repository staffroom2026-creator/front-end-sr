import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SiteFooter from '../components/SiteFooter';

export default function Pricing() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className="brand-typography font-sans text-gray-900 bg-[#FAF9F6] min-h-screen flex flex-col">
      <Navbar sticky />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 py-20 text-center">

        {/* Animated construction badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary font-semibold text-sm px-4 py-2 rounded-full mb-8 animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          Page in progress
        </div>

        {/* Illustration */}
        <div className="mb-10 animate-fade-in-up">
          <div className="relative mx-auto w-48 h-48 md:w-64 md:h-64">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }}></div>
            {/* Inner ring */}
            <div className="absolute inset-6 rounded-full border-4 border-dashed border-primary/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <svg className="w-16 h-16 md:w-20 md:h-20 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5A2.5 2.5 0 016.5 2h11A2.5 2.5 0 0120 4.5v15A2.5 2.5 0 0117.5 22H6.5A2.5 2.5 0 014 19.5v-15z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="animate-fade-in-up animation-delay-100 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            Pricing Coming <span className="text-primary">Soon</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8">
            We're putting the final touches on our pricing plans. Join the waitlist and be the first to know when they go live.
          </p>
        </div>

        {/* Notify form */}
        <div className="animate-fade-in-up animation-delay-200 w-full max-w-md">
          {submitted ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-5 text-primary font-semibold flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              You're on the list! We'll notify you soon.
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
              <input
                id="pricing-notify-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/20 whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>

        {/* Preview pricing tiers */}
        <div className="animate-fade-in-up animation-delay-300 mt-20 w-full max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Planned Plans</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Free */}
            <div className="bg-white border border-gray-100 rounded-2xl p-7 text-left opacity-60 blur-[1px] hover:opacity-80 hover:blur-0 transition-all duration-300 cursor-default">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Free</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">$0<span className="text-base font-medium text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-400 mb-5">Perfect for getting started</p>
              <div className="space-y-2.5">
                {['Basic profile listing', 'Apply to 5 jobs/month', 'Email support'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Pro - highlighted */}
            <div className="relative bg-dark-green text-white border border-dark-green rounded-2xl p-7 text-left opacity-60 blur-[1px] hover:opacity-80 hover:blur-0 transition-all duration-300 cursor-default">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Pro</p>
              <p className="text-3xl font-extrabold text-white mb-1">$19<span className="text-base font-medium text-emerald-300">/mo</span></p>
              <p className="text-sm text-emerald-200 mb-5">For serious educators</p>
              <div className="space-y-2.5">
                {['Unlimited applications', 'Priority profile visibility', 'Featured in search results', 'Analytics dashboard'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-emerald-100">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* School */}
            <div className="bg-white border border-gray-100 rounded-2xl p-7 text-left opacity-60 blur-[1px] hover:opacity-80 hover:blur-0 transition-all duration-300 cursor-default">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">School</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">$49<span className="text-base font-medium text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-400 mb-5">For hiring institutions</p>
              <div className="space-y-2.5">
                {['Post unlimited jobs', 'Access full teacher profiles', 'Shortlisting tools', 'Dedicated account manager'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-5 italic">* Plans shown are illustrative and subject to change.</p>
        </div>

        {/* Back link */}
        <div className="mt-14 animate-fade-in-up animation-delay-400">
          <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>

      {/* Bottom CTA Section */}
      <section className="bg-[#D6FBC5] min-h-screen flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Ready to Find Your Next Opportunity?
          </h2>
          <p className="text-gray-600 text-sm md:text-base mb-8 max-w-2xl leading-relaxed mx-auto">
            Join a growing network of educators connecting with schools through Staffroom.
          </p>
          <Link to="/signup" className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/25">
            Sign Up
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
