import React from 'react';
import Navbar from '../components/Navbar';
import aboutHeroImg from '../assets/about_hero.webp';
import aboutMeetingImg from '../assets/about_meeting.webp';

export default function About() {
  return (
    <div className="brand-typography font-sans text-gray-900 bg-[#FAF9F6] min-h-screen">
      <Navbar sticky />

      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pt-10 pb-16 text-center">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-3">About us</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-10 max-w-3xl mx-auto leading-tight">
          Building a <span className="text-primary">Better Hiring System</span><br />
          for <span className="text-primary">Education</span>
        </h1>
        
        {/* Large Hero Image */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-md">
          <img 
            src={aboutHeroImg} 
            alt="Staffroom team discussing hiring solutions" 
            className="w-full h-auto object-cover max-h-[500px]" 
          />
        </div>
      </section>

      {/* The Story Behind Staffroom Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-16">
        <div className="bg-dark-green text-white p-8 md:p-12 rounded-3xl shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The Story Behind Staffroom</h2>
          <div className="space-y-6 text-emerald-50/90 text-sm md:text-base leading-relaxed max-w-4xl">
            <p>
              Staffroom is a dedicated hiring and professional networking platform designed specifically for teachers and private schools. We are building a more structured, transparent, and accessible way for qualified educators to discover opportunities and for schools to hire the right talent without unnecessary stress, delays, or uncertainty.
            </p>
            <p>
              In many cases, teaching opportunities remain scattered across informal channels, while schools struggle with inefficient recruitment processes and limited access to qualified candidates. Staffroom exists to bridge that gap by creating a focused ecosystem built entirely around education.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Rethinking Section */}
      <section className="bg-light-green/20 border-y border-emerald-500/5 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Our mission is to simplify education hiring by connecting schools with qualified teachers through a reliable and easy-to-use digital platform. We aim to create opportunities for educators, improve recruitment for schools, and contribute to a stronger education system across Africa.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                We envision a future where finding teaching opportunities and hiring qualified educators is no longer complicated, fragmented, or slow. Staffroom is working toward becoming the trusted infrastructure for education recruitment and professional growth across the continent.
              </p>
            </div>
          </div>

          {/* Rethinking How Education Hiring Works */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Rethinking How Education Hiring Works</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Education remains one of the most important sectors in society, yet the hiring process behind it is often overlooked. Teachers frequently rely on word-of-mouth opportunities, while schools spend valuable time navigating unstructured recruitment systems.
              </p>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                We saw the need for a platform built specifically for education — one that prioritizes trust, accessibility, speed, and quality. Staffroom was created to make hiring more efficient, help educators access better opportunities, and support schools in building stronger academic teams.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-sm">
              <img 
                src={aboutMeetingImg} 
                alt="Educators collaborating around a table" 
                className="w-full h-auto object-cover max-h-[350px]" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Staffroom Provides Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-12">What Staffroom Provides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">Verified teaching opportunities</span>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">Structured recruitment for schools</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">Professional teacher profiles</span>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">Simplified application process</span>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">Better visibility for educators</span>
          </div>

          {/* Card 6 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-light-green flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm md:text-base">Faster access to quality candidates</span>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-[#D6FBC5] border-t border-emerald-500/5 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Designed for the Future of Education
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Staffroom is more than a job platform. We are building a system that helps schools hire with confidence and empowers teachers to grow professionally through access to meaningful opportunities. As education continues to evolve, we believe recruitment and professional connection within the sector should evolve too.
          </p>
        </div>
      </section>
    </div>
  );
}
