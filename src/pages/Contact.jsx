import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'Email',
    value: 'hello@staffroom.africa',
    href: 'mailto:hello@staffroom.africa',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: 'Phone',
    value: '+234 800 000 0000',
    href: 'tel:+2348000000000',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: 'Location',
    value: 'Lagos, Nigeria',
    href: '#',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="font-sans text-gray-900 bg-[#FAF9F6] min-h-screen">
      <Navbar />

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-4 text-center animate-fade-in-up">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-3">Get in Touch</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          We'd Love to <span className="text-primary">Hear From You</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Have a question, suggestion, or partnership inquiry? Fill out the form below and our team will get back to you within 24 hours.
        </p>
      </section>

      {/* Main Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-5 gap-12">

        {/* Left — Contact Info */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in-up animation-delay-100">
          {/* Info Card */}
          <div className="bg-dark-green text-white rounded-3xl p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Contact Information</h2>
              <p className="text-emerald-200 text-sm leading-relaxed">
                Reach out anytime. We're always happy to help teachers and schools get the most out of Staffroom.
              </p>
            </div>

            <div className="space-y-5">
              {CONTACT_INFO.map(({ icon, label, value, href }) => (
                <a key={label} href={href} className="flex items-center gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">{label}</p>
                    <p className="text-white text-sm font-medium group-hover:text-primary transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social icons */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-4">Follow Us</p>
              <div className="flex items-center gap-3">
                {/* Twitter/X */}
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Have a common question?</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">Browse our frequently asked questions for quick answers.</p>
            <Link to="/#faqs" className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1">
              View FAQs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right — Contact Form */}
        <div className="lg:col-span-3 animate-fade-in-up animation-delay-200">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-7 text-sm text-primary font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-7">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-name" className="text-sm font-semibold text-gray-700">Full Name</label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-email" className="text-sm font-semibold text-gray-700">Email Address</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-subject" className="text-sm font-semibold text-gray-700">Subject</label>
                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="teacher">Teacher Support</option>
                      <option value="school">School / Admin Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="bug">Report a Bug</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="contact-message" className="text-sm font-semibold text-gray-700">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Strip */}
      <section className="bg-light-green/20 border-t border-emerald-500/5 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Join thousands of teachers and schools building better education outcomes with Staffroom.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-3.5 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/25"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
